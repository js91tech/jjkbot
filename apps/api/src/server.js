import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { GameService } from '@jjk/game-core';
import { requireAuth, resolveDiscordUser } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../..');
process.env.DATABASE_PATH = process.env.DATABASE_PATH || path.join(root, 'data/jjk.db');

const app = express();
const port = Number(process.env.PORT || process.env.API_PORT) || 3848;

const devOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const activityOrigins = (process.env.ACTIVITY_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
if (activityOrigins.length === 0 && process.env.ALLOW_DEV_AUTH === 'true') {
  activityOrigins.push(...devOrigins);
}

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || activityOrigins.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true
  })
);
app.use(express.json());

GameService.startScheduler();

function wrap(result) {
  return {
    ok: result.ok !== false,
    message: result.message,
    player: result.player || null
  };
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'jjk-api' }));

/** Who am I (creates player if new). */
app.get('/v1/me', requireAuth(async (req, res) => {
  const { player, status, inventory } = GameService.profile(req.discordId, req.discordUsername);
  const confinement = GameService.confinement(req.discordId, req.discordUsername);
  const equipped = GameService.equipped(player.id);
  res.json({ ok: true, player, status, inventory, confinement, equipped });
}));

app.get('/v1/crimes', requireAuth(async (req, res) => {
  res.json({ ok: true, crimes: GameService.crimes(req.discordId, req.discordUsername) });
}));

app.post('/v1/train', requireAuth(async (req, res) => {
  const { stat = 'strength', sets = 1 } = req.body || {};
  res.json(wrap(GameService.train(req.discordId, req.discordUsername, Number(sets) || 1, stat)));
}));

app.post('/v1/crime', requireAuth(async (req, res) => {
  const { mission } = req.body || {};
  if (!mission) return res.status(400).json({ ok: false, message: 'mission required' });
  res.json(wrap(GameService.crime(req.discordId, req.discordUsername, mission)));
}));

app.post('/v1/work', requireAuth(async (req, res) => {
  res.json(wrap(GameService.work(req.discordId, req.discordUsername)));
}));

app.post('/v1/attack', requireAuth(async (req, res) => {
  const { targetDiscordId } = req.body || {};
  if (!targetDiscordId) return res.status(400).json({ ok: false, message: 'targetDiscordId required' });
  res.json(wrap(GameService.attack(req.discordId, req.discordUsername, targetDiscordId)));
}));

app.get('/v1/explore', requireAuth(async (req, res) => {
  const r = GameService.explore(req.discordId, req.discordUsername);
  res.json({ ok: r.ok !== false, message: r.message, player: r.player });
}));

app.post('/v1/explore/move', requireAuth(async (req, res) => {
  const { direction } = req.body || {};
  res.json(wrap(GameService.exploreMove(req.discordId, req.discordUsername, direction || 'north')));
}));

app.post('/v1/escape', requireAuth(async (req, res) => {
  const { place, method = 'pay' } = req.body || {};
  res.json(wrap(GameService.escape(req.discordId, req.discordUsername, place, method)));
}));

/** List players for PvP target picker (same channel activity — all non-banned). */
app.get('/v1/players', requireAuth(async (req, res) => {
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const rows = GameService.listPlayers(limit).filter((p) => p.discord_id !== req.discordId);
  res.json({ ok: true, players: rows });
}));

/** Discord Activity: exchange authorize code for access token. */
async function exchangeActivityOAuthCode(code, clientId, clientSecret) {
  const attempts = [
    { redirect_uri: 'https://127.0.0.1' },
    { redirect_uri: 'http://127.0.0.1' },
    { redirect_uri: 'http://127.0.0.1/callback' },
    {}
  ];
  let last = null;
  for (const extra of attempts) {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code
    });
    if (extra.redirect_uri) body.set('redirect_uri', extra.redirect_uri);
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    const token = await tokenRes.json();
    if (token.access_token) return token;
    last = token;
  }
  return last;
}

app.post('/v1/auth/code', async (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ ok: false, message: 'code required' });
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).json({ ok: false, message: 'DISCORD_CLIENT_ID/SECRET not set on API service' });
  }
  const token = await exchangeActivityOAuthCode(code, clientId, clientSecret);
  if (!token.access_token) {
    console.error('Activity OAuth exchange failed:', token);
    return res.status(401).json({ ok: false, message: 'OAuth exchange failed', detail: token });
  }
  const fakeReq = { headers: { authorization: `Bearer ${token.access_token}` } };
  const user = await resolveDiscordUser(fakeReq);
  if (!user) return res.status(401).json({ ok: false, message: 'Could not load Discord user' });
  GameService.profile(user.id, user.username);
  res.json({
    ok: true,
    access_token: token.access_token,
    discordId: user.id,
    username: user.username
  });
});

app.post('/v1/auth/token', async (req, res) => {
  const { access_token } = req.body || {};
  if (!access_token) return res.status(400).json({ ok: false, message: 'access_token required' });
  const fakeReq = { headers: { authorization: `Bearer ${access_token}` } };
  const user = await resolveDiscordUser(fakeReq);
  if (!user) return res.status(401).json({ ok: false, message: 'Invalid token' });
  GameService.profile(user.id, user.username);
  res.json({ ok: true, discordId: user.id, username: user.username, access_token });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`JJK Game API on 0.0.0.0:${port}`);
  console.log(`CORS origins: ${activityOrigins.length ? activityOrigins.join(', ') : '(none — set ACTIVITY_ORIGINS)'}`);
  console.log(`DATABASE_PATH=${process.env.DATABASE_PATH}`);
  if (!activityOrigins.length && process.env.ALLOW_DEV_AUTH !== 'true') {
    console.warn('ACTIVITY_ORIGINS is empty. Set it to your hosted jjk-game-2d HTTPS URL (see docs/RAILWAY-2D-ACTIVITY.md).');
  }
  if (process.env.ALLOW_DEV_AUTH === 'true') console.log('DEV AUTH: X-Discord-Id / X-Discord-Username headers enabled');
});
