#!/bin/bash
# Create the Neo4j password Secret inside the cluster.
# The password is not printed and is not written into the git repo.
set -euo pipefail

K8S=$(command -v microk8s || true)
if [[ -z "$K8S" && -x /snap/bin/microk8s ]]; then
  K8S=/snap/bin/microk8s
fi
if [[ -z "$K8S" ]]; then
  echo "microk8s is not installed." >&2
  exit 1
fi

if ! "$K8S" kubectl get namespace sara >/dev/null 2>&1; then
  echo "Namespace sara does not exist yet. Apply k8s/namespace.yaml first." >&2
  exit 1
fi

if "$K8S" kubectl get secret -n sara sara-secret >/dev/null 2>&1; then
  echo "Secret sara-secret already exists. Leaving it as it is."
  exit 0
fi

# hex avoids a SIGPIPE from `head` under `set -o pipefail`.
pass=$(openssl rand -hex 10)
"$K8S" kubectl create secret generic sara-secret -n sara \
  --from-literal=NEO4J_PASSWORD="$pass" \
  --from-literal=NEO4J_AUTH="neo4j/${pass}"
unset pass
echo "Secret sara-secret created in namespace sara."
