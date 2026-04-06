# Trello Lite API

A lightweight task management backend API (Trello-lite) built with Node.js and TypeScript, supporting multi-user collaboration, task lifecycle management, and role-based access control.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Requirements](#requirements)
- [Database Design](#database-design)
- [API Reference](#api-reference)

---

## Targets

- Understand and apply the knowledge learnt to build a practical API.
- Know how to design and implement API, including defining endpoints, handling HTTP methods (GET, POST, PUT, DELETE), request/response, and dealing with data validation and error handling.
- Know how to integrate databases with Node.js APIs like connecting to databases, performing CRUD (Create, Read, Update, Delete) operations.
- Understand the importance of API testing and achieve high code coverage in tests.
- Provide detailed documentation for API.

---

## Team Size

- [Nguyen Tra Thao](mailto:nguyen.trathao@asnet.com.vn)

---

## Overview

Trello Lite is a RESTful backend API that provides:

- **Multi-user collaboration** — invite users to boards via email
- **Task lifecycle management** — create, update, assign, and archive tasks
- **Role-based access control** — Admin and Member roles with distinct permissions

---

## Tech Stack

| Layer          | Technology |
| -------------- | ---------- |
| Runtime        | Node.js    |
| Language       | TypeScript |
| Framework      | Express.js |
| Database       | PostgreSQL |
| ORM            | Prisma     |
| Authentication | JWT        |
| Testing        | Jest       |
| Documentation  | Swagger    |
| Email          | SendGrid   |
| Logging        | Winston    |

---

## Project Structure

```
trello-lite/
├── prisma/
│   ├── migrations/           # Database migration files
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data
├── src/
│   ├── configs/              # App configuration (db, env, swagger, etc.)
│   ├── constants/            # Shared constants and enums
│   ├── middlewares/          # Express middlewares (auth, error handling, etc.)
│   ├── modules/              # Feature modules (each contains its own controller, service, etc.)
│   │   ├── auth/
│   │   │   ├── controller.ts
│   │   │   ├── dto.ts
│   │   │   ├── repository.ts
│   │   │   ├── route.ts
│   │   │   └── service.ts
│   │   └── etc...
│   ├── types/                # Custom TypeScript type declarations
│   ├── utils/                # Utility/helper functions
│   ├── app.ts                # Express app setup
│   └── server.ts             # Server entry point
├── .husky/                   # Git hooks
├── commitlint.config.ts      # Commit message convention
├── eslint.config.mjs         # ESLint configuration
├── jest.config.ts            # Jest configuration
├── lint-staged.config.ts     # Lint-staged configuration
├── prisma.config.ts          # Prisma configuration
├── tsconfig.json             # TypeScript configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm
- Docker
- A SendGrid API key (for invitation emails)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd trello-lite

# Install dependencies
pnpm install

# Copy env
cp .env.example .env
# Then fill in the values in .env
```

### Database Setup

```bash
# Start dev database
pnpm db:up

# Start test database
pnpm db:test:up
```

Update your `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/trello_lite
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/trello_lite_test
```

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed initial data
pnpm db:seed
```

### Running the Server

```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

### Running Tests

```bash
# All tests
pnpm test

# With coverage
pnpm test:coverage
```

### API Documentation

Once the server is running, Swagger docs are available at:

```
http://localhost:<PORT>/api-docs
```

---

## Environment Variables

Create a `.env` file at the project root:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/trello_lite
DATABASE_URL_TEST=postgresql://user:password@localhost:5432/trello_lite_test

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=no-reply@yourdomain.com

```

---

## Requirements

See full requirements documentation [here](https://docs.google.com/document/d/1QyiEFZ7BjQZUXZgJH-pv_VCuBR3JZt1Vd7AldqcgsKE/edit?tab=t.0).

---

## Database Design

See full database design documentation [here](https://docs.google.com/document/d/1QyiEFZ7BjQZUXZgJH-pv_VCuBR3JZt1Vd7AldqcgsKE/edit?tab=t.k7jzbzap5gvm).

---

## API Reference

See full API design documentation [here](https://docs.google.com/document/d/1QyiEFZ7BjQZUXZgJH-pv_VCuBR3JZt1Vd7AldqcgsKE/edit?tab=t.dlgfy82cya6c).

---
