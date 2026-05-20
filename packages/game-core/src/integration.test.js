import { test, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDb = path.join(__dirname, '../../../data/test-jjk.db');

before(() => {
  process.env.DATABASE_PATH = testDb;
  if (fs.existsSync(testDb)) fs.unlinkSync(testDb);
});

after(async () => {
  const { closeDb } = await import('./db.js');
  closeDb();
  if (fs.existsSync(testDb)) fs.unlinkSync(testDb);
});

test('full MVP loop', async () => {
  const { GameService, closeDb } = await import('./index.js');
  const a = 'user-a-test';
  const b = 'user-b-test';
  GameService.profile(a, 'Yuji');
  GameService.profile(b, 'Megumi');
  const train = GameService.train(a, 'Yuji', 2);
  assert.equal(train.ok, true);
  const crime = GameService.crime(a, 'Yuji', 'petty_cleanup');
  assert.equal(crime.ok, true);
  const wheel = GameService.wheel(a, 'Yuji');
  assert.equal(wheel.ok, true);
  GameService.bank(a, 'Yuji', 'deposit', 100);
  const work = GameService.work(a, 'Yuji');
  assert.equal(work.ok, true);
  closeDb();
});
