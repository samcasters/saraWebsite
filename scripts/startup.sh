#!/bin/bash
# Start the site on a machine that just cloned this repo.
# Run from anywhere: bash scripts/startup.sh
# It asks for your sudo password when MicroK8s or Node needs installing.
# Safe to run again. It does not print the Neo4j password and does not start Compose.
# If something else already has port 80, the site is served on port 8080.
set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

if [[ $EUID -eq 0 ]]; then
  echo "Run this as your normal user, not root: bash scripts/startup.sh" >&2
  exit 1
fi

USER_NAME=$(id -un)
export PATH="/snap/bin:${PATH}"
K8S=/snap/bin/microk8s
HTTP_PORT=80
HTTPS_PORT=443

as_k8s() {
  sg microk8s -c "$*"
}

echo "== Tools =="
if ! command -v sudo >/dev/null 2>&1; then
  echo "sudo is required to install MicroK8s." >&2
  exit 1
fi
if ! command -v curl >/dev/null 2>&1 || ! command -v python3 >/dev/null 2>&1 || ! command -v openssl >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl python3 openssl
fi

node_major=0
if command -v node >/dev/null 2>&1; then
  node_major=$(node -p "process.versions.node.split('.')[0]")
fi
# Vite 6 and the API run on Node 18 or newer. Install 22 only when the machine has less.
if [[ "$node_major" -lt 18 ]]; then
  echo "Installing Node.js 22."
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
  hash -r
  node_major=$(node -p "process.versions.node.split('.')[0]")
  if [[ "$node_major" -lt 18 ]]; then
    echo "Node.js is still $(node -v). The site needs Node.js 18 or newer." >&2
    exit 1
  fi
fi

echo "== Build the site =="
(cd "$ROOT/api" && npm ci)
(cd "$ROOT/web" && npm ci && npm run build)
# Containers do not run as this user. The hostPath mounts have to be readable
# by nginx (the site) and by the node user (the API).
chmod -R a+rX "$ROOT/api" "$ROOT/web/dist" "$ROOT/content/photos"

echo "== MicroK8s =="
if ! command -v snap >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y snapd
  sudo systemctl enable --now snapd.socket
fi
for _ in $(seq 1 15); do
  snap version >/dev/null 2>&1 && break
  sleep 2
done
if ! snap version >/dev/null 2>&1; then
  echo "snapd is installed but not answering yet." >&2
  exit 1
fi
if ! snap list microk8s >/dev/null 2>&1; then
  sudo snap install microk8s --classic --channel=1.36/stable
fi
for _ in $(seq 1 30); do
  getent group microk8s >/dev/null && break
  sleep 1
done
if ! getent group microk8s >/dev/null; then
  echo "The microk8s group was not created." >&2
  exit 1
fi
if [[ ! -x "$K8S" ]]; then
  echo "microk8s is not at $K8S." >&2
  exit 1
fi
sudo usermod -aG microk8s "$USER_NAME"
if ! as_k8s "id -nG" | grep -qw microk8s; then
  echo "Could not use the microk8s group. Open a new terminal and run this again." >&2
  exit 1
fi

# Exit 0 when a process outside MicroK8s is listening on this port.
port_taken_by_someone_else() {
  sudo python3 - "$1" <<'PY'
import os, sys
port = int(sys.argv[1])

def inodes(path):
    found = set()
    try:
        fh = open(path)
    except FileNotFoundError:
        return found
    with fh:
        next(fh, None)
        for line in fh:
            parts = line.split()
            local, state, inode = parts[1], parts[3], parts[9]
            if state == "0A" and int(local.split(":")[1], 16) == port:
                found.add(inode)
    return found

want = inodes("/proc/net/tcp") | inodes("/proc/net/tcp6")
if not want:
    sys.exit(1)
for pid in os.listdir("/proc"):
    if not pid.isdigit():
        continue
    fd_dir = f"/proc/{pid}/fd"
    try:
        names = os.listdir(fd_dir)
    except (PermissionError, FileNotFoundError):
        continue
    for name in names:
        try:
            target = os.readlink(f"{fd_dir}/{name}")
        except OSError:
            continue
        if not (target.startswith("socket:[") and target[8:-1] in want):
            continue
        try:
            blob = open(f"/proc/{pid}/cgroup").read()
            blob += os.readlink(f"/proc/{pid}/exe")
        except OSError:
            blob = ""
        if "kubepods" in blob or "/snap/microk8s" in blob:
            continue
        sys.exit(0)
sys.exit(1)
PY
}

