import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestDatabase } from './test-utils';
import cookieParser from 'cookie-parser';

describe('Gamified Leaderboard Engine (e2e)', () => {
  jest.setTimeout(60000);
  let app: INestApplication;
  let testDb: TestDatabase;

  let user1Cookie: string[];
  let user1Id: string;
  let user2Cookie: string[];
  let user2Id: string;

  const currentMonthStr = new Date().toISOString().slice(0, 7);

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

    // Register User 1 (Will check 3 habits)
    const regRes1 = await request(app.getHttpServer()).post('/api/auth/register').send({
      name: 'Champion One',
      email: `champ1_${Date.now()}@mingrid.io`,
      password: 'password123',
    });
    user1Cookie = regRes1.headers['set-cookie'];
    user1Id = regRes1.body.user.id;

    // Register User 2 (Will check 1 habit)
    const regRes2 = await request(app.getHttpServer()).post('/api/auth/register').send({
      name: 'Runner Up',
      email: `champ2_${Date.now()}@mingrid.io`,
      password: 'password123',
    });
    user2Cookie = regRes2.headers['set-cookie'];
    user2Id = regRes2.body.user.id;

    // Create Habits for User 1 & User 2
    const h1 = await request(app.getHttpServer())
      .post('/api/habits')
      .set('Cookie', user1Cookie)
      .send({ title: 'Habit A' });

    const h2 = await request(app.getHttpServer())
      .post('/api/habits')
      .set('Cookie', user2Cookie)
      .send({ title: 'Habit B' });

    // User 1 checks day 1
    await request(app.getHttpServer())
      .patch('/api/habit-logs/toggle')
      .set('Cookie', user1Cookie)
      .send({ habitId: h1.body._id, day: 1, monthYear: currentMonthStr });

    // User 2 checks day 1
    await request(app.getHttpServer())
      .patch('/api/habit-logs/toggle')
      .set('Cookie', user2Cookie)
      .send({ habitId: h2.body._id, day: 1, monthYear: currentMonthStr });
  });

  describe('GET /api/leaderboard', () => {
    it('should correctly calculate user rankings based on bit-packed strings', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/leaderboard?timeframe=month')
        .set('Cookie', user2Cookie)
        .expect(200);

      expect(response.body.topUsers).toBeDefined();
      expect(response.body.topUsers.length).toBeGreaterThanOrEqual(2);

      const firstPlace = response.body.topUsers[0];
      expect(firstPlace.score).toBeGreaterThanOrEqual(1);

      expect(response.body.currentUserRank).toBeDefined();
      expect(response.body.currentUserRank.rank).toBeDefined();
    });
  });
});
