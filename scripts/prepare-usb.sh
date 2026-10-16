#!/bin/bash
# Reformat the learning USB and mount it at /mnt/sara-usb.
# The SD card (mmcblk0) is never touched.
# Heavy cluster data and the swap file live on this disk.
# The git repo stays in /home/EVE/saraWebsite.
set -euo pipefail

DISK=/dev/sda
PART=/dev/sda1
MOUNT=/mnt/sara-usb

if [[ $EUID -ne 0 ]]; then
  echo "Run with sudo: sudo bash $0 --erase" >&2
  exit 1
fi

for cmd in blkid findmnt wipefs parted partprobe mkfs.ext4 mkswap; do
  command -v "$cmd" >/dev/null || { echo "Missing command: $cmd" >&2; exit 1; }
done

if [[ ! -b "$DISK" ]]; then
  echo "No $DISK. Plug in the USB stick and run this again." >&2
  exit 1
fi

if [[ "$(cat /sys/block/sda/removable)" != "1" ]]; then
  echo "$DISK is not a removable disk. Refusing." >&2
  exit 1
fi

if findmnt -n -o SOURCE / | grep -q 'sda'; then
  echo "The root filesystem is on sda. Refusing." >&2
  exit 1
fi

sectors=$(cat /sys/block/sda/size)
gib=$((sectors * 512 / 1024 / 1024 / 1024))
if (( gib < 20 || gib > 40 )); then
  echo "$DISK is ${gib}GiB. This script only accepts the ~32GB stick. Refusing." >&2
  exit 1
fi

mapfile -t sticks < <(find /sys/block -maxdepth 1 -mindepth 1 -printf '%f\n' | while read -r name; do
  [[ "$name" == loop* ]] && continue
  [[ -f "/sys/block/$name/removable" ]] || continue
  [[ "$(cat "/sys/block/$name/removable")" == "1" ]] && echo "$name"
done)
if [[ ${#sticks[@]} -ne 1 || "${sticks[0]}" != "sda" ]]; then
  echo "Expected exactly one removable disk (sda). Found: ${sticks[*]:-none}. Refusing." >&2
  exit 1
fi

current_label=""
if [[ -b "$PART" ]]; then
  current_label=$(blkid -s LABEL -o value "$PART" || true)
fi

already=0
if [[ "$current_label" == "sara-data" ]]; then
  mkdir -p "$MOUNT"
  if ! findmnt -n "$MOUNT" >/dev/null 2>&1; then
    mount "$PART" "$MOUNT"
  fi
  already=1
  echo "USB is already sara-data. Leaving the filesystem in place."
fi

if [[ "$already" -eq 0 ]]; then
  if [[ "$current_label" != "USB_RAPTOR" ]]; then
    echo "Refusing to erase $PART. Label is '${current_label:-none}', expected USB_RAPTOR." >&2
    exit 1
  fi
  if [[ "${1:-}" != "--erase" ]]; then
    echo "This will erase $DISK (label: $current_label, about ${gib}GiB) and format it as ext4." >&2
    echo "Run: sudo bash $0 --erase" >&2
    exit 1
  fi

  echo "Erasing $DISK (old label: $current_label) and creating ext4 label sara-data."
  umount "$PART" 2>/dev/null || true
  umount "$MOUNT" 2>/dev/null || true
  if [[ -b "$PART" ]]; then
    wipefs -a "$PART" || true
  fi
  wipefs -a "$DISK"
  parted -s "$DISK" mklabel gpt
  parted -s "$DISK" mkpart sara ext4 1MiB 100%
  partprobe "$DISK" || true
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    [[ -b "$PART" ]] && break
    sleep 1
  done
  [[ -b "$PART" ]] || { echo "Partition $PART did not appear." >&2; exit 1; }
  mkfs.ext4 -F -L sara-data "$PART"
  mkdir -p "$MOUNT"
  mount "$PART" "$MOUNT"
fi

mkdir -p "$MOUNT/microk8s-common"
if [[ ! -f "$MOUNT/swapfile" ]]; then
  fallocate -l 1G "$MOUNT/swapfile"
  chmod 600 "$MOUNT/swapfile"
  mkswap "$MOUNT/swapfile"
fi
swapon "$MOUNT/swapfile" 2>/dev/null || true

uuid=$(blkid -s UUID -o value "$PART")
if ! grep -q "UUID=$uuid" /etc/fstab; then
  printf '%s\n' "UUID=$uuid $MOUNT ext4 defaults,noatime,nofail,x-systemd.device-timeout=10 0 2" >> /etc/fstab
fi
if ! grep -q "$MOUNT/swapfile" /etc/fstab; then
  printf '%s\n' "$MOUNT/swapfile none swap sw,nofail 0 0" >> /etc/fstab
fi

echo "USB ready."
findmnt "$MOUNT"
swapon --show
df -h "$MOUNT"
