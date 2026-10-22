# Kubernetes on this Pi

This folder is the place you control the cluster from. In the git repo it is `cluster/`. On a new machine, `scripts/startup.sh` links `~/k8s` to that folder. The website YAML lives in `k8s/` next to it. This README is the map of the ideas.

Kubernetes (often shortened to k8s) runs programs on one or more machines and keeps them running. You tell it the shape you want. It starts the programs, restarts them when they die, and gives them a network so they can find each other.

On this Pi there is one machine. That one machine does both jobs: it is the control plane, and it runs the website.

## The path of a page view

```
phone or laptop
    |
    |  http://10.0.0.32/
    v
Ingress          the door, on port 80 of the Pi
    |
    +-- /      --> Service web  --> Deployment web   (nginx + the React pages)
    |
    +-- /api   --> Service api  --> Deployment api   (the small Node server)
                                        |
                                        v
                                   Service neo4j --> StatefulSet neo4j-0
                                                     Volume: the graph data on the USB
```

A booking follows that same path. The React page calls `/api`. The API writes a Booking node in Neo4j. The pictures are files in `~/saraWebsite/content/photos`, mounted into the web Pod.

## The ideas, on this machine

**Node.** A Node is a machine in the cluster. `cluster nodes` shows one row: this Pi. A second Pi could join later and would show up as a second row. The website would not care which machine a Pod landed on, as long as a Node had room.

**Control plane.** The control plane is the set of programs that remember what you asked for and decide what to do. You talk to it with `kubectl`. It stores the desired state (the YAML you applied) and notices when the real state drifts, for example when a Pod crashes. On MicroK8s those programs are snap services named kubelite and k8s-dqlite. kubelite is the API server, the scheduler, and the controller manager packed together. k8s-dqlite is the database they write to. Many other Kubernetes installs use a database called etcd instead, often running as a Pod. The job is the same: remember the cluster. Add-ons such as DNS and Ingress run as ordinary Pods in the `kube-system` namespace. Your site runs in the `sara` namespace, so the two layers stay easy to tell apart.

**Pod.** A Pod is the smallest thing that actually runs. It is one or more containers sharing a network address and, if you ask, a disk. The API is a Pod. Neo4j is a Pod. If the process inside dies, the Pod stops, and a controller above it can start a new one. You rarely create Pods by hand for a real app. You create a Deployment or a StatefulSet, and that creates the Pods.

**Virtual network.** Every Pod gets an IP address on a network that exists only inside the cluster. On MicroK8s that network is provided by Calico. The house LAN address of this Pi is `10.0.0.32`. A Pod IP looks different, and a phone on the Wi-Fi cannot use it. Pods use it to talk to each other. Cluster DNS, from the dns add-on, turns a name like `api.sara.svc.cluster.local` into one of those addresses.

**Service.** A Pod's IP changes when the Pod is replaced. A Service is a stable name and address in front of a set of Pods. `api` always means "the current API Pod", even after a restart. We use ClusterIP services, which are reachable only inside the cluster. A NodePort would open a high port on the Pi itself. A LoadBalancer would ask a cloud for a public address. This Pi needs neither, because Ingress is the door.

**Ingress.** Ingress is the HTTP router at the edge. One process listens on port 80. Rules send `/` to the web Service and `/api` to the API Service. That is how one Pi address can serve the pages and the API without publishing Neo4j. Neo4j's ports stay on the virtual network. You can still open Neo4j Browser from the Pi with `kubectl port-forward` when you want to look at the graph.

**ConfigMap.** A ConfigMap holds settings you could say out loud: the Neo4j address, the time zone, the nginx config. Pods read it as environment variables or as a file. Changing a ConfigMap does not by itself restart a Pod. You apply the change, then restart the Pod when you want it picked up.

**Secret.** A Secret is the same kind of object as a ConfigMap, for a value you do not want in git. Here that value is the Neo4j password. Kubernetes stores it in the cluster database. `scripts/create-secret.sh` in the website repo creates it. The example file in git has `CHANGEME`, not the real password.

**Volume.** A container's own disk disappears when the container is replaced. A Volume is storage that outlives the container. Neo4j uses a PersistentVolumeClaim: a request for 8 GB, filled by the hostpath add-on, with the files on the USB stick. The website uses a simpler Volume, a hostPath, which is a folder on this Pi (`content/photos` and the built pages). A hostPath works because we have one Node. On a multi-machine cluster you would use a claim instead, so the files are not stuck on one computer.

**Deployment.** A Deployment keeps a stateless app running. Stateless means any new copy is as good as the old one, because the data lives somewhere else. The website and the API are Deployments, with one replica each so the Pi stays comfortable. The Pod name ends in a random suffix. Delete the Pod and the Deployment starts another. The Service name does not change.

