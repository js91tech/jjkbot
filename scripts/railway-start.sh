#!/bin/sh
set -e

echo "JJK-Bot starting (SERVICE=${SERVICE:-web})"
echo "DATABASE_PATH=${DATABASE_PATH:-/data/jjk.db}"

npm run db:init -w @jjk/game-core || true

if [ "$SERVICE" = "bot" ]; then
  echo "Starting Discord bot..."
  exec npm run start -w @jjk/discord-bot
fi

if [ "$SERVICE" = "api" ]; then
  echo "Starting game API..."
  exec npm run start -w @jjk/api
fi

echo "Starting web UI..."
exec npm run start -w @jjk/web
