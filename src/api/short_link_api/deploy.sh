#!/usr/bin/env bash
set -euo pipefail

# ============================================
# ShortLink API — Build & Deploy
# ============================================

# --- Configuration (edit these) ---
SERVER_USER="ubuntu"
SERVER_HOST="13.213.199.192"
SERVER_DIR="/home/ubuntu/shortlink"
JAR_NAME="ShortLink-0.0.1-SNAPSHOT.jar"
SSH_KEY="~/.ssh/Lightsail-ShortLink.pem"  # e.g. "~/.ssh/lightsail.pem", leave empty to use default

# --- Derived ---
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SSH_OPTS=""
if [[ -n "$SSH_KEY" ]]; then
  SSH_OPTS="-i $SSH_KEY"
fi
SSH_TARGET="${SERVER_USER}@${SERVER_HOST}"

# --- Functions ---
build() {
  echo "==> Building JAR..."
  cd "$SCRIPT_DIR"
  ./gradlew bootJar --no-daemon -q
  echo "    Built: build/libs/${JAR_NAME}"
}

ensure_host_key() {
  if ! ssh-keygen -F "$SERVER_HOST" &>/dev/null; then
    echo "==> Adding server host key to known_hosts..."
    ssh-keyscan -H "$SERVER_HOST" >> ~/.ssh/known_hosts 2>/dev/null
  fi
}

upload() {
  ensure_host_key
  echo "==> Uploading to ${SSH_TARGET}:${SERVER_DIR}/"
  ssh $SSH_OPTS "$SSH_TARGET" "mkdir -p ${SERVER_DIR}"
  scp $SSH_OPTS "${SCRIPT_DIR}/build/libs/${JAR_NAME}" "${SSH_TARGET}:${SERVER_DIR}/${JAR_NAME}"
  echo "    Upload complete."
}

restart() {
  echo "==> Restarting shortlink service..."
  ssh $SSH_OPTS "$SSH_TARGET" "sudo systemctl restart shortlink"
  echo "    Service restarted."
}

status() {
  echo "==> Service status:"
  ssh $SSH_OPTS "$SSH_TARGET" "sudo systemctl status shortlink --no-pager -l" || true
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
