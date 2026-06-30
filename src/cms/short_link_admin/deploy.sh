#!/usr/bin/env bash
set -euo pipefail

# ============================================
# ShortLink Admin — Build & Deploy
# ============================================

# --- Configuration (edit these) ---
SERVER_USER="ubuntu"
SERVER_HOST="13.213.199.192"
SERVER_DIR="/home/ubuntu/shortlink-admin"
SSH_KEY="~/.ssh/Lightsail-ShortLink.pem"

# --- Derived ---
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SSH_OPTS=""
if [[ -n "$SSH_KEY" ]]; then
  SSH_OPTS="-i $SSH_KEY"
fi
SSH_TARGET="${SERVER_USER}@${SERVER_HOST}"

# --- Functions ---
ensure_host_key() {
  if ! ssh-keygen -F "$SERVER_HOST" &>/dev/null; then
    echo "==> Adding server host key to known_hosts..."
    ssh-keyscan -H "$SERVER_HOST" >> ~/.ssh/known_hosts 2>/dev/null
  fi
}

build() {
  echo "==> Building Next.js app locally..."
  cd "$SCRIPT_DIR"
  npm run build
  test -f "$SCRIPT_DIR/.next/BUILD_ID" || { echo "    Build failed: no .next/BUILD_ID produced."; exit 1; }
  echo "    Build complete."
}

upload() {
  ensure_host_key
  echo "==> Uploading to ${SSH_TARGET}:${SERVER_DIR}/"
  ssh $SSH_OPTS "$SSH_TARGET" "mkdir -p ${SERVER_DIR}"
  rsync -avz --delete \
    --exclude='node_modules' \
    --exclude='.git' \
    -e "ssh $SSH_OPTS" \
    "$SCRIPT_DIR/.next" \
    "$SCRIPT_DIR/public" \
    "$SCRIPT_DIR/package.json" \
    "$SCRIPT_DIR/package-lock.json" \
    "$SCRIPT_DIR/next.config.ts" \
    "$SCRIPT_DIR/prisma" \
    "${SSH_TARGET}:${SERVER_DIR}/"
  echo "==> Installing production dependencies on server..."
  ssh $SSH_OPTS "$SSH_TARGET" "cd ${SERVER_DIR} && npm install --omit=dev && npx prisma generate"
  echo "    Upload complete."
}

restart() {
  echo "==> Restarting shortlink-admin service..."
  ssh $SSH_OPTS "$SSH_TARGET" "sudo systemctl restart shortlink-admin"
  echo "    Service restarted."
}

status() {
  echo "==> Service status:"
  ssh $SSH_OPTS "$SSH_TARGET" "sudo systemctl status shortlink-admin --no-pager -l" || true
}

# --- Main ---
case "${1:-all}" in
  build)
    build
    ;;
  upload)
    upload
    ;;
  restart)
    restart
    ;;
  status)
    status
    ;;
  all)
    build
    upload
    restart
    status
    ;;
  *)
    echo "Usage: $0 {build|upload|restart|status|all}"
    exit 1
    ;;
esac
