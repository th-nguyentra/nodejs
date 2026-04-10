import request from 'supertest';
import { createServer } from '../../../src/app';
import { prisma } from '../../../src/configs';

const app = createServer();

let adminToken: string;
let memberToken: string;
let boardId: string;
let taskId: string;

beforeAll(async () => {
  await prisma.task.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  // Register member
  await request(app)
    .post('/api/v1/auth/register')
    .send({ email: 'member@test.com', username: 'member', password: 'password123' });

  const memberLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'member@test.com', password: 'password123' });
  memberToken = memberLogin.body.access;

  // Register and promote admin
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

  // Create a board as admin
  const boardRes = await request(app)
    .post('/api/v1/boards')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Task Board' });
  boardId = boardRes.body.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/v1/tasks', () => {
  it('returns 401 when no token provided', async () => {
    const res = await request(app).post('/api/v1/tasks').send({ boardId, title: 'Task' });

    expect(res.status).toBe(401);
  });

  it('returns 400 on validation failure', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Task' }); // missing boardId

    expect(res.status).toBe(400);
  });

  it('returns 403 when member is not on the board', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ boardId, title: 'Task' });

    expect(res.status).toBe(403);
  });

  it('returns 201 with created task when admin', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ boardId, title: 'My Task', description: 'Do something' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'My Task', boardId, status: 'TODO' });
    taskId = res.body.id;
  });
});

describe('GET /api/v1/tasks', () => {
  it('returns 401 when no token provided', async () => {
    const res = await request(app).get('/api/v1/tasks');

    expect(res.status).toBe(401);
  });

  it('returns 403 when member provides no boardId', async () => {
    const res = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 200 with paginated tasks for admin', async () => {
    const res = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.meta).toMatchObject({ page: 1 });
  });
});

describe('GET /api/v1/tasks/:taskId', () => {
  it('returns 401 when no token provided', async () => {
    const res = await request(app).get(`/api/v1/tasks/${taskId}`);

    expect(res.status).toBe(401);
  });

  it('returns 404 when task does not exist', async () => {
    const res = await request(app)
      .get('/api/v1/tasks/nonexistent-id')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it('returns 200 with task detail for admin', async () => {
    const res = await request(app)
      .get(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: taskId, title: 'My Task' });
  });
});

describe('PATCH /api/v1/tasks/:taskId', () => {
  it('returns 404 when task does not exist', async () => {
    const res = await request(app)
      .patch('/api/v1/tasks/nonexistent-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated' });

    expect(res.status).toBe(404);
  });

  it('returns 200 with updated task when admin', async () => {
    const res = await request(app)
      .patch(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated Task', status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: taskId, title: 'Updated Task', status: 'IN_PROGRESS' });
  });
});

describe('DELETE /api/v1/tasks/:taskId', () => {
  it('returns 403 when member tries to delete task', async () => {
    const res = await request(app)
      .delete(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 204 when admin deletes task', async () => {
    const res = await request(app)
      .delete(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });

  it('returns 404 when task is already deleted', async () => {
    const res = await request(app)
      .delete(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
