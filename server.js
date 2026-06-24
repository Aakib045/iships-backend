require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const inquiryRoutes = require('./src/routes/inquiries');
const adminRoutes = require('./src/routes/admin');
const settingsRoutes = require('./src/routes/settings');
const seedAdmin = require('./src/utils/seedAdmin');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS — allow the Vercel frontend and localhost for dev
const allowedOrigins = [
  'https://iships-website.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

app.use(cors({
  origin(origin, cb) {
    // Allow requests with no origin (e.g. curl, Postman, Railway health checks)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '16kb' }));

// Health check — Railway uses this
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/inquiries', inquiryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// 404 catch-all
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).json({ error: 'Internal server error' });
});

connectDB()
  .then(() => seedAdmin())
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => { console.error('Startup failed:', err.message); process.exit(1); });
