export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  discord_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL DEFAULT 'Sorcerer',
  world_id TEXT NOT NULL DEFAULT 'tokyo',
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  coins INTEGER NOT NULL DEFAULT 500,
  bank_balance INTEGER NOT NULL DEFAULT 0,
  gold_objects INTEGER NOT NULL DEFAULT 0,
  rice INTEGER NOT NULL DEFAULT 10,
  ce INTEGER NOT NULL DEFAULT 100,
  focus INTEGER NOT NULL DEFAULT 100,
  resolve INTEGER NOT NULL DEFAULT 100,
  strength INTEGER NOT NULL DEFAULT 10,
  defense INTEGER NOT NULL DEFAULT 10,
  speed INTEGER NOT NULL DEFAULT 10,
  dexterity INTEGER NOT NULL DEFAULT 10,
  hp INTEGER NOT NULL DEFAULT 100,
  max_hp INTEGER NOT NULL DEFAULT 100,
  bravery INTEGER NOT NULL DEFAULT 100,
  job_id TEXT,
  estate_tier INTEGER NOT NULL DEFAULT 0,
  clan_id TEXT,
  education_json TEXT NOT NULL DEFAULT '[]',
  has_bank_card INTEGER NOT NULL DEFAULT 0,
  investment_amount INTEGER NOT NULL DEFAULT 0,
  investment_matures_at TEXT,
  hospital_until TEXT,
  jail_until TEXT,
  last_work_at TEXT,
  wheel_spins_today INTEGER NOT NULL DEFAULT 0,
  wheel_spin_date TEXT,
  login_streak INTEGER NOT NULL DEFAULT 0,
  last_login_date TEXT,
  energy_updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  banned INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS item_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  shop_price INTEGER NOT NULL DEFAULT 0,
  item_type TEXT NOT NULL DEFAULT 'consumable',
  effects_json TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES item_definitions(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  equipped INTEGER NOT NULL DEFAULT 0,
  UNIQUE(player_id, item_id)
);

CREATE TABLE IF NOT EXISTS crime_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  min_level INTEGER NOT NULL DEFAULT 1,
  bravery_cost INTEGER NOT NULL DEFAULT 5,
  xp_reward INTEGER NOT NULL DEFAULT 10,
  coin_reward INTEGER NOT NULL DEFAULT 50,
  fail_chance REAL NOT NULL DEFAULT 0.1,
  jail_chance REAL NOT NULL DEFAULT 0.05,
  hospital_chance REAL NOT NULL DEFAULT 0.05
);

CREATE TABLE IF NOT EXISTS job_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  coin_payout INTEGER NOT NULL DEFAULT 100,
  xp_payout INTEGER NOT NULL DEFAULT 50,
  min_level INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL REFERENCES players(id),
  kind TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  meta_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pvp_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attacker_id INTEGER NOT NULL,
  defender_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  winner_id INTEGER,
  coins_transferred INTEGER NOT NULL DEFAULT 0,
  xp_gained INTEGER NOT NULL DEFAULT 0,
  detail_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS market_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_id INTEGER NOT NULL REFERENCES players(id),
  item_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price INTEGER NOT NULL,
  listed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gold_market_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_id INTEGER NOT NULL REFERENCES players(id),
  gold_amount INTEGER NOT NULL,
  price INTEGER NOT NULL,
  listed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  bank_balance INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS estate_tiers (
  tier INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  cost INTEGER NOT NULL,
  train_multiplier REAL NOT NULL DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS education_courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  min_level INTEGER NOT NULL DEFAULT 1,
  cost INTEGER NOT NULL DEFAULT 0,
  bonus_json TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS commodities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_price INTEGER NOT NULL,
  current_price INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS player_commodities (
  player_id INTEGER NOT NULL REFERENCES players(id),
  commodity_id TEXT NOT NULL REFERENCES commodities(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (player_id, commodity_id)
);

CREATE TABLE IF NOT EXISTS delve_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL REFERENCES players(id),
  depth INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_players_discord ON players(discord_id);
CREATE INDEX IF NOT EXISTS idx_market_seller ON market_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_pvp_attacker ON pvp_log(attacker_id);
`;
