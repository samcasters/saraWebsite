# Sara's house

A small booking site on MicroK8s, built to learn the cluster while the site comes up. The step-by-step guide and the checklist are in [PLAN.md](PLAN.md).

## Pages

- `/` pictures of the house and a short explanation of each one
- `/activities` nearby activities
- `/booking` free and taken dates, and a form that saves a request

The pictures and activity text are sample content. English UI strings live in `web/src/i18n/en.js`. The house text lives in `db/seed.cypher`.

## Where things sit

| What | Where |
| --- | --- |
| This repo | `/home/EVE/saraWebsite` on the SD card |
| Swap file and MicroK8s data | `/mnt/sara-usb` on the USB stick |
| Neo4j password | Kubernetes Secret `sara-secret` in namespace `sara` |
| Site on the LAN | `http://10.0.0.32/` once Ingress is up |

The USB is reformatted by `scripts/prepare-usb.sh`. It only accepts the removable stick `/dev/sda` (about 32 GB, previously labeled `USB_RAPTOR`). It does not touch the SD card.

## Commands you will reuse

```bash
microk8s kubectl get nodes
microk8s kubectl get pods -A
microk8s kubectl get pods,svc,ingress -n sara
```

Open Neo4j Browser on this Pi only, while you are looking:

```bash
microk8s kubectl port-forward -n sara neo4j-0 7474:7474
```

Then open `http://127.0.0.1:7474`. That port is not published on the house LAN.
