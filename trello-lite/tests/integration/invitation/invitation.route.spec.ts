import request from 'supertest';
import { createServer } from '../../../src/app';
import { prisma } from '../../../src/configs';

const app = createServer();

let authToken: string;
let boardId: string;

beforeAll(async () => {
  await prisma.task.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  // Create and login a user to get auth token
  await request(app)
    .post('/api/v1/auth/register')
    .send({ email: 'admin@test.com', username: 'admin', password: 'password123' });

  await prisma.user.update({
    where: { email: 'admin@test.com' },
    data: { role: 'ADMIN' },
  });

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@test.com', password: 'password123' });

  authToken = loginRes.body.access;

  // Create a board to invite to
  const boardRes = await request(app)
    .post('/api/v1/boards')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ name: 'Test Board' });

  boardId = boardRes.body.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/v1/invitations', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/invitations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ boardId });

    expect(res.status).toBe(400);
  });

  it('returns 204 on successful invitation creation', async () => {
    const res = await request(app)
      .post('/api/v1/invitations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ email: 'invite@test.com', boardId });

    expect(res.status).toBe(204);
  });
});

describe('GET /api/v1/invitations/accept', () => {
  it('returns 400 when token query param is missing', async () => {
    const res = await request(app).get('/api/v1/invitations/accept');

    expect(res.status).toBe(400);
  });

  it('returns 200 with boardId when token is valid', async () => {
    // Retrieve the token that was stored in the DB after the invite
    const invitation = await prisma.invitation.findFirst({
      where: { email: 'invite@test.com' },
    });

    const res = await request(app).get(`/api/v1/invitations/accept?token=${invitation!.token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ boardId });
  });
});
