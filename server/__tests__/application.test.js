const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Application = require('../models/Application');

let token;
let userId;

// Setup test database
beforeAll(async () => {
 
  if (mongoose.connection.readyState === 0) {
    const testDB = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/smarttrack-test';
    await mongoose.connect(testDB);
  }
}, 30000); // Increase timeout to 30 seconds

// Create a user and get token before each test
beforeEach(async () => {
  
  await Application.deleteMany({});
  await User.deleteMany({});
  

  await new Promise(resolve => setTimeout(resolve, 100));

  const res = await request(app)
    .post('/api/users')
    .send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

  token = res.body.token;
  userId = res.body._id;
  
  
  expect(token).toBeDefined();
  expect(userId).toBeDefined();
});

// Cleanup
afterAll(async () => {

  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

describe('Application CRUD Operations', () => {
  describe('POST /api/applications (Create)', () => {
    it('should create a new application', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${token}`)
        .send({
          companyName: 'Google',
          role: 'Software Engineer',
          oaLink: 'https://example.com/oa',
          notes: 'Applied through referral'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.companyName).toBe('Google');
      expect(res.body.role).toBe('Software Engineer');
      expect(res.body.status).toBe('applied');
    });

    it('should not create application without auth', async () => {
      const res = await request(app)
        .post('/api/applications')
        .send({
          companyName: 'Google',
          role: 'Software Engineer'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/applications (Read)', () => {
    beforeEach(async () => {
      // Create some test applications
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${token}`)
        .send({ companyName: 'Google', role: 'SWE' });

      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${token}`)
        .send({ companyName: 'Microsoft', role: 'Developer' });
    });

    it('should get all user applications', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.applications).toHaveLength(2);
      expect(res.body.totalApplications).toBe(2);
    });

    it('should filter applications by status', async () => {
      const res = await request(app)
        .get('/api/applications?status=applied')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.applications.every(app => app.status === 'applied')).toBe(true);
    });

    it('should not get applications without auth', async () => {
      const res = await request(app)
        .get('/api/applications');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/applications/:id (Update)', () => {
    let applicationId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${token}`)
        .send({ companyName: 'Google', role: 'SWE' });

      applicationId = res.body._id;
    });

    it('should update application', async () => {
      const res = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'in-progress',
          notes: 'Interview scheduled'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('in-progress');
      expect(res.body.notes).toBe('Interview scheduled');
    });

    it('should not update non-existent application', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/applications/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'offer' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/applications/:id', () => {
    let applicationId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${token}`)
        .send({ companyName: 'Google', role: 'SWE' });

      applicationId = res.body._id;
    });

    it('should delete application', async () => {
      const res = await request(app)
        .delete(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Application deleted successfully');

      // Verify it's deleted
      const getRes = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.body.applications).toHaveLength(0);
    });
  });
});
