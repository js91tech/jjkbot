#!/bin/sh
set -e

echo "JJK-Bot starting (SERVICE=${SERVICE:-web})"
echo "DATABASE_PATH=${DATABASE_PATH:-/data/jjk.db}"

npm run db:init -w @jjk/game-core || true

if [ "$SERVICE" = "bot" ]; then
  echo "Starting Discord bot..."
  exec npm run start:bot -w @jjk/discord-bot
fi

echo "Starting web UI..."
exec npm run start:web -w @jjk/web
