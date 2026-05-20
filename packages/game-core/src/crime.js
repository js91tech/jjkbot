import { getDb } from './db.js';
import balance from './balance.json' with { type: 'json' };
import { getOrCreatePlayer } from './player.js';
import { applyLevelUps, audit, isBlocked, minutesFromNow, roll } from './util.js';

export function listCrimes(discordId, username) {
  const player = getOrCreatePlayer(discordId, username);
  const db = getDb();
  return db
    .prepare('SELECT * FROM crime_definitions WHERE min_level <= ? ORDER BY min_level')
    .all(player.level);
}

export function commitCrime(discordId, username, crimeId) {
  const player = getOrCreatePlayer(discordId, username);
  const block = isBlocked(player);
  if (block.blocked) {
    return { ok: false, message: block.reason === 'jail' ? 'You are in the Prison Realm.' : 'You are in the infirmary.' };
  }
  const db = getDb();
  const crime = db.prepare('SELECT * FROM crime_definitions WHERE id = ?').get(crimeId);
  if (!crime) return { ok: false, message: 'Unknown mission.' };
  if (player.level < crime.min_level) return { ok: false, message: `Requires level ${crime.min_level}.` };
  if (player.bravery < crime.bravery_cost) {
    return { ok: false, message: 'Not enough Bravery. Try CE lounge vow shot.' };
  }
  db.prepare('UPDATE players SET bravery = bravery - ? WHERE id = ?').run(
    crime.bravery_cost,
    player.id
  );
  if (roll(crime.fail_chance)) {
    if (roll(crime.jail_chance / (crime.fail_chance || 1))) {
      const until = minutesFromNow(balance.jailMinutes);
      db.prepare('UPDATE players SET jail_until = ? WHERE id = ?').run(until, player.id);
      return { ok: false, message: `Mission failed! Caught and sent to Prison Realm for ${balance.jailMinutes}m.` };
    }
    const until = minutesFromNow(balance.hospitalMinutes);
    db.prepare('UPDATE players SET hospital_until = ? WHERE id = ?').run(until, player.id);
    return { ok: false, message: `Mission failed! Injured — infirmary for ${balance.hospitalMinutes}m.` };
  }
  const xpScale = Math.max(1, 5 - Math.min(4, player.level - 1));
  const xpGain = Math.max(1, Math.floor(crime.xp_reward / xpScale));
  const coins = crime.coin_reward;
  db.prepare('UPDATE players SET xp = xp + ?, coins = coins + ? WHERE id = ?').run(
    xpGain,
    coins,
    player.id
  );
  audit(db, player.id, 'crime', coins, { crimeId, xpGain });
  applyLevelUps(db, { ...player, xp: player.xp + xpGain });
  return {
    ok: true,
    message: `${crime.name} success! +${xpGain} XP, +${coins} coins.`,
    player: getOrCreatePlayer(discordId, username)
  };
}
