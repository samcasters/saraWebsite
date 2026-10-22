# Sara's house website on MicroK8s

Learning build on this Raspberry Pi. One node runs the control plane and the site. Each Kubernetes idea is looked at before the next one is added. This file is the working guide. Tick a box only after the look-command has been run.

## Where we are

The USB is mounted at `/mnt/sara-usb` (ext4, label `sara-data`) with a 1 GB swap file. MicroK8s v1.36.2 is running. Node `walle` is Ready at `10.0.0.32`. Cluster data is bind-mounted from `/mnt/sara-usb/microk8s-common`. User `EVE` is in group `microk8s`. Add-ons dns, hostpath-storage, and ingress are enabled. The control plane is the snap services `kubelite` and `k8s-dqlite`.

Namespace `sara` is up. Neo4j is the StatefulSet pod `neo4j-0`, with its disk on the USB. The API and the website are Deployments. Ingress serves the site at `http://10.0.0.32/`. Compose is stopped, so only one Neo4j is running. Its old files are still at `/mnt/sara-usb/compose/neo4j`. The private repo already has `main`.

The pages follow the design pictures in `content/photos/saraPhotos/demoWebPhotos`. The live language is Dutch, the name on the site is Vakantiehuis La Carrière, and the photographs come from `content/photos/saraPhotos/housPhotos`. Booking is the same calendar as before: a name, a date, and a short note.

Next: forward router TCP port 80 to `10.0.0.32:80`. HTTPS waits until there is a domain name.

## This machine

- Raspberry Pi 4 Model B, 4 cores, 8 GB RAM, Ubuntu 25.10 arm64.
- Desktop is on. Close heavy apps while Neo4j starts the first time.
- Memory cgroup is already on. No boot-file edit and no reboot for cgroups.
- Nothing is listening on ports 80 or 443.
- MariaDB stays on localhost:3306. It is not part of this site.
- GitHub SSH already works as **samcasters**.
- Time zone: Europe/Brussels. LAN address: `10.0.0.32`.

## The USB

The stick holds the heavy files. The git repo stays in your home folder so editing and git stay ordinary.

On the USB, mounted at `/mnt/sara-usb`:

- a 1 GB swap file
- MicroK8s' data directory (container images, the cluster database, Neo4j's disk)

On the SD card:

- Ubuntu and the MicroK8s program itself (snapd installs that on the system disk)
- `/home/EVE/saraWebsite`

Format command, after you can enter the sudo password:

```bash
sudo bash /home/EVE/saraWebsite/scripts/prepare-usb.sh --erase
```

That erases `/dev/sda` only when it is the one removable stick and its label is still `USB_RAPTOR`, then makes an ext4 filesystem named `sara-data`.

After MicroK8s is installed, and before add-ons and images:

```bash
sudo bash /home/EVE/saraWebsite/scripts/move-microk8s-data.sh
```

## What you will see in the cluster

There is one computer, so there is one Node. That Node runs the control plane and the website together.

| Idea | Where you will see it |
| --- | --- |
| Node | `kubectl get nodes`. One node, this Pi. |
| Control plane | Snap services **kubelite** (API server, scheduler, controller manager) and **k8s-dqlite** (the cluster database). Add-ons run as Pods in `kube-system`. |
| Pod | CoreDNS, ingress, Neo4j, the API, and the website. |
| Virtual network | Pod IPs on the Calico network. Separate from the house LAN. |
| Service | ClusterIP names `neo4j`, `api`, and `web`. Neo4j's Service is headless so the Pod DNS stays `neo4j-0`. |
| Ingress | `http://10.0.0.32/` to the site, `http://10.0.0.32/api/` to the API. |
| ConfigMap | Neo4j address, house name, time zone, nginx config. |
| Secret | Neo4j password, created on the Pi, not in git. |
| Volume | An 8 GB claim for Neo4j, and host folders for the API, the built site, and `content/photos`. |
| Deployment | The website and the API. One replica each. |
| StatefulSet | Neo4j, stable name `neo4j-0`, stable disk. |

Namespace: `sara`.

Memory limits: Neo4j heap 512 MB, page cache 256 MB, container limit 1536 MB. API limit 256 MB. Website limit 64 MB. Add-ons are only dns, hostpath-storage, and ingress.

## The site

