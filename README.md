# AlertMFB RBAC API

Role-based access control API built with NestJS, Prisma, and SQLite for an
AlertMFB interview task.

## Stack

- NestJS 10
- Prisma 5 with SQLite
- Passport JWT, 2-day token expiry
- bcrypt password hashing
- class-validator and class-transformer
- Swagger

## Features

- Register and log in users
- Create roles with permission strings
- Assign roles to users
- List users and roles
- Delete users
- Swagger docs

## Setup

```bash
yarn install
cp .env.example .env
npx prisma migrate dev
yarn start:dev
```

Set `JWT_SECRET` in `.env` before running anything outside local tests. The
default is intentionally insecure.

The API listens on `http://localhost:3000`. Swagger is at `/api`.

## Routes

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET` | `/users` | List users |
| `POST` | `/auth/register` | Create a user |
| `POST` | `/auth/login` | Log in and receive a JWT |
| `POST` | `/auth/create/role` | Create a role with permissions |
| `POST` | `/user/assign-role` | Assign a role to a user |
| `DELETE` | `/user/:id` | Delete a user |
| `GET` | `/roles` | List roles |

## Tests

```bash
yarn test
yarn test:e2e
yarn test:cov
```

## Notes

SQLite keeps setup to one command, which is why the interview task uses it.
`prisma/dev.db` is local test data, not a production database.
