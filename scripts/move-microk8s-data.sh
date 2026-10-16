#!/bin/bash
# Move MicroK8s' data directory onto the USB and bind-mount it back
# to the path the snap expects. Run this after MicroK8s is installed
# and before enabling add-ons or pulling images.
set -euo pipefail

SRC=/var/snap/microk8s/common
DEST=/mnt/sara-usb/microk8s-common
MOUNT=/mnt/sara-usb
BACKUP=/var/snap/microk8s/common.sd-backup

if [[ $EUID -ne 0 ]]; then
  echo "Run with sudo: sudo bash $0" >&2
  exit 1
fi

if ! findmnt -n "$MOUNT" >/dev/null 2>&1; then
  echo "USB is not mounted at $MOUNT. Run scripts/prepare-usb.sh first." >&2
  exit 1
fi

if [[ ! -d /snap/microk8s && ! -d /var/snap/microk8s ]]; then
  echo "MicroK8s is not installed yet." >&2
  exit 1
fi

K8S=$(command -v microk8s || true)
if [[ -z "$K8S" && -x /snap/bin/microk8s ]]; then
  K8S=/snap/bin/microk8s
fi

if findmnt -n "$SRC" >/dev/null 2>&1; then
  echo "$SRC is already a mount. Nothing to move."
  findmnt "$SRC"
  exit 0
fi

echo "Stopping MicroK8s so its files can move."
if [[ -n "$K8S" ]]; then
  "$K8S" stop || true
fi

mkdir -p "$DEST" "$SRC"
echo "Copying $SRC to $DEST"
cp -a "$SRC/." "$DEST/"
mv "$SRC" "$BACKUP"
mkdir -p "$SRC"
mount --bind "$DEST" "$SRC"

if ! grep -q "$DEST $SRC" /etc/fstab; then
  printf '%s\n' "$DEST $SRC none bind,nofail,x-systemd.requires-mounts-for=$MOUNT 0 0" >> /etc/fstab
fi

echo "Starting MicroK8s with data on the USB."
if [[ -n "$K8S" ]]; then
  "$K8S" start
fi

echo "Bind mount is up. After the node is Ready, remove $BACKUP to free the SD card."
findmnt "$SRC"
df -h "$MOUNT" /
