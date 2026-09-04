const express = require('express');
const { protect, guestOnly } = require('../middleware/authMiddleware');
const {
  getAccommodations,
  getAccommodationById,
  createAccommodation,
  deleteAccommodation,
} = require('../controllers/accommodationController');
const {
  createReservation,
  getMyReservations,
  deleteReservation,
} = require('../controllers/reservationController');

const router = express.Router();

// ── Accommodation (listings) ──────────────────────────────────────────
// GET  /api/tapline/search          → search/filter listings
// GET  /api/tapline/listings/:id    → single listing
// POST /api/tapline/host/listings   → create listing (auth)
// DELETE /api/tapline/host/listings/:id → delete listing (auth)

router.get('/search', async (req, res) => {
  // Forward query params from GET; also accept POST body
  req.query.city = req.query.query || req.query.city || '';
  return getAccommodations(req, res);
});

router.post('/search', async (req, res) => {
  // Map body fields to query params expected by getAccommodations
  const { query, check_in, check_out, adults, minPrice, maxPrice } = req.body;
  req.query.city      = query    || '';
  req.query.guests    = adults   || '';
  req.query.minPrice  = minPrice || '';
  req.query.maxPrice  = maxPrice || '';
  return getAccommodations(req, res);
});

router.get('/listings/:id', getAccommodationById);

router.post('/host/listings',        protect, createAccommodation);
router.delete('/host/listings/:id',  protect, deleteAccommodation);

// Host: get own listings
router.get('/host/listings', protect, async (req, res) => {
  const Accommodation = require('../models/Accommodation');
  const listings = await Accommodation.find({ host: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: listings.length, data: listings });
});

// ── Reservations (bookings) ───────────────────────────────────────────
router.post('/bookings',        protect, guestOnly, createReservation);
router.get('/bookings/mine',    protect, getMyReservations);
router.delete('/bookings/:id',  protect, deleteReservation);

module.exports = router;
