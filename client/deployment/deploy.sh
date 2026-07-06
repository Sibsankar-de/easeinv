#!/usr/bin/env bash

set -Eeuo pipefail

# Configuration

PROJECT_DIR="."

SERVER_HOST="frontend.easeinv.app"
SERVER_USER="ubuntu"
SSH_PORT="8888"

REMOTE_ROOT="/opt/easeinv/frontend"
REMOTE_RELEASES="$REMOTE_ROOT/releases"
REMOTE_CURRENT="$REMOTE_ROOT/current"
REMOTE_TMP="/tmp/easeinv"

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
    rm -f "$ARCHIVE_NAME"
    rm -rf .deploy
}

trap cleanup EXIT

# Load environment

[[ -f "$PROJECT_DIR/.env.production" ]] || die ".env.production not found."

set -a
source "$PROJECT_DIR/.env.production"
set +a

# Confirmation

echo
echo "=================================================="
echo " EaseInv Frontend Deployment"
echo "=================================================="
echo "Server : $SERVER_HOST"
echo "API    : $NEXT_PUBLIC_API_URI"
echo

read -rp "Deploy? (y/N): " confirm

[[ "$confirm" == "y" ]] || exit 0

# Build

cd "$PROJECT_DIR"

log "Installing dependencies"

npm ci

log "Building"

npm run build

[[ -d ".next/standalone" ]] || die "Standalone build not found."

# Package

log "Packaging"

mkdir -p .deploy
rm -rf .deploy/*

cp -R .next/standalone/. .deploy/

mkdir -p .deploy/.next
cp -R .next/static .deploy/.next/

if [[ -d public ]]; then
    cp -R public .deploy/
fi

# Sanity check before shipping a broken build to the server.
[[ -f ".deploy/.next/BUILD_ID" ]] || die "BUILD_ID missing from package — aborting deploy."

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

sudo -u easeinv ln -sfn "\$RELEASE_DIR" "$REMOTE_CURRENT"

rm -f "$REMOTE_TMP/$ARCHIVE_NAME"

sudo systemctl restart easeinv_frontend.service

# Prune old releases, keeping the most recent $KEEP_RELEASES
cd "$REMOTE_RELEASES"
ls -1t | tail -n +\$(($KEEP_RELEASES + 1)) | xargs -r sudo -u easeinv rm -rf --

EOF

# Done

log "Deployment completed successfully."

echo
echo "Release : $RELEASE_NAME"
echo