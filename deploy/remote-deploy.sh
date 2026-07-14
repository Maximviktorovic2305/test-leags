#!/usr/bin/env bash
set -Eeuo pipefail

if [[ $# -ne 1 || ! "$1" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Usage: remote-deploy.sh <git-sha>" >&2
  exit 2
fi

SHA="$1"
APP_ROOT="$HOME/leags"
ARCHIVE="$APP_ROOT/incoming/$SHA.tar.gz"
RELEASE="$APP_ROOT/releases/$SHA"
SHARED_ENV="$APP_ROOT/shared/.env.production"

if [[ ! -f "$ARCHIVE" ]]; then
  echo "Deployment archive is missing: $ARCHIVE" >&2
  exit 1
fi

if [[ ! -f "$SHARED_ENV" ]]; then
  echo "Server environment file is missing: $SHARED_ENV" >&2
  exit 1
fi

export NVM_DIR="$HOME/.nvm"
if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
  echo "nvm is not installed for $USER" >&2
  exit 1
fi

# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"
nvm use 24 >/dev/null

set -a
# shellcheck source=/dev/null
. "$SHARED_ENV"
set +a

rm -rf "$RELEASE"
mkdir -p "$RELEASE"
tar -xzf "$ARCHIVE" -C "$RELEASE"

pnpm --dir "$RELEASE/backend" install --frozen-lockfile
pnpm --dir "$RELEASE/frontend" install --frozen-lockfile
pnpm --dir "$RELEASE/backend" typecheck
pnpm --dir "$RELEASE/backend" prisma:migrate:deploy
pnpm --dir "$RELEASE/backend" prisma:seed
pnpm --dir "$RELEASE/backend" build
pnpm --dir "$RELEASE/frontend" typecheck
pnpm --dir "$RELEASE/frontend" build

ln -sfn "$RELEASE" "$APP_ROOT/current.next"
mv -Tf "$APP_ROOT/current.next" "$APP_ROOT/current"

pm2 delete leags-backend >/dev/null 2>&1 || true
pm2 delete leags-frontend >/dev/null 2>&1 || true
pm2 start pnpm --name leags-backend --cwd "$APP_ROOT/current/backend" -- start:prod
pm2 start pnpm --name leags-frontend --cwd "$APP_ROOT/current/frontend" -- start
pm2 save

backend_ready=false
frontend_ready=false
for _ in {1..30}; do
  if curl -fsS "http://127.0.0.1:${BACKEND_PORT:-3078}/api/health" >/dev/null; then
    backend_ready=true
  fi
  if curl -fsS "http://127.0.0.1:${FRONTEND_PORT:-3079}" >/dev/null; then
    frontend_ready=true
  fi
  if [[ "$backend_ready" == true && "$frontend_ready" == true ]]; then
    break
  fi
  sleep 2
done

if [[ "$backend_ready" != true || "$frontend_ready" != true ]]; then
  pm2 logs leags-backend leags-frontend --lines 80 --nostream || true
  echo "Deployment health check failed" >&2
  exit 1
fi

rm -f "$ARCHIVE"
find "$APP_ROOT/releases" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
  | sort -rn \
  | tail -n +4 \
  | cut -d' ' -f2- \
  | xargs -r rm -rf --

echo "Deployment $SHA completed"
