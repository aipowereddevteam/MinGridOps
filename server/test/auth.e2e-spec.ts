import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestDatabase } from './test-utils';
import cookieParser from 'cookie-parser';


describe('Auth & RBAC Security (e2e)', () => {
  jest.setTimeout(60000);
  let app: INestApplication;
  let testDb: TestDatabase;


  beforeAll(async () => {
    testDb = new TestDatabase();
    const uri = await testDb.start();
    process.env.MONGO_URI = uri;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (testDb) {
      await testDb.stop();
    }
  });

  beforeEach(async () => {
    await testDb.clearDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should reject registration with invalid email format (400 Bad Request)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'not-an-email',
          password: 'password123',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should reject registration with short password (400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'valid@example.com',
          password: '123',
        })
        .expect(400);
    });

    it('should successfully register a valid user and return set-cookie header', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Enterprise User',
          email: 'enterprise@mingrid.io',
          password: 'securePassword123!',
        })
        .expect(201);

      expect(response.body.user.email).toBe('enterprise@mingrid.io');
      expect(response.body.user.password).toBeUndefined(); // Password must never be returned
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject registration with already registered email (409 Conflict)', async () => {
      await request(app.getHttpServer()).post('/api/auth/register').send({
        name: 'User 1',
        email: 'duplicate@mingrid.io',
        password: 'password123',
      });

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'User 2',
          email: 'duplicate@mingrid.io',
          password: 'password123',
        })
        .expect(409);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer()).post('/api/auth/register').send({
        name: 'Auth User',
        email: 'auth@mingrid.io',
        password: 'correctPassword123',
      });
    });

    it('should reject login with wrong password (401 Unauthorized)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'auth@mingrid.io',
          password: 'wrongPassword',
        })
        .expect(401);
    });

    it('should login successfully with correct credentials (200 OK)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'auth@mingrid.io',
          password: 'correctPassword123',
        })
        .expect(200);

      expect(response.body.user.email).toBe('auth@mingrid.io');
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('Protected Routes & RBAC Security', () => {
    it('should block unauthenticated access to /api/auth/me (401 Unauthorized)', async () => {
      await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });

    it('should block standard user from accessing admin endpoints (403 Forbidden)', async () => {
      // Register standard user
      const regRes = await request(app.getHttpServer()).post('/api/auth/register').send({
        name: 'Standard User',
        email: 'standard@mingrid.io',
        password: 'password123',
      });

      const cookie = regRes.headers['set-cookie'];

      // Attempt to access admin users endpoint
      await request(app.getHttpServer())
        .get('/api/admin/users')
        .set('Cookie', cookie)
        .expect(403);
    });
  });
});
