import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

const listStmt = db.prepare('SELECT * FROM favorites ORDER BY created_at DESC');
const insertStmt = db.prepare(`
  INSERT INTO favorites (base_currency, target_currency, created_at)
  VALUES (@base, @target, @createdAt)
  ON CONFLICT(base_currency, target_currency) DO NOTHING
`);
const getPairStmt = db.prepare(
  'SELECT * FROM favorites WHERE base_currency = ? AND target_currency = ?'
);
const deleteStmt = db.prepare('DELETE FROM favorites WHERE id = ?');

// GET /api/favorites
router.get('/', (req, res) => {
  res.json(listStmt.all());
});

// POST /api/favorites  body: { base, target }
router.post('/', (req, res) => {
  const { base, target } = req.body || {};
  if (!base || !target) {
    return res.status(400).json({ error: 'base and target are required' });
  }

  const baseCode = base.toUpperCase();
  const targetCode = target.toUpperCase();

  insertStmt.run({
    base: baseCode,
    target: targetCode,
    createdAt: new Date().toISOString(),
  });

  // Return the row (whether newly inserted or pre-existing).
  const row = getPairStmt.get(baseCode, targetCode);
  res.status(201).json(row);
});

// DELETE /api/favorites/:id
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'invalid id' });
  }

  const info = deleteStmt.run(id);
  if (info.changes === 0) {
    return res.status(404).json({ error: 'favorite not found' });
  }
  res.status(204).end();
});

export default router;