React, Vite, React Router. Home, four house pages (boven, beneden, inkom, tuin), and booking. Nearby activities are a section on the home page. A booking stores a name, a date, and a short note in Neo4j. No accounts and no payment.

UI strings: `web/src/i18n/nl.js` is what the site shows. `en.js` is still in the folder.

Graph:

- `(:House)-[:HAS_PHOTO]->(:Photo)`
- `(:House)-[:NEAR]->(:Activity)`
- `(:House)-[:OFFERS]->(:Day)`
- `(:Booking)-[:ON]->(:Day)` and `(:Booking)-[:AT]->(:House)`

Pictures on the site are the files in `content/photos/saraPhotos/housPhotos`. `demoWebPhotos` is only the look reference and is not published. The Neo4j seed still has the earlier sample house text and four sample photos.

## Internet, after the LAN site works

Forward TCP port 80 on the router to `10.0.0.32` port 80. Do not forward 7474 or 7687. HTTPS waits until there is a domain name. The booking form will be open to anyone who can reach the site.

## GitHub

Private repo `git@github.com:samcasters/saraWebsite.git`. Push comes after the site is up. Real guest names and the Neo4j password stay out of git.

## Step by step

### 0. Project folder and the guide

- Folder, this file, the site, and the manifests.
- Look: `/home/EVE/saraWebsite` exists.
- Done for the files. The first git commit is the last part of this step.

### 1. USB, swap, then MicroK8s

- Run `scripts/prepare-usb.sh --erase`.
- Look: `findmnt /mnt/sara-usb` and `swapon --show`.
- `sudo snap install microk8s --classic` on the current stable channel. Write the version in the log at the bottom.
- Run `scripts/move-microk8s-data.sh` so images and disks land on the USB.
- Add user `EVE` to group `microk8s`.
- Wait until `microk8s status --wait-ready`.
- Look: `microk8s kubectl get nodes -o wide`.
- Idea: a Node is a machine in the cluster. This list has one row. The version on that row is the Kubernetes version you are learning.
- Stop if the node is not `Ready`.

### 2. The control plane, before any website

- Look: `microk8s kubectl get pods -A` and the snap services for kubelite and k8s-dqlite.
- Idea: the control plane stores and decides. The website is not part of it. On MicroK8s those programs are snap services. On many other clusters the API server is a static Pod in `kube-system`.

### 3. A Pod and the virtual network

- `microk8s kubectl apply -f k8s/namespace.yaml`
- `microk8s kubectl apply -f k8s/practice/pod.yaml`
- `microk8s kubectl apply -f k8s/practice/client.yaml`
- Look: `microk8s kubectl get pods -n sara -o wide`. Compare the Pod IP with `10.0.0.32`.
- From `practice-client`, wget the practice Pod IP.
- Idea: that IP exists only inside the cluster.
- The practice Pods are removed in the wrap-up.

### 4. A Service

- `microk8s kubectl apply -f k8s/practice/service.yaml`
- Look: `microk8s kubectl get svc -n sara` and, from the client Pod, `wget -qO- http://practice-web.sara.svc.cluster.local/`.
- Idea: the Pod IP can change. The Service name stays.

### 5. The three add-ons

- `microk8s enable dns hostpath-storage ingress`
- Look: new Pods in `kube-system`, and StorageClass `microk8s-hostpath`.
- Stop if ingress cannot bind port 80.
- If the Ingress class is not named `nginx`, fix `k8s/ingress.yaml` to the name that `kubectl get ingressclass` shows.

### 6. ConfigMap and Secret

- `microk8s kubectl apply -f k8s/configmap.yaml`
- `bash scripts/create-secret.sh`
- Look: `microk8s kubectl describe configmap -n sara sara-config` and `git status` with no real password.

### 7. Volume and StatefulSet: Neo4j

- Apply `k8s/neo4j-service.yaml` and `k8s/neo4j-statefulset.yaml`.
- Look: Pod name `neo4j-0`, PVC `Bound`, and the claim folder under the USB copy of MicroK8s data.
- `bash scripts/load-seed.sh`
- Port-forward 7474 and run a query from House to Activity.
- Idea: the StatefulSet keeps the name and the disk. A Deployment would not.
- Stop if the Pod restarts in a loop. Read the logs before changing memory.

### 8. Deployment: the API

