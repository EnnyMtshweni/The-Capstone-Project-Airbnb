/**
 * adminRoutes.js
 * All routes under /api/admin — protected by protect + admin middleware.
 * Only users with role === 'admin' can reach these endpoints.
 */

const express = require('express');
const router  = express.Router();
const asyncHandler = require('express-async-handler');
const { protect, admin } = require('../middleware/authMiddleware');
const User          = require('../models/User');
const Accommodation = require('../models/Accommodation');
const Reservation   = require('../models/Reservation');

// Apply protect + admin to every route in this file
router.use(protect, admin);

// ── GET /api/admin/stats ─────────────────────────────────────────────────────
// Returns dashboard KPIs: total listings, reservations, users, revenue
router.get('/stats', asyncHandler(async (req, res) => {
  const [totalListings, totalReservations, totalUsers, revenueResult] = await Promise.all([
    Accommodation.countDocuments({ isActive: true }),
    Reservation.countDocuments(),
    User.countDocuments(),
    Reservation.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
  ]);

  const revenue = revenueResult[0]?.total || 0;

  // Recent 5 reservations for activity feed
  const recentReservations = await Reservation.find()
    .populate('accommodation', 'title location')
    .populate('guest', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      totalListings,
      totalReservations,
      totalUsers,
      revenue,
      recentReservations,
    },
  });
}));

// ── GET /api/admin/users ─────────────────────────────────────────────────────
// Returns all registered users (admin view)
router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, data: users });
}));

// ── PATCH /api/admin/users/:id/role ─────────────────────────────────────────
// Update a user's role (e.g. promote to host)
router.patch('/users/:id/role', asyncHandler(async (req, res) => {
  const { role } = req.body;
  const allowed = ['guest', 'host', 'admin'];
  if (!allowed.includes(role)) {
    res.status(400);
    throw new Error(`Role must be one of: ${allowed.join(', ')}`);
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.status(200).json({ success: true, data: user });
}));

// ── GET /api/admin/reservations ──────────────────────────────────────────────
// All reservations with full population (alias of /api/reservations for admins)
router.get('/reservations', asyncHandler(async (req, res) => {
  const reservations = await Reservation.find()
    .populate('accommodation', 'title location images pricePerNight')
    .populate('guest', 'name email')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: reservations.length, data: reservations });
}));

// ── PATCH /api/admin/reservations/:id/status ────────────────────────────────
router.patch('/reservations/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'cancelled'];
  if (!allowed.includes(status)) {
    res.status(400); throw new Error(`Status must be one of: ${allowed.join(', ')}`);
  }
  const reservation = await Reservation.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate('accommodation', 'title').populate('guest', 'name email');
  if (!reservation) { res.status(404); throw new Error('Reservation not found'); }
  res.status(200).json({ success: true, data: reservation });
}));

// ── GET /api/admin/listings ──────────────────────────────────────────────────
// All listings regardless of isActive, with host info
router.get('/listings', asyncHandler(async (req, res) => {
  const listings = await Accommodation.find()
    .populate('host', 'name email')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: listings.length, data: listings });
}));

// ── PATCH /api/admin/listings/:id/toggle ────────────────────────────────────
// Toggle isActive (publish / unpublish)
router.patch('/listings/:id/toggle', asyncHandler(async (req, res) => {
  const listing = await Accommodation.findById(req.params.id);
  if (!listing) { res.status(404); throw new Error('Listing not found'); }
  listing.isActive = !listing.isActive;
  await listing.save();
  res.status(200).json({ success: true, data: listing });
}));

module.exports = router;
