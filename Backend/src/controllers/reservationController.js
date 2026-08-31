const asyncHandler = require('express-async-handler');
const Reservation = require('../models/Reservation');
const Accommodation = require('../models/Accommodation');

// @desc    Create a reservation (book a stay)
// @route   POST /api/reservations
// @access  Private (logged-in guest)
const createReservation = asyncHandler(async (req, res) => {
  const { accommodationId, checkIn, checkOut, numGuests } = req.body;

  if (!accommodationId || !checkIn || !checkOut || !numGuests) {
    res.status(400);
    throw new Error('Please provide accommodationId, checkIn, checkOut and numGuests');
  }

  const accommodation = await Accommodation.findById(accommodationId);
  if (!accommodation) {
    res.status(404);
    throw new Error('Accommodation not found');
  }

  if (numGuests > accommodation.maxGuests) {
    res.status(400);
    throw new Error(`This accommodation only allows up to ${accommodation.maxGuests} guests`);
  }

  const nights =
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);

  if (nights <= 0) {
    res.status(400);
    throw new Error('Check-out date must be after check-in date');
  }

  const totalPrice = nights * accommodation.pricePerNight;

  const reservation = await Reservation.create({
    accommodation: accommodationId,
    guest: req.user._id,
    checkIn,
    checkOut,
    numGuests,
    totalPrice,
  });

  res.status(201).json({ success: true, data: reservation });
});

// @desc    Get logged-in user's own reservations
// @route   GET /api/reservations/mine
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

// @desc    Get a single reservation by ID
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

// @desc    Update reservation status (e.g. confirm/cancel)
// @route   PUT /api/reservations/:id
// @access  Private (owner or admin)
const updateReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    res.status(404);
    throw new Error('Reservation not found');
  }

  const isOwner = reservation.guest.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this reservation');
  }

  reservation.status = req.body.status || reservation.status;
  const updated = await reservation.save();

  res.status(200).json({ success: true, data: updated });
});

// @desc    Delete / cancel a reservation
// @route   DELETE /api/reservations/:id
// @access  Private (owner or admin)
const deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    res.status(404);
    throw new Error('Reservation not found');
  }

  const isOwner = reservation.guest.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this reservation');
  }

  await reservation.deleteOne();

  res.status(200).json({ success: true, message: 'Reservation deleted' });
});

module.exports = {
  createReservation,
  getMyReservations,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
};