if ss -H -ltn 'sport = :80' 2>/dev/null | grep -q . && port_taken_by_someone_else 80; then
  HTTP_PORT=8080
  # 443 is moved too, or the ingress pod cannot start while that port is taken.
  HTTPS_PORT=8443
  echo "Port 80 is already in use. The site will be at http://<this-machine>:8080/"
fi

echo "== Wait for the node =="
as_k8s "$K8S start"
if ! timeout 600s sg microk8s -c "$K8S status --wait-ready"; then
  echo "The node did not become Ready within 10 minutes." >&2
  echo "Look with: sg microk8s -c '$K8S status'" >&2
  exit 1
fi

enable_addon() {
  local name=$1
  local attempt
  for attempt in 1 2 3 4 5; do
    if as_k8s "$K8S enable $name"; then
      return 0
    fi
    echo "Addon ${name} did not enable (attempt ${attempt}). Waiting."
    sleep 15
  done
  echo "Could not enable ${name}." >&2
  return 1
}

echo "== Add-ons: dns, hostpath-storage, ingress =="
enable_addon dns
enable_addon hostpath-storage
# When port 80 is busy, the stock addon still installs, then we move it to 8080.
# Do not retry that enable: a failed readiness check would just repeat the same bind.
if [[ "$HTTP_PORT" != 80 || "$HTTPS_PORT" != 443 ]]; then
  as_k8s "$K8S enable ingress" || echo "Ingress enable returned an error. Moving its ports next."
else
  enable_addon ingress
fi
as_k8s "$K8S status --wait-ready"

