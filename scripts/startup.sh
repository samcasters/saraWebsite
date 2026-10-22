#!/bin/bash
# Start the site on a machine that just cloned this repo.
# Run from anywhere: bash scripts/startup.sh
# It asks for your sudo password when MicroK8s or Node needs installing.
# Safe to run again. It does not print the Neo4j password and does not start Compose.
set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

if [[ $EUID -eq 0 ]]; then
  echo "Run this as your normal user, not root: bash scripts/startup.sh" >&2
  exit 1
fi

USER_NAME=$(id -un)

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
if [[ "$node_major" -lt 20 ]]; then
  echo "Installing Node.js 22."
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "== MicroK8s =="
if ! command -v snap >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y snapd
fi
if ! snap list microk8s >/dev/null 2>&1; then
  sudo snap install microk8s --classic --channel=1.36/stable
fi
sudo usermod -aG microk8s "$USER_NAME"

echo "== Wait for the node =="
as_k8s "microk8s status --wait-ready"

echo "== Add-ons: dns, hostpath-storage, ingress =="
as_k8s "microk8s enable dns"
as_k8s "microk8s enable hostpath-storage"
as_k8s "microk8s enable ingress"
as_k8s "microk8s status --wait-ready"

echo "== Build the site =="
(cd "$ROOT/api" && npm ci)
(cd "$ROOT/web" && npm ci && npm run build)

apply() {
  local tmp
  tmp=$(mktemp)
  python3 - "$ROOT" "$1" "$tmp" <<'PY'
import pathlib, sys
root, src, dest = sys.argv[1:]
text = pathlib.Path(src).read_text().replace("/home/EVE/saraWebsite", root)
pathlib.Path(dest).write_text(text)
PY
  as_k8s "microk8s kubectl apply -f '$tmp'"
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
as_k8s "microk8s kubectl rollout status -n sara deploy/api --timeout=180s"
as_k8s "microk8s kubectl rollout status -n sara deploy/web --timeout=180s"

if [[ ! -e "$HOME/k8s" ]]; then
  ln -s "$ROOT/cluster" "$HOME/k8s"
  echo "Linked ~/k8s to $ROOT/cluster"
else
  echo "Left the existing ~/k8s folder in place. The panel in this clone is $ROOT/cluster/panel"
fi

if command -v ufw >/dev/null 2>&1 && sudo ufw status 2>/dev/null | grep -q "Status: active"; then
  sudo ufw allow 80/tcp
fi

address=$(hostname -I 2>/dev/null | awk '{print $1}')
echo
echo "The site is up."
if [[ -n "${address:-}" ]]; then
  echo "Open http://${address}/"
fi
echo "The cluster panel is ~/k8s/panel once this folder is linked, or $ROOT/cluster/panel"
echo "Neo4j stays inside the cluster. Ports 7474 and 7687 are not opened on the machine."
