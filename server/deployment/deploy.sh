#!/usr/bin/env bash

set -Eeuo pipefail

# Configuration

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SERVER_HOST="backend.easeinv.app"
SERVER_USER="ubuntu"
SSH_PORT="8888"

REMOTE_ROOT="/opt/easeinv/backend"
REMOTE_RELEASES="$REMOTE_ROOT/releases"
REMOTE_CURRENT="$REMOTE_ROOT/current"
REMOTE_TMP="/tmp/easeinv-backend"

ARCHIVE_NAME="release.tar.gz"
KEEP_RELEASES=5

# Helpers

log() {
    echo
    echo "==> $1"
}

die() {
    echo
    echo "ERROR: $1"
    exit 1
}

cleanup() {
    rm -f "$PROJECT_DIR/$ARCHIVE_NAME"
    rm -rf "$PROJECT_DIR/.deploy"
}

trap cleanup EXIT

# Load environment

[[ -f "$PROJECT_DIR/.env.production" ]] || die ".env.production not found in $PROJECT_DIR"

set -a
source "$PROJECT_DIR/.env.production"
set +a

# Confirmation

echo
echo "=================================================="
echo "  EaseInv Backend Deployment"
echo "=================================================="
echo "Server  : $SERVER_HOST (port $SSH_PORT)"
echo "App dir : $REMOTE_ROOT"
echo "Port    : ${PORT:-3000}"
echo

read -rp "Deploy? (y/N): " confirm

[[ "$confirm" == "y" ]] || exit 0

# Sanity check — build must exist before packaging
# Run `make build` or `npm run build` first if missing.

[[ -d "$PROJECT_DIR/dist" ]] || die "dist/ not found — run 'make build' first."
[[ -f "$PROJECT_DIR/dist/index.js" ]] || die "dist/index.js missing — run 'make build' first."

cd "$PROJECT_DIR"

# Package

log "Packaging"

mkdir -p .deploy
rm -rf .deploy/*

cp -R dist/ .deploy/dist/
cp package.json .deploy/
cp package-lock.json .deploy/

if [[ -d "public" ]]; then
    cp -R public .deploy/
fi

tar -czf "$ARCHIVE_NAME" -C .deploy .

# Upload

log "Uploading"

ssh -p "$SSH_PORT" "$SERVER_USER@$SERVER_HOST" \
    "mkdir -p '$REMOTE_TMP' '$REMOTE_RELEASES'"

scp -P "$SSH_PORT" \
    "$ARCHIVE_NAME" \
    "$SERVER_USER@$SERVER_HOST:$REMOTE_TMP/"

# Deploy

RELEASE_NAME="$(date +%Y%m%d-%H%M%S)"

log "Deploying release $RELEASE_NAME"

ssh -T -p "$SSH_PORT" "$SERVER_USER@$SERVER_HOST" <<EOF
set -Eeuo pipefail

RELEASE_DIR="$REMOTE_RELEASES/$RELEASE_NAME"

sudo -u easeinv mkdir -p "\$RELEASE_DIR"

sudo -u easeinv tar -xzf "$REMOTE_TMP/$ARCHIVE_NAME" -C "\$RELEASE_DIR"

# Install production-only dependencies inside the release directory
cd "\$RELEASE_DIR"
sudo -u easeinv env PATH="/home/easeinv/.nvm/versions/node/v24.18.0/bin:$PATH" \
npm ci --omit=dev --ignore-scripts

sudo -u easeinv ln -sfn "\$RELEASE_DIR" "$REMOTE_CURRENT"

rm -f "$REMOTE_TMP/$ARCHIVE_NAME"

sudo systemctl restart easeinv_backend.service

# Prune old releases, keeping the most recent $KEEP_RELEASES
cd "$REMOTE_RELEASES"
ls -1t | tail -n +\$(($KEEP_RELEASES + 1)) | xargs -r sudo -u easeinv rm -rf --

EOF

# Done

log "Deployment completed successfully."

echo
echo "Release : $RELEASE_NAME"
echo
