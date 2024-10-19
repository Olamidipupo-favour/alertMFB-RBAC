
# Role Based Access Control implementation for AlertMFB's interview

## Description

As detailed in the task description mailed to me, I designed the entire backend infrastructre in nest js in combination with prisma( with SQLite as my SQL engine, since I wanted to write code that can be setup with minimal effort.)
I also used libraries like passport, class-validator, class-transformer and bcrypt apart from  nestjs's core libraries for dealing with tasks such as data validation, JWT generation, etc.

The available routes are;
- /users
- /auth/register
- /auth/create/role
- /auth/login
- /users/assign-role
- /user/:id
- /roles
- /api ; swagger docs are located here


## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Applicant details
- Name:  Agboola Olamidipupo Favour
- Email: dipoagboola2019@gmail.com