const express = require('express');
const router = express.Router();
const {
  getAccommodations,
  getAccommodationById,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
} = require('../controllers/accommodationController');
const { protect, hostOrAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAccommodations)                       // Public: search/browse
  .post(protect, hostOrAdmin, createAccommodation); // Private: hosts/admins only

router.route('/:id')
  .get(getAccommodationById)                        // Public: view one listing
  .put(protect, hostOrAdmin, updateAccommodation)    // Private: owner or admin
  .delete(protect, hostOrAdmin, deleteAccommodation);// Private: owner or admin

module.exports = router;
