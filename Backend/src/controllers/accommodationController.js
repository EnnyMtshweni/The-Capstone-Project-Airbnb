const asyncHandler = require('express-async-handler');
const Accommodation = require('../models/Accommodation');

// @desc    Get all accommodations (supports search & filters)
// @route   GET /api/accommodations
// @access  Public
// Example: /api/accommodations?city=Cape Town&minPrice=500&maxPrice=2000&guests=2
const getAccommodations = asyncHandler(async (req, res) => {
  const { city, minPrice, maxPrice, guests } = req.query;

  const filter = { isActive: true };

  if (city) {
    filter['location.city'] = { $regex: city, $options: 'i' }; // case-insensitive partial match
  }
  if (minPrice || maxPrice) {
    filter.pricePerNight = {};
    if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
  }
  if (guests) {
    filter.maxGuests = { $gte: Number(guests) };
  }

  const accommodations = await Accommodation.find(filter)
    .populate('host', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: accommodations.length,
    data: accommodations,
  });
});

// @desc    Get single accommodation by ID
// @route   GET /api/accommodations/:id
// @access  Public
const getAccommodationById = asyncHandler(async (req, res) => {
  const accommodation = await Accommodation.findById(req.params.id).populate(
    'host',
    'name email avatar'
  );

  if (!accommodation) {
    res.status(404);
    throw new Error('Accommodation not found');
  }

  res.status(200).json({ success: true, data: accommodation });
});

// @desc    Create a new accommodation
// @route   POST /api/accommodations
// @access  Private (host or admin)
const createAccommodation = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    pricePerNight,
    location,
    images,
    amenities,
    maxGuests,
    bedrooms,
    bathrooms,
  } = req.body;

  if (!title || !description || !pricePerNight || !location || !maxGuests) {
    res.status(400);
    throw new Error('Please fill in all required accommodation fields');
  }

  const accommodation = await Accommodation.create({
    title,
    description,
    pricePerNight,
    location,
    images,
    amenities,
    maxGuests,
    bedrooms,
    bathrooms,
    host: req.user._id, // taken from the logged-in user, never trust the client for this
  });

  res.status(201).json({ success: true, data: accommodation });
});

// @desc    Update an accommodation
// @route   PUT /api/accommodations/:id
// @access  Private (host who owns it, or admin)
const updateAccommodation = asyncHandler(async (req, res) => {
  const accommodation = await Accommodation.findById(req.params.id);

  if (!accommodation) {
    res.status(404);
    throw new Error('Accommodation not found');
  }

  // Only the host who owns it, or an admin, may update it
  const isOwner = accommodation.host.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this accommodation');
  }

  const updated = await Accommodation.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // return the updated doc, not the old one
    runValidators: true,
  });

  res.status(200).json({ success: true, data: updated });
});

// @desc    Delete an accommodation
// @route   DELETE /api/accommodations/:id
// @access  Private (host who owns it, or admin)
const deleteAccommodation = asyncHandler(async (req, res) => {
  const accommodation = await Accommodation.findById(req.params.id);

  if (!accommodation) {
    res.status(404);
    throw new Error('Accommodation not found');
  }

  const isOwner = accommodation.host.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this accommodation');
  }

  await accommodation.deleteOne();

  res.status(200).json({ success: true, message: 'Accommodation deleted' });
});

module.exports = {
  getAccommodations,
  getAccommodationById,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
};
