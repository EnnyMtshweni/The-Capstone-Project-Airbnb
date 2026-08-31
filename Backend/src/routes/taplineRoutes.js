const express = require('express');
const { searchTapline } = require('../controllers/taplineController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/search', protect, searchTapline);

module.exports = router;