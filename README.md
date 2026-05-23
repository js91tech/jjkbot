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

Use **two or three services** from this repo (bot, web, optional **api** for 2D Activity).

**One shared save:** attach the **same Railway volume** to bot, web, and api at mount `/data` with `DATABASE_PATH=/data/jjk.db`. Separate volumes = separate characters. See **[docs/RAILWAY-SHARED-DATABASE.md](docs/RAILWAY-SHARED-DATABASE.md)**.

### Railway start command (all jjkbot services)

One root `railway.toml` + **`SERVICE`** per service:

| Service | Variable |
|---------|----------|
| Web | `SERVICE=web` |
| Bot | `SERVICE=bot` |
| API (2D Activity) | `SERVICE=api` |

**Deploy → Start command:** `npm run start:railway` (or leave empty — `railway.toml` sets it).  
Healthcheck: `/health`. Logs: `Railway start: web|bot|api`.

**2D game for players:** separate repo [jjk-game-2d](https://github.com/js91tech/jjk-game-2d) + full checklist → **[docs/RAILWAY-2D-ACTIVITY.md](docs/RAILWAY-2D-ACTIVITY.md)** and **[docs/env/railway-2d-activity.env.example](docs/env/railway-2d-activity.env.example)**.

### Service — Web

| Setting | Value |
|--------|--------|
| `SERVICE` | `web` |
| Volume | **Same** shared volume as bot/api → `/data` |
| `DATABASE_PATH` | `/data/jjk.db` |
| `WEB_BASE_URL` | `https://<your-web-service>.up.railway.app` |
| `SESSION_SECRET` | long random string |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | OAuth |
| `PORT` | set automatically by Railway |
| `GAME_2D_URL` | *(optional)* hosted 2D HTTPS URL |
| `API_PUBLIC_URL` | *(optional)* hosted API URL |

Discord OAuth redirect: `https://<web-url>/oauth/callback`

### Service — Discord bot

| Setting | Value |
|--------|--------|
| `SERVICE` | `bot` |
| Volume | **Same** shared volume as web/api → `/data` |
| `DATABASE_PATH` | `/data/jjk.db` |
| `DISCORD_TOKEN` | bot token |
| `DISCORD_CLIENT_ID` | app id (for slash register) |

### Service — API (2D Discord Activity)

| Setting | Value |
|--------|--------|
| `SERVICE` | `api` |
| Volume | `/data` (same DB) |
| `DATABASE_PATH` | `/data/jjk.db` |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | same as web |
| `ACTIVITY_ORIGINS` | `https://<2d-service>.up.railway.app` |
| `ALLOW_DEV_AUTH` | `false` |

See [docs/RAILWAY-2D-ACTIVITY.md](docs/RAILWAY-2D-ACTIVITY.md) for Discord Activities portal steps and jjk-game-2d build vars.

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
- `apps/api` — REST API for **jjk-game-2d** (Discord Activity / Phaser client)

### 2D Discord Activity

Top-down Phaser client: **[jjk-game-2d](https://github.com/js91tech/jjk-game-2d)** (own Railway service).

Players: **voice channel → Activities (rocket)**. Setup: [docs/RAILWAY-2D-ACTIVITY.md](docs/RAILWAY-2D-ACTIVITY.md) · env: [docs/env/railway-2d-activity.env.example](docs/env/railway-2d-activity.env.example).

Bot, web, API, and Activity share one `DATABASE_PATH` on the Railway volume (`/data/jjk.db`).

### Escape infirmary / Prison Realm

| Place | Methods |
|-------|---------|
| Infirmary | `/use reversal_kit`, `/escape place:hospital method:pay`, `method:ce` (40 CE) |
| Prison | `/escape place:jail method:pay`, `method:item` (Prison Key from shop), ally `/bust` |

## Discord commands

**Core:** `/profile` `/status` `/train` `/crime` `/work` `/bank` `/shop` `/wheel` `/lounge` `/attack` `/mug` `/rob` `/bust` `/inventory` `/use`

**SoL stats & gear:** `/worker` `/gym` `/equip` `/unequip` `/company` `/drug`

**World:** `/explore` `/talk` `/world`

**Phase 2+:** `/education` `/clan` `/estate` `/market` `/forge` `/commodity` `/gold`

**Phase 3+:** `/delve` `/grabbag` `/leaderboard` `/admin`

Train combat: `/train stat:Defense sets:10`. Worker stats: `/worker stat:Intelligence sets:5`. Join company then `/work` for boosted payouts.

## Grade protection

Players under level 15 cannot be attacked by players 10+ levels higher (SoL newbie protection).

## License

Fan project — Jujutsu Kaisen is owned by Gege Akutami / rights holders. No official affiliation.
