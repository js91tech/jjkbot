import { getDb } from './db.js';
import balance from './balance.json' with { type: 'json' };
import { getOrCreatePlayer } from './player.js';
import {
  applyLevelUps,
  audit,
  getTrainMultiplier,
  isBlocked,
  roll
} from './util.js';

export function train(discordId, username, sets = 1) {
  const player = getOrCreatePlayer(discordId, username);
  const block = isBlocked(player);
  if (block.blocked && block.reason === 'jail') {
    return { ok: false, message: 'You are confined in the Prison Realm. Only /wheel, /inventory, /use, /bust work.' };
  }
  if (block.blocked && block.reason === 'hospital') {
    return { ok: false, message: 'You are in Shoko\'s infirmary. Use a Reversal Kit or wait.' };
  }
  const db = getDb();
  sets = Math.max(1, Math.min(20, sets));
  let totalStr = 0;
  let totalXp = 0;
  let crits = 0;
  const mult = getTrainMultiplier(player, db);
  let ce = player.ce;
  let focus = player.focus;
  for (let i = 0; i < sets; i++) {
    if (ce < balance.trainCeCost || focus < balance.trainFocusCost) break;
    ce -= balance.trainCeCost;
    focus -= balance.trainFocusCost;
    let gain = Math.floor(balance.trainStrengthGain * mult);
    if (roll(0.08)) {
      gain = Math.floor(gain * 1.5);
      crits++;
    }
    totalStr += gain;
    totalXp += balance.trainXpGain;
  }
  if (totalStr === 0) {
    return { ok: false, message: 'Not enough CE or Focus. Rest at the CE lounge or wait for regen.' };
  }
  db.prepare('UPDATE players SET ce = ?, focus = ?, strength = strength + ?, xp = xp + ? WHERE id = ?').run(
    ce,
    focus,
    totalStr,
    totalXp,
    player.id
  );
  audit(db, player.id, 'train', totalStr, { sets, crits });
  applyLevelUps(db, { ...player, xp: player.xp + totalXp });
  const updated = getOrCreatePlayer(discordId, username);
  let msg = `Training complete! +${totalStr} Strength, +${totalXp} XP.`;
  if (crits) msg += ` Black Flash procs: ${crits}!`;
  return { ok: true, message: msg, player: updated };
}
