const asyncHandler = require('express-async-handler');

const TAPLINE_SEARCH_URL = 'https://api.tapline.sh/api/v1/airbnb/search';

const searchTapline = asyncHandler(async (req, res) => {
  if (!process.env.TAPLINE_API_KEY) {
    res.status(503);
    throw new Error('Tapline integration is not configured');
  }

  const response = await fetch(TAPLINE_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.TAPLINE_API_KEY,
    },
    body: JSON.stringify(req.body),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    res.status(response.status === 422 ? 400 : response.status);
    throw new Error(payload.detail || payload.message || 'Tapline search failed');
  }

  res.status(200).json({ success: true, data: payload });
});

module.exports = { searchTapline };