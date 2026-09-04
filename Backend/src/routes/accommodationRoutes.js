const express = require('express');
const router = express.Router();
const {
  getAccommodations,
  getAccommodationById,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
} = require('../controllers/accommodationController');
const { protect, admin, hostOrAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAccommodations)                       // Public: search/browse
  .post(protect, admin, createAccommodation); // Private: admins only

router.route('/:id')
  .get(getAccommodationById)                        // Public: view one listing
  .put(protect, hostOrAdmin, updateAccommodation)    // Private: owner or admin
  .delete(protect, admin, deleteAccommodation);       // Private: admins only

module.exports = router;
