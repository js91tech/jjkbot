# Railway: 2D Discord Activity (Activity-only)

Production path for **every player**: voice channel → **Activities** (rocket) → play. No localhost, no dev auth, no copying Discord IDs.

**Env checklist (copy-paste):** [env/railway-2d-activity.env.example](env/railway-2d-activity.env.example)

## Architecture

```text
Discord voice channel
        │
        ▼
┌───────────────────┐     HTTPS      ┌─────────────────┐
│ jjk-game-2d       │ ──────────────►│ jjkbot API      │
│ (static dist/)    │   /v1/*        │ SERVICE=api     │
│ Railway service   │                │ same /data DB   │
└───────────────────┘                └────────┬────────┘
                                            │
                     ┌──────────────────────┼──────────────────────┐
                     ▼                      ▼                      ▼
              SERVICE=bot            SERVICE=web              jjk.db
```

| Piece | Repo | Railway |
|-------|------|---------|
| Bot + web + API | `js91tech/jjkbot` | 3 services, shared `railway.toml`, `/data` volume on all three |
| Static 2D client | `js91tech/jjk-game-2d` | Separate service (`npm run build` → `npm run start`) |

---

## Checklist (do in order)

### 1. Discord Developer Portal

Same application as your bot.

| Step | Action |
|------|--------|
| 1 | **Activities** → enable **Embedded App** |
| 2 | **URL Mappings** → Root URL = **2D HTTPS URL** (step 4), e.g. `https://jjk-game-2d-production.up.railway.app` |
| 3 | **Application ID** → `DISCORD_CLIENT_ID` on API + `VITE_DISCORD_CLIENT_ID` on 2D build |
| 4 | **OAuth2** → redirect `https://<web>/oauth/callback` (unchanged for dashboard) |

Tell players: **Join voice → Activities → your activity name.**

---

### 2. jjkbot — API service

Duplicate bot or web in Railway → rename **api** → same repo.

| Variable | Value |
|----------|--------|
| `SERVICE` | `api` |
| `DATABASE_PATH` | `/data/jjk.db` |
| `DISCORD_CLIENT_ID` | app id |
| `DISCORD_CLIENT_SECRET` | OAuth secret |
| `ACTIVITY_ORIGINS` | `https://<2d-url>` (exact origin, no trailing slash) |
| `ALLOW_DEV_AUTH` | `false` |

**Volume:** `/data` — **same volume** as bot and web.

**Start:** `npm run start:railway` (root `railway.toml`). If the service uses the repo **Dockerfile**, push latest `jjkbot` (Dockerfile must include `apps/api`). **Healthcheck:** `/health` → `{"ok":true,"service":"jjk-api"}`.

Copy public URL → `https://<api>.up.railway.app` for `VITE_API_URL` when building 2D.

---

### 3. jjkbot — bot + web

Unchanged. Shared `/data/jjk.db`:

| Service | `SERVICE` |
|---------|-----------|
| Bot | `bot` |
| Web | `web` |

Optional on **web** (optional browser link on dashboard):

| Variable | Value |
|----------|--------|
| `GAME_2D_URL` | `https://<2d-url>` |
| `API_PUBLIC_URL` | `https://<api-url>` |

---

### 4. jjk-game-2d — static host

New Railway service from [jjk-game-2d](https://github.com/js91tech/jjk-game-2d).

| Setting | Value |
|---------|--------|
| Build | `npm install && npm run build` |
| Start | `npm run start` |
| Healthcheck | `/` |

**Build variables** (Railway → Variables; redeploy after any change):

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://<api>.up.railway.app` |
| `VITE_DISCORD_CLIENT_ID` | app id |

Do **not** set `VITE_DEV_DISCORD_ID` in production.

Copy 2D public HTTPS URL → Discord **URL Mappings** + API `ACTIVITY_ORIGINS`.

---

### 5. Verify

| Test | Expected |
|------|----------|
| `https://<api>/health` | `{"ok":true,"service":"jjk-api"}` |
| `https://<2d>/` | Phaser loading screen |
| Voice → Activity | Discord user auth, HUD shows stats |
| Bot `/profile` vs Activity | Same character (`jjk.db`) |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Activity blank / auth error | `ACTIVITY_ORIGINS` must exactly match 2D URL (scheme + host) |
| CORS in console | Add 2D origin to `ACTIVITY_ORIGINS` on API |
| Wrong/empty character | API must use same `/data/jjk.db` volume as bot |
| `Failed to fetch` in Activity | API down or wrong `VITE_API_URL` — rebuild 2D after fixing |
| Build still hits localhost | Set `VITE_*` on 2D service and **redeploy** (baked into `dist/`) |

---

## Related

- Bot/web Railway basics: [README.md](../README.md#deploy-on-railway-github-js91techjjkbot)
- API env template: [apps/api/.env.example](../apps/api/.env.example)
