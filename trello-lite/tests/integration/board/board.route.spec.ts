import request from 'supertest';
import { createServer } from '../../../src/app';
import { prisma } from '../../../src/configs';

const app = createServer();

let adminToken: string;
let memberToken: string;
let boardId: string;

beforeAll(async () => {
  await prisma.task.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  // Register member user
  await request(app)
    .post('/api/v1/auth/register')
    .send({ email: 'member@test.com', username: 'member', password: 'password123' });

  const memberLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'member@test.com', password: 'password123' });
  memberToken = memberLogin.body.access;

  // Register admin user then promote via prisma
  await request(app)
    .post('/api/v1/auth/register')
    .send({ email: 'admin@test.com', username: 'admin', password: 'password123' });

  await prisma.user.update({
    where: { email: 'admin@test.com' },
    data: { role: 'ADMIN' },
  });

  const adminLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@test.com', password: 'password123' });
  adminToken = adminLogin.body.access;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/v1/boards', () => {
  it('returns 401 when no token provided', async () => {
    const res = await request(app).post('/api/v1/boards').send({ name: 'Board' });

    expect(res.status).toBe(401);
  });

  it('returns 403 when member tries to create board', async () => {
    const res = await request(app)
      .post('/api/v1/boards')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ name: 'Board' });

    expect(res.status).toBe(403);
  });

  it('returns 400 on validation failure', async () => {
    const res = await request(app)
      .post('/api/v1/boards')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: '' });

    expect(res.status).toBe(400);
  });

  it('returns 201 with created board when admin', async () => {
    const res = await request(app)
      .post('/api/v1/boards')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Board', description: 'A test board' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Test Board', description: 'A test board' });
    boardId = res.body.id;
  });
});

describe('GET /api/v1/boards', () => {
  it('returns 401 when no token provided', async () => {
    const res = await request(app).get('/api/v1/boards');

    expect(res.status).toBe(401);
  });

  it('returns 200 with paginated boards for admin', async () => {
    const res = await request(app)
      .get('/api/v1/boards')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.meta).toMatchObject({ page: 1, limit: 10 });
  });

  it('returns 200 with empty list for member not on any board', async () => {
    const res = await request(app)
      .get('/api/v1/boards')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('GET /api/v1/boards/:id', () => {
  it('returns 401 when no token provided', async () => {
    const res = await request(app).get(`/api/v1/boards/${boardId}`);

    expect(res.status).toBe(401);
  });

  it('returns 404 when board does not exist', async () => {
    const res = await request(app)
      .get('/api/v1/boards/nonexistent-id')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it('returns 403 when member is not on the board', async () => {
    const res = await request(app)
      .get(`/api/v1/boards/${boardId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 200 with board detail for admin', async () => {
    const res = await request(app)
      .get(`/api/v1/boards/${boardId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: boardId, name: 'Test Board' });
  });
});

describe('PATCH /api/v1/boards/:id', () => {
  it('returns 403 when member tries to update board', async () => {
    const res = await request(app)
      .patch(`/api/v1/boards/${boardId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ name: 'Hacked' });

    expect(res.status).toBe(403);
  });

  it('returns 404 when board does not exist', async () => {
    const res = await request(app)
      .patch('/api/v1/boards/nonexistent-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });

  it('returns 200 with updated board when admin', async () => {
    const res = await request(app)
      .patch(`/api/v1/boards/${boardId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Board' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: boardId, name: 'Updated Board' });
  });
});

describe('DELETE /api/v1/boards/:id', () => {
  it('returns 403 when member tries to delete board', async () => {
    const res = await request(app)
      .delete(`/api/v1/boards/${boardId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 204 when admin deletes board', async () => {
    const res = await request(app)
      .delete(`/api/v1/boards/${boardId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });

  it('returns 404 when board is already deleted', async () => {
    const res = await request(app)
      .delete(`/api/v1/boards/${boardId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
