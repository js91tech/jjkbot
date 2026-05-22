# Railway: 2D Discord Activity (for every player)

This is the **simple production path**. Players do **not** run localhost or use dev auth. They open your game from a **voice channel → Activities (rocket icon)**.

## Architecture

```text
Discord voice channel
        │
        ▼
┌───────────────────┐     HTTPS      ┌─────────────────┐
│ jjk-game-2d       │ ──────────────►│ jjkbot API      │
│ (static dist/)    │   /v1/*        │ SERVICE=api     │
│ Railway service 4 │                │ same /data DB   │
└───────────────────┘                └────────┬────────┘
                                            │
                     ┌──────────────────────┼──────────────────────┐
                     ▼                      ▼                      ▼
              SERVICE=bot            SERVICE=web              jjk.db
```

**Four Railway pieces** (bot, web, api, 2d) — bot/web/api share one volume; 2d is static files only.

---

## Checklist (do in order)

### 1. Discord Developer Portal (one-time)

Same application as your bot.

| Step | Action |
|------|--------|
| 1 | **Activities** → enable **Embedded App** |
| 2 | **URL Mappings** → Root URL = your **2D HTTPS URL** (from step 4), e.g. `https://jjk-game-2d-production.up.railway.app` |
| 3 | Note **Application ID** → used as `DISCORD_CLIENT_ID` everywhere |
| 4 | **OAuth2** → ensure redirects include your web URL: `https://<web>/oauth/callback` (unchanged) |

Tell players: **Join voice → Activities → JJK Sorcerer** (your activity name).

---

### 2. jjkbot — API service (new)

Duplicate the bot or web service in Railway, rename **api**.

| Variable | Value |
|----------|--------|
| `SERVICE` | `api` |
| `DATABASE_PATH` | `/data/jjk.db` |
| `DISCORD_CLIENT_ID` | same as bot |
| `DISCORD_CLIENT_SECRET` | same as bot |
| `ACTIVITY_ORIGINS` | `https://<your-2d-url>` (exact HTTPS origin, no trailing slash) |
| `ALLOW_DEV_AUTH` | `false` |
| `PORT` | (Railway sets automatically) |

**Volume:** mount `/data` — **same volume** as bot and web.

**Start command:** `npm run start:railway` (same `railway.toml` as other services).

**Healthcheck path:** `/health`

Copy public URL → `https://<api-service>.up.railway.app` — used as `VITE_API_URL` when building 2D.

---

### 3. jjkbot — bot + web (unchanged)

Keep existing services with shared `/data/jjk.db`:

| Service | `SERVICE` | Volume |
|---------|-----------|--------|
| Bot | `bot` | `/data` |
| Web | `web` | `/data` |

Optional on **web** only (dashboard link to hosted game):

| Variable | Value |
|----------|--------|
| `GAME_2D_URL` | `https://<your-2d-url>` |
| `API_PUBLIC_URL` | `https://<api-url>` |

---

### 4. jjk-game-2d — static host (new repo service)

Create a **new Railway project service** from repo `js91tech/jjk-game-2d`.

| Setting | Value |
|---------|--------|
| **Build command** | `npm install && npm run build` |
| **Start command** | `npm run start` |
| **Healthcheck** | `/` |

**Variables (required at build time — Railway → Variables):**

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `https://<api-service>.up.railway.app` |
| `VITE_DISCORD_CLIENT_ID` | your application id |

Do **not** set `VITE_DEV_DISCORD_ID` in production.

Redeploy after changing `VITE_*` (they are baked into `dist/` at build).

Copy public HTTPS URL → use in Discord **URL Mappings** and `ACTIVITY_ORIGINS`.

---

### 5. Verify

| Test | Expected |
|------|----------|
| `https://<api>/health` | `{"ok":true,"service":"jjk-api"}` |
| `https://<2d>/` | Phaser loading screen |
| Voice channel → Activity | Logs in as Discord user, HUD shows stats |
| Bot `/profile` vs Activity | Same character (same `jjk.db`) |

---

## What players do (no setup)

1. Join a **voice channel** on your server.
2. Tap **Activities** (rocket).
3. Select your game.
4. Play (touch joystick on mobile).

No dashboard button required. No localhost. No copying Discord IDs.

---

## Local dev (optional, you only)

Not used by players. See `jjk-game-2d/README.md` — Node 22, `ALLOW_DEV_AUTH=true`, ports 3848 + 5173.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Activity blank / auth error | `ACTIVITY_ORIGINS` must exactly match 2D URL scheme+host |
| CORS error in browser console | Add 2D origin to `ACTIVITY_ORIGINS` on API |
| Wrong/empty character | API volume must be same `/data/jjk.db` as bot |
| Activity works, web button fails | Web button is optional; set `GAME_2D_URL` to hosted 2D URL |
| Build 2D still points at localhost | Rebuild 2D service after setting `VITE_API_URL` |
| `Failed to fetch` in Activity | API service down or wrong `VITE_API_URL` in build |

---

## Env quick copy-paste

**API service**

```env
SERVICE=api
DATABASE_PATH=/data/jjk.db
DISCORD_CLIENT_ID=1506793287963512832
DISCORD_CLIENT_SECRET=<secret>
ACTIVITY_ORIGINS=https://YOUR-2D.up.railway.app
ALLOW_DEV_AUTH=false
```

**2D service (build vars)**

```env
VITE_API_URL=https://YOUR-API.up.railway.app
VITE_DISCORD_CLIENT_ID=1506793287963512832
```

Replace IDs/URLs with yours.
