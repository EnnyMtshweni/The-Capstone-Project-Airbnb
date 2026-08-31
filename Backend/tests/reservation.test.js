const Reservation = require('../src/models/Reservation');
const mongoose = require('mongoose');

describe('Reservation model', () => {
  it('should reject checkOut date before checkIn date', () => {
    const reservation = new Reservation({
      accommodation: new mongoose.Types.ObjectId(),
      guest: new mongoose.Types.ObjectId(),
      checkIn: new Date('2026-10-10'),
      checkOut: new Date('2026-10-05'), // before checkIn - should fail
      numGuests: 2,
      totalPrice: 100,
    });
    const err = reservation.validateSync();
    expect(err.errors.checkOut).toBeDefined();
  });

  it('should default status to pending', () => {
    const reservation = new Reservation({
      accommodation: new mongoose.Types.ObjectId(),
      guest: new mongoose.Types.ObjectId(),
      checkIn: new Date('2026-10-01'),
      checkOut: new Date('2026-10-05'),
      numGuests: 2,
      totalPrice: 100,
    });
    expect(reservation.status).toBe('pending');
  });

  it('should be valid with correct dates', () => {
    const reservation = new Reservation({
      accommodation: new mongoose.Types.ObjectId(),
      guest: new mongoose.Types.ObjectId(),
      checkIn: new Date('2026-10-01'),
      checkOut: new Date('2026-10-05'),
      numGuests: 2,
      totalPrice: 3200,
    });
    const err = reservation.validateSync();
    expect(err).toBeUndefined();
  });
});
