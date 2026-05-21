import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SCHEMA_SQL } from './schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let dbInstance = null;

export function getDbPath() {
  return process.env.DATABASE_PATH || path.resolve(__dirname, '../../../data/jjk.db');
}

export function getDb() {
  if (!dbInstance) {
    const dbPath = getDbPath();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    dbInstance = new Database(dbPath);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    migrate(dbInstance);
  }
  return dbInstance;
}

export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

function migrate(db) {
  db.exec(SCHEMA_SQL);
  const version = db.pragma('user_version', { simple: true });
  if (version < 1) {
    seedWorld(db);
    db.pragma('user_version = 1');
  }
  if (version < 2) {
    for (const [col, def] of [
      ['defense', 'INTEGER NOT NULL DEFAULT 10'],
      ['speed', 'INTEGER NOT NULL DEFAULT 10'],
      ['dexterity', 'INTEGER NOT NULL DEFAULT 10']
    ]) {
      try {
        db.exec(`ALTER TABLE players ADD COLUMN ${col} ${def}`);
      } catch (e) {
        if (!String(e.message).includes('duplicate column')) throw e;
      }
    }
    db.pragma('user_version = 2');
  }
}

function seedWorld(db) {
  const items = [
    ['reversal_kit', 'Reversal Kit', 'Clears hospital early', 500, 'consumable', '{"hospitalClear":true}'],
    ['training_weights', 'Training Weights', '+5% train gains', 2500, 'gear', '{"trainMult":1.05}'],
    ['cursed_blade', 'Cursed Blade', '+3 strength', 8000, 'weapon', '{"strength":3}'],
    ['rice_bundle', 'Cursed Rice Bundle', 'Lounge currency x10', 200, 'material', '{"rice":10}'],
    ['iron_ore', 'Cursed Iron', 'Forging material', 1500, 'material', '{"forge":true}'],
    ['spirit_core', 'Spirit Core', 'Forging material', 5000, 'material', '{"forge":true}'],
    ['grab_bag', 'Curse Capsule', 'Mystery loot', 50000, 'consumable', '{"grabBag":true}']
  ];
  const insItem = db.prepare(
    `INSERT OR IGNORE INTO item_definitions (id, name, description, shop_price, item_type, effects_json)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  for (const row of items) insItem.run(...row);

  const crimes = [
    ['petty_cleanup', 'Petty Curse Cleanup', 1, 5, 29, 50, 0.05, 0.02, 0.01],
    ['grade4_patrol', 'Grade-4 Patrol', 5, 15, 45, 120, 0.12, 0.08, 0.05],
    ['shibuya_raid', 'Shibuya Incident Sweep', 15, 30, 80, 400, 0.2, 0.15, 0.1],
    ['special_exorcism', 'Special Grade Exorcism', 30, 50, 150, 1200, 0.35, 0.25, 0.18]
  ];
  const insCrime = db.prepare(
    `INSERT OR IGNORE INTO crime_definitions
     (id, name, min_level, bravery_cost, xp_reward, coin_reward, fail_chance, jail_chance, hospital_chance)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const row of crimes) insCrime.run(...row);

  const jobs = [
    ['janitor', 'Jujutsu High Janitor', 100, 50, 1],
    ['instructor_assistant', 'Instructor Assistant', 500, 200, 5],
    ['curator', 'Cursed Object Curator', 2000, 800, 15]
  ];
  const insJob = db.prepare(
    `INSERT OR IGNORE INTO job_definitions (id, name, coin_payout, xp_payout, min_level) VALUES (?, ?, ?, ?, ?)`
  );
  for (const row of jobs) insJob.run(...row);

  const clans = [
    ['tokyo', 'Tokyo Jujutsu High', 'Main campus squad'],
    ['kyoto', 'Kyoto Sister School', 'Traditional techniques'],
    ['zenin', 'Zenin Clan', 'Ten Shadows legacy']
  ];
  const insClan = db.prepare(
    `INSERT OR IGNORE INTO clans (id, name, description, bank_balance) VALUES (?, ?, ?, 0)`
  );
  for (const row of clans) insClan.run(...row);

  const estates = [
    [0, 'None', 0, 1.0],
    [1, 'Dorm Room', 50000, 1.05],
    [2, 'Faculty Quarters', 500000, 1.12],
    [3, 'Safe House', 5000000, 1.25],
    [4, 'Domain Loft', 50000000, 1.4]
  ];
  const insEstate = db.prepare(
    `INSERT OR IGNORE INTO estate_tiers (tier, name, cost, train_multiplier) VALUES (?, ?, ?, ?)`
  );
  for (const row of estates) insEstate.run(...row);

  const education = [
    ['basics', 'Cursed Energy Basics', 0, 1000, '{"trainMult":1.02}'],
    ['black_flash', 'Black Flash Theory', 10, 50000, '{"critBonus":0.05}'],
    ['domain_theory', 'Domain Expansion Theory', 25, 500000, '{"strength":2}']
  ];
  const insEdu = db.prepare(
    `INSERT OR IGNORE INTO education_courses (id, name, min_level, cost, bonus_json) VALUES (?, ?, ?, ?, ?)`
  );
  for (const row of education) insEdu.run(...row);

  const commodities = [
    ['cursed_rice', 'Cursed Rice', 100, 120],
    ['spirit_amber', 'Spirit Amber', 500, 480],
    ['grade_bead', 'Grade Bead', 2500, 2300]
  ];
  const insComm = db.prepare(
    `INSERT OR IGNORE INTO commodities (id, name, base_price, current_price) VALUES (?, ?, ?, ?)`
  );
  for (const row of commodities) insComm.run(...row);
}
