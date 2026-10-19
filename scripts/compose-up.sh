#!/bin/bash
# Start the composed site on this node. Refuses to start while the
# Kubernetes copy of the API or Neo4j is already running.
set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

if [[ ! -d /mnt/sara-usb ]]; then
  echo "USB is not mounted at /mnt/sara-usb." >&2
  exit 1
fi

if command -v microk8s >/dev/null 2>&1 || [[ -x /snap/bin/microk8s ]]; then
  K8S=$(command -v microk8s || echo /snap/bin/microk8s)
  if "$K8S" kubectl get pods -n sara -o name 2>/dev/null | grep -q .; then
    echo "Namespace sara already has Pods. Stop those before starting Compose." >&2
    echo "Neo4j does not fit twice on this Pi." >&2
    exit 1
  fi
fi

if [[ ! -f .env ]]; then
  pass=$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 20)
  printf 'NEO4J_PASSWORD=%s\n' "$pass" > .env
  chmod 600 .env
  unset pass
  echo "Wrote a Neo4j password to .env"
fi

if [[ ! -d /mnt/sara-usb/compose/neo4j ]]; then
  echo "Missing /mnt/sara-usb/compose/neo4j. Run ~/k8s/install-node.sh first." >&2
  exit 1
fi

if docker info >/dev/null 2>&1; then
  DOCKER=(docker)
elif sudo -n docker info >/dev/null 2>&1; then
  DOCKER=(sudo docker)
else
  echo "Docker is not available to this user yet." >&2
  echo "After install, open a new terminal, or run: sudo docker compose up -d" >&2
  exit 1
fi

"${DOCKER[@]}" compose up -d
"${DOCKER[@]}" compose ps
echo "Open http://127.0.0.1:8080/"
