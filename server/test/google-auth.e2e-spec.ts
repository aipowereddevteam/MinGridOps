import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestDatabase } from './test-utils';
import cookieParser from 'cookie-parser';
import { AuthService } from '../src/modules/auth/auth.service';

describe('Google OAuth Authentication (e2e)', () => {
  jest.setTimeout(60000);
  let app: INestApplication;
  let testDb: TestDatabase;
  let authService: AuthService;

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
    authService = moduleFixture.get<AuthService>(AuthService);
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

  describe('POST /api/auth/google', () => {
    it('should reject missing idToken payload (400 Bad Request)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/google')
        .send({})
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should reject invalid or forged idToken (401 Unauthorized)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/google')
        .send({
          idToken: 'invalid_forged_google_id_token_123',
        })
        .expect(401);
    });

    it('should successfully authenticate mocked Google ID token and return user & set-cookie', async () => {
      // Mock OAuth2Client.verifyIdToken for test
      jest.spyOn((authService as any).googleOAuthClient, 'verifyIdToken').mockResolvedValueOnce({
        getPayload: () => ({
          email: 'google.tester@mingrid.io',
          name: 'Google Tester',
          picture: 'https://lh3.googleusercontent.com/a/avatar.jpg',
        }),
      } as any);

      const response = await request(app.getHttpServer())
        .post('/api/auth/google')
        .send({
          idToken: 'mock_valid_google_token',
        })
        .expect(200);

      expect(response.body.user.email).toBe('google.tester@mingrid.io');
      expect(response.body.user.name).toBe('Google Tester');
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });
});
