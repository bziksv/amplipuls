#!/usr/bin/env bash
# Запускать на сервере из корня проекта:
#   bash scripts/deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Deploy amplipuls.su in $ROOT"

if command -v git >/dev/null 2>&1 && [ -d .git ]; then
  git pull origin main
fi

if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck source=/dev/null
  source "$HOME/.nvm/nvm.sh"
  nvm use 22 2>/dev/null || nvm use 22.12.0 2>/dev/null || true
fi

node -v
npm ci
npm run build

if systemctl is-active --quiet amplipuls 2>/dev/null; then
  echo "==> Restarting systemd service amplipuls"
  sudo systemctl restart amplipuls
  sudo systemctl status amplipuls --no-pager -l
else
  echo "==> Service amplipuls not found. Start manually:"
  echo "    HOST=127.0.0.1 PORT=3000 npm run start"
fi

echo "==> Done"
