#!/bin/bash
# Load db/seed.cypher into Neo4j using the password already in the pod.
set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
K8S=$(command -v microk8s || true)
if [[ -z "$K8S" && -x /snap/bin/microk8s ]]; then
  K8S=/snap/bin/microk8s
fi

if [[ -z "$K8S" ]]; then
  echo "microk8s is not installed." >&2
  exit 1
fi

"$K8S" kubectl wait -n sara --for=condition=Ready pod/neo4j-0 --timeout=600s

loaded=0
for attempt in 1 2 3 4 5; do
  if "$K8S" kubectl exec -i -n sara neo4j-0 -- \
    bash -lc '/var/lib/neo4j/bin/cypher-shell -u neo4j -p "${NEO4J_AUTH#neo4j/}" --fail-fast' \
    < "$ROOT/db/seed.cypher"; then
    loaded=1
    break
  fi
  echo "Neo4j did not take the seed (attempt ${attempt}). Waiting."
  sleep 10
done
if [[ "$loaded" -ne 1 ]]; then
  echo "Could not load db/seed.cypher." >&2
  exit 1
fi
echo "Seed loaded."
