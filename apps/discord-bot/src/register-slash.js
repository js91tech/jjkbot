import { REST, Routes } from 'discord.js';
import { buildSlashCommands } from './slash-commands.js';

/**
 * Register slash commands with Discord API.
 * Set DISCORD_GUILD_ID for instant commands on one server (recommended for testing).
 */
export async function registerSlashCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token || !clientId) {
    throw new Error('DISCORD_TOKEN and DISCORD_CLIENT_ID are required to register commands');
  }

  const commands = buildSlashCommands();
  const rest = new REST({ version: '10' }).setToken(token);

  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log(`Registered ${commands.length} guild commands on server ${guildId} (instant)`);
    return { count: commands.length, scope: 'guild', guildId };
  }

  await rest.put(Routes.applicationCommands(clientId), { body: commands });
  console.log(`Registered ${commands.length} global commands (may take up to 1 hour to appear)`);
  return { count: commands.length, scope: 'global' };
}
