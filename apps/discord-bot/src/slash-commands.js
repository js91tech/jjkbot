import { SlashCommandBuilder } from 'discord.js';

export function buildSlashCommands() {
  return [
    new SlashCommandBuilder().setName('profile').setDescription('Your sorcerer profile'),
    new SlashCommandBuilder().setName('status').setDescription('CE, timers, blockers'),
    new SlashCommandBuilder()
      .setName('train')
      .setDescription('Train at the grounds')
      .addIntegerOption((o) => o.setName('sets').setDescription('Sets 1-20').setMinValue(1).setMaxValue(20)),
    new SlashCommandBuilder()
      .setName('crime')
      .setDescription('Run a curse mission')
      .addStringOption((o) =>
        o
          .setName('mission')
          .setDescription('Mission type')
          .setRequired(true)
          .addChoices(
            { name: 'Petty Cleanup', value: 'petty_cleanup' },
            { name: 'Grade-4 Patrol', value: 'grade4_patrol' },
            { name: 'Shibuya Sweep', value: 'shibuya_raid' },
            { name: 'Special Exorcism', value: 'special_exorcism' }
          )
      ),
    new SlashCommandBuilder().setName('work').setDescription('Do your job for coins and XP'),
    new SlashCommandBuilder()
      .setName('job')
      .setDescription('Set your job')
      .addStringOption((o) =>
        o
          .setName('id')
          .setDescription('Job to take')
          .setRequired(true)
          .addChoices(
            { name: 'Janitor', value: 'janitor' },
            { name: 'Instructor Assistant', value: 'instructor_assistant' },
            { name: 'Curator', value: 'curator' }
          )
      ),
    new SlashCommandBuilder()
      .setName('bank')
      .setDescription('HQ Treasury')
      .addStringOption((o) =>
        o
          .setName('action')
          .setDescription('Bank action')
          .setRequired(true)
          .addChoices(
            { name: 'deposit', value: 'deposit' },
            { name: 'withdraw', value: 'withdraw' },
            { name: 'buycard', value: 'buycard' },
            { name: 'invest', value: 'invest' },
            { name: 'collect', value: 'collect' }
          )
      )
      .addIntegerOption((o) => o.setName('amount').setDescription('Amount for deposit/withdraw/invest')),
    new SlashCommandBuilder()
      .setName('shop')
      .setDescription('Relic shop')
      .addStringOption((o) =>
        o
          .setName('action')
          .setDescription('Shop action')
          .setRequired(true)
          .addChoices({ name: 'list', value: 'list' }, { name: 'buy', value: 'buy' })
      )
      .addStringOption((o) => o.setName('item').setDescription('Item id'))
      .addIntegerOption((o) => o.setName('quantity').setDescription('Qty')),
    new SlashCommandBuilder().setName('wheel').setDescription('Mission roulette spin'),
    new SlashCommandBuilder()
      .setName('lounge')
      .setDescription('CE lounge')
      .addStringOption((o) =>
        o
          .setName('action')
          .setDescription('Lounge action')
          .setRequired(true)
          .addChoices(
            { name: 'tea', value: 'tea' },
            { name: 'vow', value: 'vow' },
            { name: 'refill', value: 'refill' }
          )
      ),
    new SlashCommandBuilder()
      .setName('attack')
      .setDescription('Duel another sorcerer')
      .addUserOption((o) => o.setName('target').setDescription('Target sorcerer').setRequired(true)),
    new SlashCommandBuilder()
      .setName('mug')
      .setDescription('Steal coins')
      .addUserOption((o) => o.setName('target').setDescription('Target sorcerer').setRequired(true)),
    new SlashCommandBuilder()
      .setName('rob')
      .setDescription('Rob coins (larger haul)')
      .addUserOption((o) => o.setName('target').setDescription('Target sorcerer').setRequired(true)),
    new SlashCommandBuilder()
      .setName('bust')
      .setDescription('Break ally out of Prison Realm')
      .addUserOption((o) => o.setName('target').setDescription('Ally to bust').setRequired(true)),
    new SlashCommandBuilder().setName('inventory').setDescription('Your items'),
    new SlashCommandBuilder()
      .setName('use')
      .setDescription('Use an item')
      .addStringOption((o) => o.setName('item').setDescription('Item id').setRequired(true)),
    new SlashCommandBuilder()
      .setName('education')
      .setDescription('Jujutsu curriculum')
      .addStringOption((o) => o.setName('enroll').setDescription('Course id: basics, black_flash, domain_theory')),
    new SlashCommandBuilder()
      .setName('clan')
      .setDescription('School squad')
      .addStringOption((o) =>
        o
          .setName('action')
          .setDescription('Clan action')
          .addChoices(
            { name: 'list', value: 'list' },
            { name: 'join', value: 'join' },
            { name: 'deposit', value: 'deposit' }
          )
      )
      .addStringOption((o) => o.setName('id').setDescription('Clan id or amount for deposit')),
    new SlashCommandBuilder()
      .setName('estate')
      .setDescription('Housing')
      .addIntegerOption((o) => o.setName('buy').setDescription('Tier to buy')),
    new SlashCommandBuilder()
      .setName('market')
      .setDescription('Item market')
      .addStringOption((o) =>
        o
          .setName('action')
          .setDescription('Market action')
          .addChoices(
            { name: 'browse', value: 'browse' },
            { name: 'sell', value: 'sell' },
            { name: 'buy', value: 'buy' }
          )
      )
      .addStringOption((o) => o.setName('item').setDescription('Item id'))
      .addIntegerOption((o) => o.setName('quantity').setDescription('Quantity'))
      .addIntegerOption((o) => o.setName('price').setDescription('Price per unit'))
      .addIntegerOption((o) => o.setName('listing').setDescription('Listing id to buy')),
    new SlashCommandBuilder()
      .setName('gold')
      .setDescription('Cursed object exchange')
      .addStringOption((o) =>
        o
          .setName('action')
          .setDescription('Exchange action')
          .addChoices(
            { name: 'browse', value: 'browse' },
            { name: 'sell', value: 'sell' },
            { name: 'buy', value: 'buy' }
          )
      )
      .addIntegerOption((o) => o.setName('amount').setDescription('Gold amount'))
      .addIntegerOption((o) => o.setName('price').setDescription('Price per unit'))
      .addIntegerOption((o) => o.setName('listing').setDescription('Listing id to buy')),
    new SlashCommandBuilder().setName('forge').setDescription('Forge cursed tool'),
    new SlashCommandBuilder()
      .setName('commodity')
      .setDescription('Trade commodities')
      .addStringOption((o) =>
        o
          .setName('action')
          .setDescription('Trade action')
          .addChoices({ name: 'list', value: 'list' }, { name: 'buy', value: 'buy' }, { name: 'sell', value: 'sell' })
      )
      .addStringOption((o) => o.setName('id').setDescription('Commodity id'))
      .addIntegerOption((o) => o.setName('quantity').setDescription('Quantity')),
    new SlashCommandBuilder().setName('delve').setDescription('Enter curse spirit nest'),
    new SlashCommandBuilder()
      .setName('grabbag')
      .setDescription('Curse capsules')
      .addStringOption((o) =>
        o
          .setName('action')
          .setDescription('Grab bag action')
          .addChoices(
            { name: 'buy', value: 'buy' },
            { name: 'open', value: 'open' }
          )
      )
      .addIntegerOption((o) => o.setName('count').setDescription('How many to buy or open')),
    new SlashCommandBuilder()
      .setName('leaderboard')
      .setDescription('Top sorcerers')
      .addStringOption((o) =>
        o
          .setName('type')
          .setDescription('Leaderboard type')
          .addChoices(
            { name: 'level', value: 'level' },
            { name: 'wealth', value: 'wealth' },
            { name: 'strength', value: 'strength' },
            { name: 'pvp', value: 'pvp' }
          )
      ),
    new SlashCommandBuilder()
      .setName('world')
      .setDescription('Change region')
      .addStringOption((o) =>
        o
          .setName('id')
          .setDescription('Region')
          .setRequired(true)
          .addChoices(
            { name: 'Tokyo', value: 'tokyo' },
            { name: 'Osaka', value: 'osaka' },
            { name: 'Kyoto', value: 'kyoto' },
            { name: 'Sendai', value: 'sendai' }
          )
      ),
    new SlashCommandBuilder()
      .setName('admin')
      .setDescription('Admin tools')
      .addStringOption((o) =>
        o
          .setName('action')
          .setDescription('Admin action')
          .setRequired(true)
          .addChoices(
            { name: 'givecoins', value: 'givecoins' },
            { name: 'setlevel', value: 'setlevel' },
            { name: 'ban', value: 'ban' },
            { name: 'unban', value: 'unban' }
          )
      )
      .addUserOption((o) => o.setName('target').setDescription('Target user').setRequired(true))
      .addIntegerOption((o) => o.setName('value').setDescription('Coins or level value'))
  ].map((c) => c.toJSON());
}
