const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); 
const User = require('../models/User');

beforeAll(async () => {
  // Only connect if not already connected (readyState: 0 = disconnected, 1 = connected)
  if (mongoose.connection.readyState === 0) {
    const testDB = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/smarttrack-test';
    await mongoose.connect(testDB);
  }
}, 30000);


// Clean up after each test
afterEach(async () => {
  await User.deleteMany({});

  await new Promise(resolve => setTimeout(resolve, 100));
});

// Close database connection
afterAll(async () => {
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

describe('User Authentication', () => {
  describe('POST /api/users (Register)', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.name).toBe('Test User');
    });

    it('should not register user with existing email', async () => {
      // First registration
      await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      // Try to register again with same email
      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User 2',
          email: 'test@example.com',
          password: 'password456'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('User already exists');
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Create a user before each login test
      await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe('test@example.com');
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/users/me (Protected Route)', () => {
    let token;

    beforeEach(async () => {
      // Register and get token
      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
      token = res.body.token;
    });

    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.name).toBe('Test User');
    });

    it('should not get profile without token', async () => {
      const res = await request(app)
        .get('/api/users/me');

      expect(res.statusCode).toBe(401);
    });

    it('should not get profile with invalid token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(res.statusCode).toBe(401);
    });
  });
});
