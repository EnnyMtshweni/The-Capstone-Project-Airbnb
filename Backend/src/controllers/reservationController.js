const asyncHandler = require('express-async-handler');
const Reservation = require('../models/Reservation');
const Accommodation = require('../models/Accommodation');

// @desc    Create a reservation (book a stay)
// @route   POST /api/reservations  |  POST /api/tapline/bookings
// @access  Private
const createReservation = asyncHandler(async (req, res) => {
  // Accept both naming conventions (tapline body uses listing_id / accommodationId)
  const accommodationId =
    req.body.accommodationId || req.body.listing_id || req.body.accommodation_id;
  const checkIn   = req.body.checkIn   || req.body.check_in;
  const checkOut  = req.body.checkOut  || req.body.check_out;
  const numGuests = Number(req.body.numGuests || req.body.guests || 1);

  if (!accommodationId || !checkIn || !checkOut) {
    res.status(400);
    throw new Error('Please provide accommodationId, checkIn and checkOut');
  }

  const accommodation = await Accommodation.findById(accommodationId);
  if (!accommodation) {
    res.status(404);
    throw new Error('Accommodation not found');
  }

  if (numGuests > accommodation.maxGuests) {
    res.status(400);
    throw new Error(`This accommodation allows up to ${accommodation.maxGuests} guests`);
  }

  const nights = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
  if (nights <= 0) {
    res.status(400);
    throw new Error('Check-out must be after check-in');
  }

  const totalPrice = Math.round(nights * accommodation.pricePerNight);

  const reservation = await Reservation.create({
    accommodation: accommodationId,
    guest: req.user._id,
    checkIn,
    checkOut,
    numGuests,
    totalPrice,
    status: 'confirmed',
  });

  const populated = await reservation.populate('accommodation', 'title location images pricePerNight');

  res.status(201).json({ success: true, data: populated });
});

// @desc    Get logged-in user's own reservations
// @route   GET /api/reservations/mine  |  GET /api/tapline/bookings/mine
// @access  Private
const getMyReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ guest: req.user._id })
    .populate('accommodation', 'title location images pricePerNight')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: reservations.length, data: reservations });
});

// @desc    Get all reservations (admin only)
// @route   GET /api/reservations
// @access  Private/Admin
const getAllReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find()
    .populate('accommodation', 'title location')
    .populate('guest', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: reservations.length, data: reservations });
});

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private (owner or admin)
const getReservationById = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id)
    .populate('accommodation')
    .populate('guest', 'name email');

  if (!reservation) {
    res.status(404);
    throw new Error('Reservation not found');
  }

  const isOwner = reservation.guest._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this reservation');
  }

  res.status(200).json({ success: true, data: reservation });
});

// @desc    Update reservation status
// @route   PUT /api/reservations/:id
// @access  Private (owner or admin)
const updateReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) { res.status(404); throw new Error('Reservation not found'); }

  const isOwner = reservation.guest.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }

  reservation.status = req.body.status || reservation.status;
  const updated = await reservation.save();
  res.status(200).json({ success: true, data: updated });
});

// @desc    Cancel / delete a reservation
// @route   DELETE /api/reservations/:id  |  DELETE /api/tapline/bookings/:id
// @access  Private (owner or admin)
const deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) { res.status(404); throw new Error('Reservation not found'); }

  const isOwner = reservation.guest.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }

  // Soft cancel rather than hard delete so history is preserved
  reservation.status = 'cancelled';
  await reservation.save();

  res.status(200).json({ success: true, message: 'Reservation cancelled', data: { id: reservation._id, status: 'cancelled' } });
});

module.exports = {
  createReservation,
  getMyReservations,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
};
