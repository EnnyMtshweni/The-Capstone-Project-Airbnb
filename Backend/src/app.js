const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const accommodationRoutes = require('./routes/accommodationRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const taplineRoutes = require('./routes/taplineRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// --- Global middleware ---
app.use(cors()); // allows the frontend (different origin) to call this API
app.use(express.json()); // parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // logs each request to the console while developing
}

// --- Health check (useful for confirming deployment worked) ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/tapline', taplineRoutes);

// --- Error handling (must be LAST) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
