#!/bin/bash
# Load db/seed.cypher into Neo4j using the password already in the pod.
set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
K8S=$(command -v microk8s || true)
if [[ -z "$K8S" && -x /snap/bin/microk8s ]]; then
  K8S=/snap/bin/microk8s
fi

"$K8S" kubectl wait -n sara --for=condition=Ready pod/neo4j-0 --timeout=300s
"$K8S" kubectl exec -i -n sara neo4j-0 -- \
  bash -lc 'cypher-shell -u neo4j -p "${NEO4J_AUTH#neo4j/}" --fail-fast' \
  < "$ROOT/db/seed.cypher"
echo "Seed loaded."
