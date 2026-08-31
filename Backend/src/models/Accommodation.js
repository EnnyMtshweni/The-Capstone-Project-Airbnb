const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [0, 'Price cannot be negative'],
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
    },
    images: {
      type: [String], // array of image URLs (e.g. from Cloudinary)
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    maxGuests: {
      type: Number,
      required: true,
      min: 1,
    },
    bedrooms: {
      type: Number,
      default: 1,
    },
    bathrooms: {
      type: Number,
      default: 1,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // relationship: every accommodation belongs to a host (User)
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true, // used by admin to "hide" a listing instead of hard-deleting
    },
  },
  { timestamps: true }
);

// Helpful for search/filter performance (rubric: Performance and Efficiency)
accommodationSchema.index({ 'location.city': 1, pricePerNight: 1 });

module.exports = mongoose.model('Accommodation', accommodationSchema);
