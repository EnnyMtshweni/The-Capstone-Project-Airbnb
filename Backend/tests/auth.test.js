// Basic tests for auth logic that don't require a live database connection.
// These check validation rules directly against the model/controller logic.
// To run full integration tests against a real DB, point MONGO_URI at a
// test database and remove the .skip below.

const mongoose = require('mongoose');
const User = require('../src/models/User');

describe('User model', () => {
  it('should be invalid if email is missing', () => {
    const user = new User({ name: 'Test', password: 'password123' });
    const err = user.validateSync();
    expect(err.errors.email).toBeDefined();
  });

  it('should be invalid if password is too short', () => {
    const user = new User({ name: 'Test', email: 'a@b.com', password: '123' });
    const err = user.validateSync();
    expect(err.errors.password).toBeDefined();
  });

  it('should default role to guest', () => {
    const user = new User({ name: 'Test', email: 'a@b.com', password: 'password123' });
    expect(user.role).toBe('guest');
  });

  it('should reject an invalid email format', () => {
    const user = new User({ name: 'Test', email: 'not-an-email', password: 'password123' });
    const err = user.validateSync();
    expect(err.errors.email).toBeDefined();
  });
});