- `npm install` in `api/` on the Pi (already done if `api/node_modules` exists).
- Apply `k8s/api-deployment.yaml` and `k8s/api-service.yaml`.
- Look: the Pod name has a random suffix. Delete the Pod and watch the Deployment start another. `wget` the Service from the client Pod: `http://api.sara.svc.cluster.local/api/health`.

### 9. Deployment: the React site

- `npm install` and `npm run build` in `web/`.
- Apply the nginx ConfigMap, the web Deployment, and the web Service.
- Look: the three pages' HTML, and a file in `content/photos` served from the Pod.

### 10. Ingress on the LAN

- Apply `k8s/ingress.yaml`.
- Look: curl `/`, `/activities` is client-side so curl `/` and `/api/house`, `/api/activities`, `/api/availability?month=YYYY-MM`, and a booking POST. A second POST for the same day is refused.
- From a phone on the LAN, open `http://10.0.0.32/` and use all three pages.

### 11. Internet

- Read the public address.
- You forward router TCP 80 to `10.0.0.32:80`.
- Look: the house page loads from a phone on mobile data.
- Write the public URL in the log below.

### 12. GitHub

- Create the empty private repo `samcasters/saraWebsite`.
- Push `main`.
- Look: GitHub shows this file and does not show a Neo4j password.

### 13. Recap

- Write the MicroK8s version, the LAN URL, the public URL, and the Neo4j data path in the log.
- Remove the practice Pods and Service.
- Commit and push the log.

## Checklist

### Setup

- [x] Folder `/home/EVE/saraWebsite` created
- [x] `PLAN.md` in the folder, this guide plus this checklist
- [x] `.gitignore` ignores secrets, `node_modules`, and build output
- [x] First local git commit
- [x] USB formatted ext4, label `sara-data`, mounted at `/mnt/sara-usb`
- [x] 1 GB swap on the USB is active
- [x] Disk free space checked before image pulls (26 GB free on the USB, 17 GB free on the SD card)

### Cluster

- [x] MicroK8s installed and the version written in the log
- [x] MicroK8s data bind-mounted from the USB
- [x] User `EVE` is in group `microk8s`
- [x] Node is `Ready`
- [x] Control plane services seen and explained
- [x] Practice Pod ran and its IP was different from `10.0.0.32`
- [x] A second Pod reached the first over the virtual network
- [x] ClusterIP Service resolved by DNS inside the cluster
- [x] Add-ons enabled: dns, hostpath-storage, ingress
- [x] No extra add-ons enabled

### Data and apps

- [x] ConfigMap applied and described
- [x] Secret created on the Pi and absent from git
- [x] Neo4j StatefulSet `neo4j-0` is Ready
- [x] PVC is Bound and the folder on the USB was found
- [x] Seed loaded: house, photos, activities, days, a few bookings
- [x] API Deployment recreated a Pod after we deleted one
- [x] API health, house, activities, availability, and booking checked
- [x] A second booking on the same day is refused
- [x] Web Deployment serves the three pages
- [x] Photo folder is mounted into the web Pod
- [x] Ingress routes `/` and `/api`
- [x] Site opened from the LAN at `http://10.0.0.32/`
- [x] UI strings are read from `web/src/i18n` (live language is `nl.js`)

### Internet

- [x] Public IP written in the log
- [ ] Router forwards TCP 80 to `10.0.0.32:80`
- [ ] Neo4j ports are not forwarded
- [ ] House page and a booking work from a phone on mobile data
- [x] HTTPS left for later, until there is a domain name

### GitHub and wrap-up

- [x] Private repo `samcasters/saraWebsite` exists
- [x] Branch pushed
- [x] Password is not in the repo
- [x] Guest names from real bookings are not committed
- [x] Version, LAN URL, public URL, and data path recorded in the log
- [x] Practice Pods removed

## Decisions

- Site name Vakantiehuis La Carrière, from the design pictures. The Neo4j sample record is still "Sara's house".
- Booking saves a name, a date, and a short note.
- Dutch UI in `nl.js`. `en.js` remains for a later switch.
- Private GitHub repo.
- One replica of each app.
- LAN first, then port 80 on the router. HTTP until there is a domain.
- Cluster data and swap on the USB. Code in `/home/EVE/saraWebsite`.

## Not in this pass

A second node, a domain name, HTTPS, accounts, email, and payments.

## Log

