import { EmbedBuilder } from 'discord.js';

export function playerEmbed(player, title = 'Sorcerer Profile') {
  return new EmbedBuilder()
    .setTitle(title)
    .setColor(0x6a0dad)
    .setDescription(
      `**${player.username}** — ${player.grade} (Lv.${player.level})\n` +
        `Coins: ${player.coins.toLocaleString()} | Bank: ${player.bank_balance.toLocaleString()}\n` +
        `CE: ${player.ce}/100 | Focus: ${player.focus} | Resolve: ${player.resolve}\n` +
        `Strength: ${player.strength} | HP: ${player.hp}/${player.max_hp} | Bravery: ${player.bravery}\n` +
        `Rice: ${player.rice} | Cursed Objects: ${player.gold_objects} | Region: ${player.world_id}`
    );
}
