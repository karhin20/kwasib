import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRouter from './routes/auth.js';
import listingsRouter from './routes/listings.js';
import mediaRouter from './routes/media.js';
import chatRouter from './routes/chat.js';
import enquiriesRouter from './routes/enquiries.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', process.env.APP_URL ?? ''],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/media', mediaRouter);
app.use('/api/chat', chatRouter);
app.use('/api/enquiries', enquiriesRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`✅ Akwasi Backend running on http://localhost:${PORT}`);
});

export default app;
