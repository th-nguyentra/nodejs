# Node.js Training Plan

**nguyen.thaotra** | 25th Feb 2026

## Overview

This training plan aims to equip new backend developers with the necessary skills and knowledge to develop APIs using Node.js.

## Targets

- A better understanding of Node.js fundamentals
- Build RESTful APIs with Node.js frameworks (e.g., Express.js)
- Understand data management using databases and handle CRUD operations

## Reference Timeline

- **Reading:** 16 days
- **Practice:** TBD

---

## Reading Plan

### Node.js Fundamentals

**Book:** Pro Node.js for Developers

**Targets:**

- Understand the basics of Node.js
- Understand how Node.js handles asynchronous operations and utilizes its event loop
- Explore the Node.js ecosystem, npm (Node Package Manager), and module system
- Understanding HTTP fundamentals (method, status code, header, request, response, etc)
- Understand major concepts of Express.js, a popular web framework for Node.js

**Reading Content:**

- Chapter 1: Getting Started
- Chapter 2: The Node Module System
- Chapter 3: The Node Programming Model
- Chapter 4: Events and Timers
- Chapter 5: The Command Line Interface
- Chapter 6: The File System
- Chapter 11: HTTP
- Chapter 12: The Express Framework

---

### API Development

**Book:** Building API with Node.js

**Targets:**

- Understand how to build APIs with Node.js
- Understand how to integrate databases with Node.js APIs and perform CRUD operations
- Implement secure authentication and authorization mechanisms to protect API endpoints
- Learn to write unit tests and integration tests for Node.js applications

**Reading Content:**

- Chapter 4: Building an API
- Chapter 5: Working with SQL databases
- Chapter 6: CRUDify API resources
- Chapter 7: Authenticating users
- Chapter 8+9: Testing the application

---

### Prisma ORM

**Docs:** https://www.prisma.io/docs/orm

**Targets:**

- Configure and establish database connections in Node.js application using Prisma
- Learn to define database schema and manage model relationships
- Perform CRUD operations on models
- Manage schema changes and migration

**Focus On:**

- Overview
- Prisma Schema
  - Overview
  - Data model
  - Models
  - Relations
  - Indexes
- Prisma Migrate
  - Understanding Prisma Migrate
  - Overview
  - Mental model
- Prisma Client
  - Setup & configuration
  - Introduction
  - Generating Prisma client
  - Queries:
    - CRUD
    - Select fields
    - Relation queries
    - Filtering and sorting
    - Pagination
    - Excluding fields
    - Case sensitivity
    - Query optimization
    - Write your own SQL
    - Raw queries
  - Testing
    - Unit testing
    - Integration testing

---

### Swagger/OpenAPI

**Docs:** https://swagger.io/docs/specification/v3_0/about/

**Targets:**

- Understand what Swagger/OpenAPI is and why it is used
- Document REST API endpoints using the OpenAPI specification
- Serve interactive API documentation using Swagger UI in a Node.js application

**Focus On:**

- What is OpenAPI?
- Basic structure
- API Server and Base Path
- Paths and Operations
- Describing Parameters
- Describing Request Body
  - Overview
- Describing Responses
- Data Models (Schemas)
  - Data Types
  - Enums
- Authentication
  - Basic Authentication
  - Bearer Authentication

---

### Further Reading

- Repository pattern
- Data Transfer Object (DTO)

---

## Practice Plan

### Targets

- Understand and apply knowledge learnt to build a practical API
- Know how to design and implement API, including defining endpoints, handling HTTP methods (GET, POST, PUT, DELETE), request/response, and dealing with data validation and error handling
- Know how to integrate databases with Node.js APIs like connecting to databases, performing CRUD (Create, Read, Update, Delete) operations
- Understand the importance of API testing and achieve high code coverage in tests
- Provide detailed documentation for API

### Timeline

TBD _(Note: The trainee can estimate themselves.)_

### Tech Stacks

| Layer          | Technology           |
| -------------- | -------------------- |
| Backend        | Node.js (TypeScript) |
| Framework      | Express.js           |
| Database       | PostgreSQL           |
| ORM            | Prisma               |
| Authentication | JWT                  |
| Testing        | Jest                 |
| Documentation  | Swagger              |

### Requirements

TBD

#### Non-Functional Requirements

**API Basics:**

- Use proper HTTP methods: GET, POST, PUT/PATCH, DELETE
- Clear HTTP status codes
- Consistent response format
- Apply API versioning: `/api/v1`
- Clear project structure: Layer-based (MVC) or Domain-based

**Documentation:**

- Database design
- API design
- README.md
- OpenAPI (Swagger) spec

**Security:**

- Authentication: JWT token
- Authorization: Role-based access
- Input Validation

**Error Handling:**

- Centralized error handler middleware
- Consistent error response format

**Testing:**

- At least:
  - 2–3 e2e tests (API endpoints)
  - 1–2 unit tests (business logic), coverage > 80%

**Logging:**

- Request logging
- Error logging
