import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestDatabase } from './test-utils';
import cookieParser from 'cookie-parser';
import { AdminService } from '../src/modules/admin/admin.service';

describe('Anti-Cheating & Edge Case Tests (e2e)', () => {
  jest.setTimeout(60000);
  let app: INestApplication;
  let testDb: TestDatabase;

  let userACookie: string[];
  let userAHabitId: string;
  let adminCookie: string[];
  let adminUserId: string;

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

    // Register User A
    const regResA = await request(app.getHttpServer()).post('/api/auth/register').send({
      name: 'User A',
      email: `usera_${Date.now()}@mingrid.io`,
      password: 'password123',
    });
    userACookie = regResA.headers['set-cookie'];

    // Create Habit for User A
    const habitRes = await request(app.getHttpServer())
      .post('/api/habits')
      .set('Cookie', userACookie)
      .send({
        title: 'Deep Work',
      });
    userAHabitId = habitRes.body._id;

    // Register Admin
    const regResAdmin = await request(app.getHttpServer()).post('/api/auth/register').send({
      name: 'Admin User',
      email: `admin_${Date.now()}@mingrid.io`,
      password: 'password123',
    });
    adminCookie = regResAdmin.headers['set-cookie'];
    adminUserId = regResAdmin.body.user.id;

    // Promote Admin User in DB
    const adminService = app.get(AdminService);
    await adminService.makeAdmin(adminUserId);
  });

  describe('Out-of-Bounds & Invalid Payload Edge Cases', () => {
    it('should reject day 0 or day 32 (400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .patch('/api/habit-logs/toggle')
        .set('Cookie', userACookie)
        .send({
          habitId: userAHabitId,
          day: 0,
          monthYear: '2026-02',
        })
        .expect(400);

      await request(app.getHttpServer())
        .patch('/api/habit-logs/toggle')
        .set('Cookie', userACookie)
        .send({
          habitId: userAHabitId,
          day: 32,
          monthYear: '2026-02',
        })
        .expect(400);
    });

    it('should reject monthYear in wrong non-YYYY-MM format (400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .patch('/api/habit-logs/toggle')
        .set('Cookie', userACookie)
        .send({
          habitId: userAHabitId,
          day: 15,
          monthYear: 'August 2026',
        })
        .expect(400);
    });

    it('should reject monthYear with invalid 13th month (400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .patch('/api/habit-logs/toggle')
        .set('Cookie', userACookie)
        .send({
          habitId: userAHabitId,
          day: 15,
          monthYear: '2026-13',
        })
        .expect(400);
    });
  });

  describe('IDOR & User Isolation Boundary Tests', () => {
    it('should reject standard user attempting to promote themselves to admin (403 Forbidden)', async () => {
      const regUser = await request(app.getHttpServer()).post('/api/auth/register').send({
        name: 'Normal User',
        email: `normal_${Date.now()}@mingrid.io`,
        password: 'password123',
      });

      const normalCookie = regUser.headers['set-cookie'];
      const normalId = regUser.body.user.id;

      await request(app.getHttpServer())
        .patch(`/api/admin/users/${normalId}/make-admin`)
        .set('Cookie', normalCookie)
        .expect(403);
    });

    it('should prevent an admin from deactivating their own account (400 Bad Request)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/admin/users/${adminUserId}/toggle-status`)
        .set('Cookie', adminCookie)
        .expect(400);

      expect(response.body.message).toContain('cannot deactivate their own account');
    });
  });
});
