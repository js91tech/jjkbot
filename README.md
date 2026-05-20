# JJK-Bot — Samurai of Legend Parity (JJK-Themed)

Text-based persistent RPG inspired by **Samurai of Legend**, reskinned for **Jujutsu Kaisen**. Play via **Discord slash commands** or a lightweight **web UI** sharing one SQLite database.

## Bootstrap note

If you have an existing `jjk-bot.zip`, extract it and merge any custom commands into `apps/discord-bot`. This repo was scaffolded as a full SoL-style implementation when the zip could not be read in the build environment.

## Quick start

```bash
cd jjk-bot
cp .env.example .env
# Fill DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, SESSION_SECRET
npm install
npm run db:init
npm run start:bot   # terminal 1
npm run start:web   # terminal 2
```

Open http://localhost:3847 and log in with Discord.

## Deploy on Railway (GitHub: js91tech/jjkbot)

Use **two services** from the same repo, plus a **volume** on both (mount `/data`).

### Service 1 — Web (`railway.toml`)

**Common failure:** healthcheck fails if this service runs `@jjk/discord-bot` instead of `@jjk/web`. Bot service must use `railway.bot.toml`, not `railway.toml`.

| Setting | Value |
|--------|--------|
| Config file | `railway.toml` only (not `railway.bot.toml`) |
| Custom Start Command | `npm run start -w @jjk/web` or leave empty |
| Volume | `/data` |
| `SERVICE` | `web` (set in Variables or use default) |
| `DATABASE_PATH` | `/data/jjk.db` |
| `WEB_BASE_URL` | `https://<your-web-service>.up.railway.app` |
| `SESSION_SECRET` | long random string |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | OAuth |
| `PORT` | set automatically by Railway |

Discord OAuth redirect: `https://<web-url>/oauth/callback`

### Service 2 — Discord bot (`railway.bot.toml`)

| Setting | Value |
|--------|--------|
| Config file | `railway.bot.toml` |
| Volume | `/data` (same DB as web) |
| `SERVICE` | `bot` |
| `DATABASE_PATH` | `/data/jjk.db` |
| `DISCORD_TOKEN` | bot token |
| `DISCORD_CLIENT_ID` | app id (for slash register) |

After first deploy, run once in the bot service shell:

```bash
npm run register -w @jjk/discord-bot
```

### Railway UI (no Docker) — simplest start commands

If you use **Railpack** (not Dockerfile), set **Deploy → Start command** to:

| Service | Start command |
|---------|----------------|
| Bot | `npm run start -w @jjk/discord-bot` |
| Web | `npm run start -w @jjk/web` |

Do **not** put `SERVICE=web` in the start command box — Railway treats that as the program name. Set `SERVICE` in **Variables** only if using `railway-start.sh`.

**Config-as-code:** Bot service → `railway.bot.toml` path. Web service → `railway.toml` or leave default.

### Volumes on Railway

If you do not see **Volumes** under Settings: open the **project canvas** (graph view) → click **+** or **Create** → **Volume** → attach to service → mount path `/data`. Or use the **Command Palette** (Ctrl/Cmd+K) → “Add Volume”. Requires a paid plan on some accounts.

### Docker (optional)

Same image for both services; `SERVICE=web` or `SERVICE=bot` selects the process. See `Dockerfile` and `scripts/railway-start.sh`.

## Architecture

- `packages/game-core` — all rules, DB, ticks (CE regen, hospital/jail)
- `apps/discord-bot` — slash command parity
- `apps/web` — dashboard, gym, missions, PvP, bank, shop, wheel

## Discord commands

`/profile` `/status` `/train` `/crime` `/work` `/bank` `/shop` `/wheel` `/lounge` `/attack` `/mug` `/rob` `/bust` `/inventory` `/use`

Phase 2+: `/education` `/clan` `/estate` `/market` `/forge` `/commodity` `/gold`

Phase 3+: `/delve` `/grabbag` `/leaderboard` `/world` `/admin`

## Grade protection

Players under level 15 cannot be attacked by players 10+ levels higher (SoL newbie protection).

## License

Fan project — Jujutsu Kaisen is owned by Gege Akutami / rights holders. No official affiliation.