- 2026-10-16: Project files written. USB is plugged in as `/dev/sda` (old label `USB_RAPTOR`) and is waiting to be erased. MicroK8s version: not installed yet. LAN URL: `http://10.0.0.32/` once Ingress exists. Public URL: not set. Neo4j data path: not created yet.
- 2026-10-16: USB formatted. `/dev/sda1` is ext4 label `sara-data`, mounted at `/mnt/sara-usb`, 26 GB free. Swap file `/mnt/sara-usb/swapfile` is 1 GB and active. Control helper added at `~/k8s`. MicroK8s is not installed yet.
- 2026-10-16: Compose file added at `saraWebsite/compose.yaml` with services web, api, and neo4j. Install script is `~/k8s/install-node.sh` (Docker data-root and MicroK8s data on the USB, MicroK8s channel 1.36/stable).
- 2026-10-16: MicroK8s v1.36.2 is installed. Node `walle` is Ready, internal IP `10.0.0.32`, containerd 2.2.3. `/var/snap/microk8s/common` is a bind mount of `/mnt/sara-usb/microk8s-common`. User `EVE` is in group `microk8s`. Snap services `kubelite` (API server, scheduler, controller manager) and `k8s-dqlite` (cluster database) are active. Enabled add-ons: dns, hostpath-storage, ingress. StorageClass `microk8s-hostpath`. Ingress class `nginx` is Traefik. Helm, Helm 3, the storage alias, and the single-node datastore are built-in core entries. Dashboard, Prometheus, MetalLB, metrics-server, and cert-manager are disabled. The SD copy `/var/snap/microk8s/common.sd-backup` is still present.
- 2026-10-19: Practice Pod `practice-web` had IP `10.1.176.209`. The client Pod had IP `10.1.176.210`. Both are on the Calico network, not `10.0.0.32`. The client fetched the nginx welcome page from the Pod IP and from `http://practice-web.sara.svc.cluster.local/` (ClusterIP `10.152.183.246`).
- 2026-10-19: ConfigMap `sara-config` applied. Secret `sara-secret` created in the cluster. The password is not in git.
- 2026-10-19: Compose was stopped so Neo4j would not run twice. StatefulSet pod `neo4j-0` is Ready. PVC `data-neo4j-0` is Bound, 8Gi, folder `/mnt/sara-usb/microk8s-common/default-storage/sara-data-neo4j-0-pvc-fe929665-51f9-47cb-8c2d-d7586a97cb04`. Seed loaded. House "Sara's house" links to Canal towpath, The corner bakery, Village market, and Woodland loop.
- 2026-10-19: API Deployment replaced pod `api-5897bcbc55-99f9n` with `api-5897bcbc55-m9lhl`. From inside the cluster: health, house, activities, and October availability answered. A booking returned 201, and the same day returned 409. The test booking was deleted. Sample guest bookings remain on 2026-10-23, 2026-10-30, and 2026-11-06.
- 2026-10-19: Web Deployment serves `/`, `/activities`, and `/booking`. `/photos` in the Pod lists the four sample photos. `/photos/front.jpg` is 439622 bytes. Pages read strings through `web/src/i18n/index.js`, which loads `en.js`.
- 2026-10-19: Ingress `sara` routes `/api` to the API and `/` to the website. From this Pi, `http://10.0.0.32/` returned the house page, `/api/house` returned JSON, and `/photos/front.jpg` returned the picture. A second booking on 2026-10-22 returned 409, then that test booking was deleted. A phone on the LAN has not been tried yet.
- 2026-10-19: Public address is `91.183.41.76`. The public URL will be `http://91.183.41.76/` after the router forwards TCP 80 to `10.0.0.32:80`. Do not forward 7474 or 7687. HTTPS stays off until there is a domain name. Neo4j data path is the PVC folder above. MicroK8s version v1.36.2. LAN URL `http://10.0.0.32/`.
- 2026-10-19: Practice Pods and Service removed. Namespace `sara` now has `neo4j-0`, the API Deployment, and the web Deployment.
- 2026-10-19: Private repo https://github.com/samcasters/saraWebsite has `main` at `11d3173`. Password and test guest names are not in the repo.
- 2026-10-19: Frontend rebuilt from the design pictures. From this Pi, `http://10.0.0.32/` returned title Vakantiehuis La Carrière, `/huis/boven`, `/booking`, and `/api/health` returned 200, and `/photos/saraPhotos/housPhotos/outsideHouse1.jpg` returned the picture. There is no browser on the Pi, so the calendar was not clicked.