**StatefulSet.** A StatefulSet is for a program that needs a stable name and its own disk. Neo4j is `neo4j-0`, and its claim stays attached to that name. That is why the database survives a restart. A Deployment would be the wrong object: the next Pod could come up with a new name and an empty disk.

## What sits where

| Path | What it is |
| --- | --- |
| `~/k8s` | This guide, and the `cluster` script |
| `~/saraWebsite` | The site, the seed data, and the YAML |
| `~/saraWebsite/PLAN.md` | The build checklist |
| `/mnt/sara-usb` | The USB stick: swap, and later the cluster's data |

The USB is an ext4 filesystem labeled `sara-data`. The SD card still holds Ubuntu and this home folder.

## The script

```bash
~/k8s/cluster
~/k8s/cluster watch
~/k8s/cluster status
~/k8s/cluster nodes
~/k8s/cluster pods
~/k8s/cluster pods -A
~/k8s/cluster svc
~/k8s/cluster ingress
~/k8s/cluster events
~/k8s/cluster logs neo4j-0
~/k8s/cluster start
~/k8s/cluster stop
```

`start` and `stop` need permission to talk to MicroK8s. Until your user is in the `microk8s` group, use `sudo microk8s start` and `sudo microk8s stop`. `stop` is the way to give the Pi its memory back when you are not using the site.

Before MicroK8s is installed, `~/k8s/cluster` still prints memory, disk, and swap, and tells you the cluster is absent.

## The panel

`~/k8s/panel` is the screen for watching and changing the cluster. Run it from your SSH session. It does not use a browser.

```bash
~/k8s/panel
```

Up and down move the highlight. Enter opens it. A number still jumps straight to that item. `q` or Ctrl+C leaves. `?` shows the keys. `r` on the menu reads the cluster again. The bottom line shows where you are in the list.

1. Live map. Pods are grouped under the node they are running on. To the right of each pod is the Service that selects it, and the Ingress path that points at that Service. The screen refreshes every 2 seconds, and it skips a redraw when nothing changed. Left and right arrows scroll a wide line, including a long pod name. `h` hides the cluster's own pods (`kube-system` and `ingress`). `/` finds text in a pod name. `r` refreshes now. `q` goes back. While you are at the bottom, new lines stay in view.
2. Scale. The list highlights a row. Enter chooses it, or type its number. `/` narrows the list. Then set how many pods that Deployment or StatefulSet should have. The count belongs to that controller. Kubernetes creates or deletes pods until the number matches. Deployments are the stateless apps. StatefulSets are the databases, and each pod gets its own disk. Cluster add-ons are locked. A database stays at one pod unless you type YES, and the warning is shown before you type it. A Deployment stops at 3 pods on this Pi. If the command fails, the menu says it was not scaled.
3. Events. Recent warnings, newest at the bottom. The view stays on the newest line until you scroll up.
4. Logs. The last lines stay on the panel, scrolled to the end. `/` finds the pod.
5. Restart. Asks for `y`, then replaces the pods. The Service name stays.
6. Why not ready. The pod's conditions, on the panel.
7. Status. `microk8s status`, on the panel.
8. Stop asks you to type `stop` before it shuts the cluster down.
9. Start brings it back and waits until the node is Ready.

Scale, restart, start, and stop clear the terminal, including the old scrollback, before they print. Press Enter and the panel comes back on a clear screen. Leaving the panel does not wipe your shell history.

The site from this cluster is `http://10.0.0.32/` on the house Wi-Fi. Compose is stopped. Leave it stopped while these pods are running. A domain is not required on the house network.

## Compose and this node

A Node is the machine. Docker is one way to run containers on that machine. Compose is a file that lists the containers that belong together and starts them as one project.

`~/saraWebsite/compose.yaml` is that list for the website. It has three services:

- `web` serves the React pages and the photos, and forwards `/api` to the API. It listens on `127.0.0.1:8080` so it does not take port 80 from Ingress.
- `api` is the Node server.
- `neo4j` is the database. Its files are `/mnt/sara-usb/compose/neo4j` on the USB stick.

```bash
~/k8s/cluster compose up -d
~/k8s/cluster compose ps
~/k8s/cluster compose logs api
~/k8s/cluster compose down
```

Kubernetes describes the same three parts with a Deployment, a Deployment, and a StatefulSet. The node runs those through MicroK8s' containerd, which is a different engine from Docker. Both engines are installed on this one node. They do not share containers.

Run one copy of the site at a time. Neo4j is large, and two of them will crowd the Pi. `scripts/compose-up.sh` refuses to start Compose while Pods exist in the `sara` namespace.

Install both with:

```bash
sudo bash ~/k8s/install-node.sh
```

That installs Docker (data on the USB), MicroK8s 1.36, moves the cluster data onto the USB, and enables dns, hostpath-storage, and ingress.
