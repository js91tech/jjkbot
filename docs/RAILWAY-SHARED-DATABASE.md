# Railway: one save file for bot + web + API

If `/profile` on the bot and your character on the **website** don’t match, bot and web are using **different** `jjk.db` files.

## Cause

Each Railway service got its **own volume** (e.g. `discord-bot-volume` and `web-volume`). Same mount path `/data`, but **different disks** → different saves.

## Fix (use ONE volume)

1. In your Railway project, pick **one** volume to keep (or create **one** new volume, e.g. `jjk-shared-data`).
2. For **each** service — **bot**, **web**, **api**:
   - Open the service → **Volumes**
   - **Remove** any volume that is only attached to that one service (if Railway lets you swap)
   - **Attach the same shared volume** with mount path: `/data`
3. On **every** service, set variable:
   ```env
   DATABASE_PATH=/data/jjk.db
   ```
4. **Redeploy** bot, then web, then api (order doesn’t matter much).

## Verify in logs

After redeploy, open **Deploy logs** for bot and web. You should see lines like:

```text
[jjk-db] service=bot path=/data/jjk.db exists=true size=123456
[jjk-db] /data mounted=true
```

```text
[jjk-db] service=web path=/data/jjk.db exists=true size=123456
[jjk-db] /data mounted=true
```

**The `size=` number must be the same** (or very close) on bot and web right after both start. If one says `size=0` or `exists=false` while the other has a big size, they’re still on separate storage.

## Merge two saves (optional)

If you already played on both and care about one side’s progress:

1. Decide which DB is the “real” save (usually the bot one with more play time).
2. Railway → that service’s volume → download `/data/jjk.db` (or use CLI).
3. Upload that file to the **shared** volume as `/data/jjk.db`.
4. Redeploy all services.

There is no automatic merge — pick one file.

## Local dev

One folder: `DATABASE_PATH=./data/jjk.db` in `.env` for both `npm run start:bot` and `npm run start:web`.
