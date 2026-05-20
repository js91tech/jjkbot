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
