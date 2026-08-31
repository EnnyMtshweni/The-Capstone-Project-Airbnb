const Accommodation = require('../src/models/Accommodation');
const mongoose = require('mongoose');

describe('Accommodation model', () => {
  it('should be invalid without required fields', () => {
    const acc = new Accommodation({});
    const err = acc.validateSync();
    expect(err.errors.title).toBeDefined();
    expect(err.errors.description).toBeDefined();
    expect(err.errors.pricePerNight).toBeDefined();
    expect(err.errors.maxGuests).toBeDefined();
    expect(err.errors.host).toBeDefined();
  });

  it('should reject a negative price', () => {
    const acc = new Accommodation({
      title: 'Test',
      description: 'Test desc',
      pricePerNight: -100,
      location: { address: 'a', city: 'b', country: 'c' },
      maxGuests: 2,
      host: new mongoose.Types.ObjectId(),
    });
    const err = acc.validateSync();
    expect(err.errors.pricePerNight).toBeDefined();
  });

  it('should be valid with all required fields', () => {
    const acc = new Accommodation({
      title: 'Nice place',
      description: 'A nice place to stay',
      pricePerNight: 500,
      location: { address: '1 Main St', city: 'Joburg', country: 'South Africa' },
      maxGuests: 3,
      host: new mongoose.Types.ObjectId(),
    });
    const err = acc.validateSync();
    expect(err).toBeUndefined();
  });
});
