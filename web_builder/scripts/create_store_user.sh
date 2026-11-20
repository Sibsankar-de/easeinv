#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <username> <store_home>" >&2
  exit 1
fi

USERNAME="$1"
STORE_HOME="$2"

if ! id -u "$USERNAME" >/dev/null 2>&1; then
  useradd -m -d "$STORE_HOME" -s /bin/bash "$USERNAME"
fi

mkdir -p "$STORE_HOME"

if getent group node >/dev/null 2>&1; then
  chown -R "$USERNAME:node" "$STORE_HOME"
else
  chown -R "$USERNAME:$USERNAME" "$STORE_HOME"
fi

chmod 2770 "$STORE_HOME"
