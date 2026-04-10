import request from 'supertest';
import { createServer } from '../../../src/app';
import { prisma } from '../../../src/configs';

const app = createServer();

beforeAll(async () => {
  await prisma.task.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/v1/auth/register', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ email: 'a@a.com' });

    expect(res.status).toBe(400);
  });

  it('returns 201 with user data and access token on success', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'alice@test.com', username: 'alice', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ email: 'alice@test.com', username: 'alice' });
    expect(res.body.data).not.toHaveProperty('password');
    expect(res.body.access).toBeDefined();
  });

  it('returns 409 when email or username already exists', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'alice@test.com', username: 'alice', password: 'password123' });

    expect(res.status).toBe(409);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ password: 'password123' });

    expect(res.status).toBe(400);
  });

  it('returns 404 when user does not exist', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'notexist@test.com', password: 'password123' });

    expect(res.status).toBe(404);
  });

  it('returns 401 when password is wrong', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@test.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('returns 200 with user data and access token on success', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ email: 'alice@test.com', username: 'alice' });
    expect(res.body.data).not.toHaveProperty('password');
    expect(res.body.access).toBeDefined();
  });
});
