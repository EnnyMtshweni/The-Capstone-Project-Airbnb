const express = require('express');
const { searchTapline } = require('../controllers/taplineController');

const router = express.Router();

router.post('/search', searchTapline);

module.exports = router;