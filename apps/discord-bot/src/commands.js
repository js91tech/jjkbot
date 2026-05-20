import { GameService } from '@jjk/game-core';
import { playerEmbed } from './embed.js';

function reply(result, interaction, extra = {}) {
  if (result.player) {
    return {
      embed: playerEmbed(result.player, result.message || 'Updated'),
      ephemeral: false,
      ...extra
    };
  }
  return { content: result.message || result.ok ? 'Done.' : 'Failed.', ephemeral: !result.ok };
}

export async function handleCommand(interaction) {
  const uid = interaction.user.id;
  const name = interaction.user.username;
  const cmd = interaction.commandName;

  if (cmd === 'profile') {
    const { player, status, inventory } = GameService.profile(uid, name);
    const inv = inventory.map((i) => `${i.name} x${i.quantity}`).join('\n') || 'Empty';
    const embed = playerEmbed(player);
    embed.addFields(
      { name: 'Status', value: status.blocked.blocked ? `${status.blocked.reason} until ${status.blocked.until}` : 'Active' },
      { name: 'Inventory', value: inv.slice(0, 1000) }
    );
    return { embed };
  }

  if (cmd === 'status') {
    const s = GameService.status(uid, name);
    return {
      content:
        `**${s.grade}** Lv.${s.level} | CE ${s.ce} | Wheel spins left: ${s.wheel_spins_left}\n` +
        (s.hospital_until ? `Infirmary until: ${s.hospital_until}\n` : '') +
        (s.jail_until ? `Prison Realm until: ${s.jail_until}\n` : '') +
        `Login streak: ${s.login_streak}`
    };
  }

  if (cmd === 'train') {
    return reply(GameService.train(uid, name, interaction.options.getInteger('sets') || 1), interaction);
  }
  if (cmd === 'crime') {
    return reply(GameService.crime(uid, name, interaction.options.getString('mission')), interaction);
  }
  if (cmd === 'work') return reply(GameService.work(uid, name), interaction);
  if (cmd === 'job') return reply(GameService.setJob(uid, name, interaction.options.getString('id')), interaction);
  if (cmd === 'bank') {
    const action = interaction.options.getString('action');
    if (action === 'collect') return reply(GameService.collectInvestment(uid, name), interaction);
    return reply(
      GameService.bank(uid, name, action, interaction.options.getInteger('amount') || 0),
      interaction
    );
  }
  if (cmd === 'shop') {
    const action = interaction.options.getString('action');
    if (action === 'list') {
      const items = GameService.shop();
      const text = items.map((i) => `\`${i.id}\` ${i.name} — ${i.shop_price}c`).join('\n');
      return { content: text || 'Shop empty.' };
    }
    return reply(
      GameService.shopBuy(uid, name, interaction.options.getString('item'), interaction.options.getInteger('quantity') || 1),
      interaction
    );
  }
  if (cmd === 'wheel') return reply(GameService.wheel(uid, name), interaction);
  if (cmd === 'lounge') return reply(GameService.lounge(uid, name, interaction.options.getString('action')), interaction);
  if (cmd === 'inventory') {
    const { inventory } = GameService.profile(uid, name);
    return { content: inventory.map((i) => `${i.item_id}: ${i.name} x${i.quantity}`).join('\n') || 'Empty.' };
  }
  if (cmd === 'use') return reply(GameService.useItem(uid, name, interaction.options.getString('item')), interaction);

  const target = interaction.options.getUser('target');
  if (cmd === 'attack') return reply(GameService.attack(uid, name, target.id), interaction);
  if (cmd === 'mug') return reply(GameService.mug(uid, name, target.id), interaction);
  if (cmd === 'rob') return reply(GameService.rob(uid, name, target.id), interaction);
  if (cmd === 'bust') return reply(GameService.bust(uid, name, target.id), interaction);

  if (cmd === 'education') {
    const enroll = interaction.options.getString('enroll');
    if (!enroll) {
      const courses = GameService.educationList();
      return { content: courses.map((c) => `\`${c.id}\` ${c.name} (Lv${c.min_level}) ${c.cost}c`).join('\n') };
    }
    return reply(GameService.educationEnroll(uid, name, enroll), interaction);
  }
  if (cmd === 'clan') {
    const action = interaction.options.getString('action') || 'list';
    if (action === 'list') {
      return { content: GameService.clans().map((c) => `\`${c.id}\` ${c.name}`).join('\n') };
    }
    if (action === 'join') return reply(GameService.joinClan(uid, name, interaction.options.getString('id')), interaction);
    if (action === 'deposit') {
      return reply(GameService.clanDeposit(uid, name, Number(interaction.options.getString('id'))), interaction);
    }
  }
  if (cmd === 'estate') {
    const tier = interaction.options.getInteger('buy');
    if (tier == null) {
      return { content: GameService.estates().map((e) => `T${e.tier} ${e.name} — ${e.cost}c (x${e.train_multiplier})`).join('\n') };
    }
    return reply(GameService.buyEstate(uid, name, tier), interaction);
  }
  if (cmd === 'market') {
    const action = interaction.options.getString('action') || 'browse';
    if (action === 'browse') {
      const rows = GameService.marketBrowse();
      return {
        content:
          rows.map((r) => `#${r.id} ${r.name} x${r.quantity} — ${r.price}c by ${r.username}`).join('\n') ||
          'No listings.'
      };
    }
    if (action === 'sell') {
      return reply(
        GameService.marketList(
          uid,
          name,
          interaction.options.getString('item'),
          interaction.options.getInteger('quantity'),
          interaction.options.getInteger('price')
        ),
        interaction
      );
    }
    return reply(GameService.marketBuy(uid, name, interaction.options.getInteger('listing')), interaction);
  }
  if (cmd === 'gold') {
    const action = interaction.options.getString('action') || 'browse';
    if (action === 'browse') {
      const rows = GameService.goldBrowse();
      return {
        content: rows.map((r) => `#${r.id} ${r.gold_amount} objects — ${r.price}c (${r.username})`).join('\n') || 'Empty.'
      };
    }
    if (action === 'sell') {
      return reply(
        GameService.goldList(uid, name, interaction.options.getInteger('amount'), interaction.options.getInteger('price')),
        interaction
      );
    }
    return reply(GameService.goldBuy(uid, name, interaction.options.getInteger('listing')), interaction);
  }
  if (cmd === 'forge') return reply(GameService.forge(uid, name), interaction);
  if (cmd === 'commodity') {
    const action = interaction.options.getString('action') || 'list';
    if (action === 'list') {
      return { content: GameService.commodities().map((c) => `${c.id}: ${c.name} @ ${c.current_price}c`).join('\n') };
    }
    return reply(
      GameService.commodityTrade(uid, name, interaction.options.getString('id'), interaction.options.getInteger('quantity'), action),
      interaction
    );
  }
  if (cmd === 'delve') return reply(GameService.delve(uid, name), interaction);
  if (cmd === 'grabbag') {
    const action = interaction.options.getString('action') || 'open';
    if (action === 'buy') return reply(GameService.buyGrabBags(uid, name, interaction.options.getInteger('count') || 1), interaction);
    return reply(GameService.openGrabBag(uid, name), interaction);
  }
  if (cmd === 'leaderboard') {
    const rows = GameService.leaderboard(interaction.options.getString('type') || 'level');
    return {
      content: rows.map((r, i) => `${i + 1}. ${r.username} — Lv${r.level || r.wins}${r.coins != null ? ` (${(r.coins + (r.bank_balance || 0)).toLocaleString()} wealth)` : ''}`).join('\n')
    };
  }
  if (cmd === 'world') return reply(GameService.setWorld(uid, name, interaction.options.getString('id')), interaction);
  if (cmd === 'admin') {
    const target = interaction.options.getUser('target');
    return reply(
      GameService.admin(uid, interaction.options.getString('action'), target.id, interaction.options.getInteger('value')),
      interaction
    );
  }

  return { content: 'Unknown command.', ephemeral: true };
}
