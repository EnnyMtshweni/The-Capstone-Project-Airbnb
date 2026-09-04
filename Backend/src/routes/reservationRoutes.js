const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
} = require('../controllers/reservationController');
const { protect, admin, guestOnly } = require('../middleware/authMiddleware');

// IMPORTANT: /mine must be declared before /:id, otherwise Express
// will try to treat "mine" as an :id value.
router.get('/mine', protect, getMyReservations);

router.route('/')
  .get(protect, admin, getAllReservations)   // admin: see every reservation
  .post(protect, guestOnly, createReservation); // guests only: book a stay

router.route('/:id')
  .get(protect, getReservationById)
  .put(protect, updateReservation)
  .delete(protect, deleteReservation);

module.exports = router;
