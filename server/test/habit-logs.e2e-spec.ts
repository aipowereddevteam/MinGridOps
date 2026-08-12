import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestDatabase } from './test-utils';
import cookieParser from 'cookie-parser';

describe('Habit Logs Bit-Packing Engine (e2e)', () => {
  jest.setTimeout(60000);
  let app: INestApplication;
  let testDb: TestDatabase;

  let userACookie: string[];
  let userAHabitId: string;

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

    const uniqueEmail = `usera_${Date.now()}_${Math.floor(Math.random() * 1000)}@mingrid.io`;

    // Register User A
    const regRes = await request(app.getHttpServer()).post('/api/auth/register').send({
      name: 'User A',
      email: uniqueEmail,
      password: 'password123',
    });
    userACookie = regRes.headers['set-cookie'];

    // Create Habit for User A
    const habitRes = await request(app.getHttpServer())
      .post('/api/habits')
      .set('Cookie', userACookie)
      .send({
        title: 'Deep Work',
        icon: 'Zap',
        color: '#6366f1',
      });
    userAHabitId = habitRes.body._id;
  });

  describe('PATCH /api/habit-logs/toggle Bit-Packing Engine', () => {
    it('should initialize completionString with 31 zeros on first check-in and toggle day 1 to "1"', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/habit-logs/toggle')
        .set('Cookie', userACookie)
        .send({
          habitId: userAHabitId,
          day: 1,
          monthYear: '2026-02',
        })
        .expect(200);

      expect(response.body.completionString.length).toBe(31);
      expect(response.body.completionString[0]).toBe('1');
      expect(response.body.completionString.substring(1)).toBe('0'.repeat(30));
    });

    it('should toggle an already checked day back from "1" to "0"', async () => {
      // First toggle: 0 -> 1
      await request(app.getHttpServer())
        .patch('/api/habit-logs/toggle')
        .set('Cookie', userACookie)
        .send({
          habitId: userAHabitId,
          day: 15,
          monthYear: '2026-02',
        });

      // Second toggle: 1 -> 0
      const response = await request(app.getHttpServer())
        .patch('/api/habit-logs/toggle')
        .set('Cookie', userACookie)
        .send({
          habitId: userAHabitId,
          day: 15,
          monthYear: '2026-02',
        })
        .expect(200);

      expect(response.body.completionString[14]).toBe('0');
    });

    it('should handle February month boundary (day 28) correctly', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/habit-logs/toggle')
        .set('Cookie', userACookie)
        .send({
          habitId: userAHabitId,
          day: 28,
          monthYear: '2026-02',
        })
        .expect(200);

      expect(response.body.completionString[27]).toBe('1');
    });

    it('should reject invalid day out of bounds (>31) (400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .patch('/api/habit-logs/toggle')
        .set('Cookie', userACookie)
        .send({
          habitId: userAHabitId,
          day: 35,
          monthYear: '2026-02',
        })
        .expect(400);
    });

    it('should reject future date toggle attempts (400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .patch('/api/habit-logs/toggle')
        .set('Cookie', userACookie)
        .send({
          habitId: userAHabitId,
          day: 28,
          monthYear: '2099-12',
        })
        .expect(400);
    });

    it('should prevent User B from toggling User A\'s habit log (404 Not Found)', async () => {
      const userBEmail = `userb_${Date.now()}_${Math.floor(Math.random() * 1000)}@mingrid.io`;
      // Register User B
      const regResB = await request(app.getHttpServer()).post('/api/auth/register').send({
        name: 'User B',
        email: userBEmail,
        password: 'password123',
      });
      const userBCookie = regResB.headers['set-cookie'];

      // User B attempts to toggle User A's habit
      await request(app.getHttpServer())
        .patch('/api/habit-logs/toggle')
        .set('Cookie', userBCookie)
        .send({
          habitId: userAHabitId,
          day: 1,
          monthYear: '2026-02',
        })
        .expect(404);
    });
  });
});
