import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Store the SQLite file in a /data directory next to the server.
const dataDir = join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'rateflow.sqlite');
const db = new Database(dbPath);

// Better concurrency + durability defaults.
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS rate_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    base_currency TEXT NOT NULL,
    target_currency TEXT NOT NULL,
    rate REAL NOT NULL,
    fetched_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    base_currency TEXT NOT NULL,
    target_currency TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(base_currency, target_currency)
  );

  CREATE TABLE IF NOT EXISTS rate_cache (
    base_currency TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    cached_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_rate_history_pair
    ON rate_history (base_currency, target_currency, fetched_at);
`);

export default db;
