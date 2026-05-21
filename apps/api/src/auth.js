/**
 * Discord Bearer token auth for 2D Activity + dev headers.
 */
export async function resolveDiscordUser(req) {
  if (process.env.ALLOW_DEV_AUTH === 'true') {
    const devId = req.headers['x-discord-id'];
    const devName = req.headers['x-discord-username'] || 'DevSorcerer';
    if (devId) return { id: String(devId), username: String(devName) };
  }

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;

  const res = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  const user = await res.json();
  if (!user?.id) return null;
  return { id: user.id, username: user.username || 'Sorcerer' };
}

export function requireAuth(handler) {
  return async (req, res, next) => {
    try {
      const user = await resolveDiscordUser(req);
      if (!user) {
        return res.status(401).json({ ok: false, message: 'Unauthorized. Log in with Discord.' });
      }
      req.discordId = user.id;
      req.discordUsername = user.username;
      return handler(req, res, next);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, message: 'Auth error' });
    }
  };
}
