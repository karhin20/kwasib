import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRouter from './routes/auth.js';
import listingsRouter from './routes/listings.js';
import mediaRouter from './routes/media.js';
import chatRouter from './routes/chat.js';
import enquiriesRouter from './routes/enquiries.js';
import subscriptionsRouter from './routes/subscriptions.js';
import smsRouter from './routes/sms.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://akwasijob.vercel.app',
  'https://akwasijob.vercel.app/',
  process.env.APP_URL,
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps/curl) or if matching allowedOrigins/vercel.app domains
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive CORS for marketplace API
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));

// ── Routes (Both /api/* and root paths for Vercel rewriting) ─────────────────
app.use('/api/auth', authRouter);
app.use('/auth', authRouter);

app.use('/api/listings', listingsRouter);
app.use('/listings', listingsRouter);

app.use('/api/media', mediaRouter);
app.use('/media', mediaRouter);

app.use('/api/chat', chatRouter);
app.use('/chat', chatRouter);

app.use('/api/enquiries', enquiriesRouter);
app.use('/enquiries', enquiriesRouter);

app.use('/api/subscriptions', subscriptionsRouter);
app.use('/subscriptions', subscriptionsRouter);

app.use('/api/sms', smsRouter);
app.use('/sms', smsRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get(['/api/health', '/health', '/'], (_req, res) => {
  res.json({
    status: 'ok',
    service: 'AkwasiJob Backend API',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ Akwasi Backend running on http://localhost:${PORT}`);
  });
}

export default app;
