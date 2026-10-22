#!/bin/bash
# Install Docker Compose and MicroK8s on this Pi.
# Docker's files and MicroK8s' data go on the USB stick.
# Safe to run again.
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run: sudo bash $0" >&2
  exit 1
fi

MOUNT=/mnt/sara-usb
if ! findmnt -n "$MOUNT" >/dev/null 2>&1; then
  echo "USB is not mounted at $MOUNT. Run scripts/prepare-usb.sh first." >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "== Docker =="
apt-get update
apt-get install -y docker.io docker-compose-v2

mkdir -p "$MOUNT/docker" "$MOUNT/compose/neo4j"
chown 7474:7474 "$MOUNT/compose/neo4j"

mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<EOF
{
  "data-root": "$MOUNT/docker",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

systemctl enable docker
systemctl restart docker
docker info -f 'Docker data root: {{.DockerRootDir}}'

if ! getent group docker >/dev/null; then
  groupadd docker
fi
usermod -aG docker EVE

echo "== MicroK8s 1.36 =="
if ! snap list microk8s >/dev/null 2>&1; then
  snap install microk8s --classic --channel=1.36/stable
else
  echo "MicroK8s is already installed."
fi

usermod -aG microk8s EVE

echo "== Move cluster data onto the USB =="
REPO=$(cd "$(dirname "$0")/.." && pwd)
bash "$REPO/scripts/move-microk8s-data.sh"

echo "== Wait for the node =="
microk8s status --wait-ready
microk8s kubectl get nodes -o wide

echo "== Add-ons: dns, hostpath-storage, ingress =="
microk8s enable dns
microk8s enable hostpath-storage
microk8s enable ingress
microk8s status --wait-ready

echo "== Versions =="
microk8s version
docker --version
docker compose version
microk8s kubectl get nodes -o wide
microk8s kubectl get pods -A

echo "Install finished."
echo "EVE is in groups docker and microk8s. New terminals pick that up."
echo "Until then: sg microk8s -c 'microk8s kubectl get nodes'"
