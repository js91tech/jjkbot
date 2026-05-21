import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { GameService } from '@jjk/game-core';
import { handleCommand } from './commands.js';
import { registerSlashCommands } from './register-slash.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.DATABASE_PATH =
  process.env.DATABASE_PATH || path.resolve(__dirname, '../../../data/jjk.db');

if (!process.env.DISCORD_TOKEN) {
  console.error('FATAL: DISCORD_TOKEN is missing on this Railway service. Add it under Variables.');
  process.exit(1);
}

console.log('Starting JJK Discord bot...');
console.log('DATABASE_PATH=', process.env.DATABASE_PATH || '(default)');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let stopTicks = () => {};
try {
  stopTicks = GameService.startScheduler();
} catch (err) {
  console.error('Scheduler failed:', err.message);
}

client.on('error', (err) => console.error('Discord client error:', err));
process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));

client.once(Events.ClientReady, async (c) => {
  console.log(`JJK-Bot logged in as ${c.user.tag}`);
  if (process.env.REGISTER_COMMANDS_ON_START !== 'false') {
    try {
      await registerSlashCommands();
    } catch (err) {
      console.error('Slash command registration failed:', err.message);
      if (!process.env.DISCORD_CLIENT_ID) {
        console.error('Add DISCORD_CLIENT_ID (Application ID from Discord Developer Portal) on this service.');
      }
      if (!process.env.DISCORD_GUILD_ID) {
        console.error('Optional: DISCORD_GUILD_ID = your server ID for instant /commands (right-click server → Copy Server ID).');
      }
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  try {
    const result = await handleCommand(interaction);
    if (result.embed) {
      await interaction.reply({ embeds: [result.embed], ephemeral: result.ephemeral });
    } else {
      await interaction.reply({ content: result.content, ephemeral: result.ephemeral });
    }
  } catch (err) {
    console.error(err);
    const msg = err.message || 'Something went wrong.';
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: msg, ephemeral: true });
    } else {
      await interaction.reply({ content: msg, ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN).catch((err) => {
  console.error('FATAL: Discord login failed — check DISCORD_TOKEN is valid and not truncated.');
  console.error(err.message || err);
  process.exit(1);
});

process.on('SIGINT', () => {
  stopTicks();
  client.destroy();
  process.exit(0);
});