if [[ "$HTTP_PORT" != 80 || "$HTTPS_PORT" != 443 ]]; then
  echo "Pointing Ingress at port 8080."
  raw=$(mktemp)
  as_k8s "$K8S kubectl get daemonset -n ingress -o json" > "$raw"
  mapfile -t patched < <(HTTP_PORT="$HTTP_PORT" HTTPS_PORT="$HTTPS_PORT" python3 - "$raw" <<'PY'
import json, os, pathlib, sys
data = json.loads(pathlib.Path(sys.argv[1]).read_text())
http_port = int(os.environ["HTTP_PORT"])
https_port = int(os.environ["HTTPS_PORT"])
items = data["items"] if data.get("kind") == "List" else [data]
out = pathlib.Path(sys.argv[1] + ".d")
out.mkdir(exist_ok=True)
for item in items:
    patches = []
    containers = item["spec"]["template"]["spec"].get("containers") or []
    for i, container in enumerate(containers):
        for j, port in enumerate(container.get("ports") or []):
            host = port.get("hostPort")
            if host == 80:
                patches.append({"op": "replace", "path": f"/spec/template/spec/containers/{i}/ports/{j}/hostPort", "value": http_port})
            elif host == 443:
                patches.append({"op": "replace", "path": f"/spec/template/spec/containers/{i}/ports/{j}/hostPort", "value": https_port})
    if not patches:
        continue
    name = item["metadata"]["name"]
    (out / name).write_text(json.dumps(patches))
    print(name)
PY
  )
  if [[ ${#patched[@]} -eq 0 ]]; then
    echo "Ingress is already on port 8080."
  fi
  for name in "${patched[@]}"; do
    [[ -n "$name" ]] || continue
    as_k8s "$K8S kubectl patch daemonset -n ingress '$name' --type=json --patch-file '${raw}.d/${name}'"
  done
  rm -rf "$raw" "${raw}.d"
fi

apply() {
  local tmp
  tmp=$(mktemp)
  python3 - "$ROOT" "$1" "$tmp" <<'PY'
import pathlib, sys
root, src, dest = sys.argv[1:]
text = pathlib.Path(src).read_text().replace("/home/EVE/saraWebsite", root)
pathlib.Path(dest).write_text(text)
PY
  as_k8s "$K8S kubectl apply -f '$tmp'"
  rm -f "$tmp"
}

echo "== Apply the cluster files =="
apply "$ROOT/k8s/namespace.yaml"
apply "$ROOT/k8s/configmap.yaml"
apply "$ROOT/k8s/web-nginx-configmap.yaml"
apply "$ROOT/k8s/neo4j-service.yaml"
apply "$ROOT/k8s/api-service.yaml"
apply "$ROOT/k8s/web-service.yaml"
as_k8s "bash '$ROOT/scripts/create-secret.sh'"
apply "$ROOT/k8s/neo4j-statefulset.yaml"
apply "$ROOT/k8s/api-deployment.yaml"
apply "$ROOT/k8s/web-deployment.yaml"
apply "$ROOT/k8s/ingress.yaml"

echo "== Load the sample graph =="
as_k8s "bash '$ROOT/scripts/load-seed.sh'"
as_k8s "$K8S kubectl rollout status -n sara statefulset/neo4j --timeout=600s"
as_k8s "$K8S kubectl rollout status -n sara deploy/api --timeout=600s"
as_k8s "$K8S kubectl rollout status -n sara deploy/web --timeout=600s"

echo "== Wait for an answer on port ${HTTP_PORT} =="
site_up=0
for _ in $(seq 1 60); do
  home=$(curl -sS --max-time 3 -w '\n%{http_code}' "http://127.0.0.1:${HTTP_PORT}/" || true)
  health=$(curl -sS --max-time 3 -w '\n%{http_code}' "http://127.0.0.1:${HTTP_PORT}/api/health" || true)
  home_code=$(printf '%s\n' "$home" | tail -n 1)
  health_code=$(printf '%s\n' "$health" | tail -n 1)
  if [[ "$home_code" == "200" && "$home" == *"Vakantiehuis La Carrière"* && "$health_code" == "200" && "$health" == *'"ok":true'* ]]; then
    site_up=1
    break
  fi
  sleep 5
done
if [[ "$site_up" -ne 1 ]]; then
  echo "The site did not answer on port ${HTTP_PORT}." >&2
  as_k8s "$K8S kubectl get pods -n sara -o wide" || true
  as_k8s "$K8S kubectl get pods -n ingress -o wide" || true
  exit 1
fi

if [[ -L "$HOME/k8s" && ! -e "$HOME/k8s" ]]; then
  rm "$HOME/k8s"
fi
if [[ ! -e "$HOME/k8s" ]]; then
  ln -s "$ROOT/cluster" "$HOME/k8s"
  echo "Linked ~/k8s to $ROOT/cluster"
else
  echo "Left the existing ~/k8s folder in place. The panel in this clone is $ROOT/cluster/panel"
fi

if command -v ufw >/dev/null 2>&1 && sudo ufw status 2>/dev/null | grep -q "Status: active"; then
  sudo ufw allow "${HTTP_PORT}/tcp"
fi

address=$(hostname -I 2>/dev/null | awk '{print $1}')
echo
echo "The site is up."
if [[ -n "${address:-}" ]]; then
  if [[ "$HTTP_PORT" == 80 ]]; then
    echo "Open http://${address}/"
  else
    echo "Open http://${address}:${HTTP_PORT}/"
  fi
fi
echo "The cluster panel is ~/k8s/panel once this folder is linked, or $ROOT/cluster/panel"
echo "Neo4j stays inside the cluster. Ports 7474 and 7687 are not opened on the machine."
