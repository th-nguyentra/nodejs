import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { PrismaClient } from '../generated/prisma/client';

dotenv.config();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

(async () => {
  try {
    // User
    const admin = await prisma.user.upsert({
      where: { email: 'admin@gmail.com' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@gmail.com',
        password: await bcrypt.hash('Admin@123', 10),
        role: 'ADMIN',
      },
    });

    const nguyen = await prisma.user.upsert({
      where: { email: 'nguyen@gmail.com' },
      update: {},
      create: {
        username: 'nguyen',
        email: 'nguyen@gmail.com',
        password: await bcrypt.hash('Nguyen@123', 10),
        role: 'MEMBER',
      },
    });

    const tra = await prisma.user.upsert({
      where: { email: 'tra@gmail.com' },
      update: {},
      create: {
        username: 'tra',
        email: 'tra@gmail.com',
        password: await bcrypt.hash('Tra@123', 10),
        role: 'MEMBER',
      },
    });
    console.log(
      `Seeded 3 users: 1 admin (${admin.email}), 2 members (${nguyen.email}, ${tra.email})`,
    );

    // Boards
    const board1 = await prisma.board.create({
      data: {
        name: 'Project Alpha',
        description: 'Main development board for Project Alpha',
        createdBy: admin.id,
      },
    });

    const board2 = await prisma.board.create({
      data: {
        name: 'Marketing Campaign',
        description: 'Q2 marketing campaign planning',
        createdBy: admin.id,
      },
    });
    console.log(`Seeded 2 boards (${board1.name}, ${board2.name})`);

    // Board Members
    await prisma.boardMember.createMany({
      data: [
        { boardId: board1.id, userId: admin.id },
        { boardId: board1.id, userId: nguyen.id },
        { boardId: board1.id, userId: tra.id },
        { boardId: board2.id, userId: nguyen.id },
        { boardId: board2.id, userId: tra.id },
      ],
      skipDuplicates: true,
    });
    console.log('Seeded board members');

    // Tasks
    await prisma.task.createMany({
      data: [
        {
          boardId: board1.id,
          createdBy: admin.id,
          assigneeId: nguyen.id,
          title: 'Setup CI/CD pipeline',
          description: 'Configure GitHub Actions for automated testing and deployment',
          status: 'IN_PROGRESS',
          dueDate: new Date('2026-04-15'),
        },
        {
          boardId: board1.id,
          createdBy: admin.id,
          assigneeId: tra.id,
          title: 'Write unit tests',
          description: 'Add unit tests for auth and board modules',
          status: 'TODO',
          dueDate: new Date('2026-04-20'),
        },
        {
          boardId: board1.id,
          createdBy: admin.id,
          assigneeId: nguyen.id,
          title: 'Code review PR #12',
          description: 'Review and merge the feature/task-management branch',
          status: 'DONE',
        },
        {
          boardId: board2.id,
          createdBy: nguyen.id,
          assigneeId: tra.id,
          title: 'Design banner assets',
          description: 'Create banner images for the Q2 campaign landing page',
          status: 'TODO',
          dueDate: new Date('2026-04-10'),
        },
        {
          boardId: board2.id,
          createdBy: nguyen.id,
          assigneeId: nguyen.id,
          title: 'Draft email copy',
          description: 'Write the email newsletter content for campaign launch',
          status: 'IN_PROGRESS',
        },
      ],
    });
    console.log('Seeded 5 tasks');
    console.log('Seed completed successfully.');
  } catch (e) {
    console.error('Seed failed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
