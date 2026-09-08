import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import './db/database.js';
import ratesRouter from './routes/rates.js';
import convertRouter from './routes/convert.js';
import favoritesRouter from './routes/favorites.js';
import historyRouter from './routes/history.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/rates', ratesRouter);
app.use('/api/convert', convertRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/history', historyRouter);

// 404 for unknown API routes.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Central error handler.
app.use((err, req, res, next) => {
  console.error('[server] unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`RateFlow server listening on http://localhost:${PORT}`);
  // History is served from the Frankfurter time-series API (see routes/history.js),
  // so the local daily snapshot job is no longer needed.
});
