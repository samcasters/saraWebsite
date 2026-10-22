# Sara's house

A small booking site on MicroK8s, built to learn the cluster while the site comes up. The step-by-step guide and the checklist are in [PLAN.md](PLAN.md).

## Start on a new machine

Clone this repo, then run:

```bash
bash scripts/startup.sh
```

That installs MicroK8s if it is missing, builds the site, creates the Neo4j password inside the cluster, and starts one web pod, one API pod, and one Neo4j pod. It asks for your sudo password. Run it again any time. It does not print the password, and it does not open ports 7474 or 7687.

The cluster screen is `~/k8s/panel` after the script links that folder. The same files are in `cluster/`.

## Pages

The live pages are in Dutch. The strings are in `web/src/i18n/nl.js`.

- `/` the house, the activities, and the booking link
- `/huis/boven`, `/huis/beneden`, `/huis/inkom`, `/huis/tuin` one area each
- `/booking` free and taken dates, and a form that saves a request

The house photos are in `content/photos/saraPhotos/housPhotos`. `demoWebPhotos` is only the design reference. The old English sample graph is still in `db/seed.cypher`.

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
