# Watu

First reproducible version of the technical exercise using Playwright, TypeScript, MySQL,
Flyway, Prisma and WireMock.

## What is covered

- DemoQA Book Store visual evidence on Chromium, Firefox and an emulated iPhone.
- Configurable user generation with a safe maximum and configurable starting ID.
- Database schema managed only by Flyway and introspected by Prisma.
- Idempotent DML seed for `Superuser`, `Editor` and `ReadOnly` role combinations.
- Explicit SQL `JOIN` through Prisma with JSON evidence attached to the report.
- WireMock contract tests for health, listing, detail, creation, validation, authentication and
  missing resources.
- ESLint, TypeScript, Prettier, Husky and GitHub Actions.

## Prerequisites

- Node.js 20 or newer. CI uses Node.js 22.
- npm.
- Docker with Docker Compose v2.

## Initial setup

```bash
npm ci
cp .env.example .env
npx playwright install chromium firefox
```

The assignment requires 20 users, so `USER_COUNT=20` is the default. The generator is not
hard-coded to IDs 1 through 20. These variables can be changed in `.env`:

```dotenv
USER_COUNT=250
MAX_USER_COUNT=1000
USER_ID_START=1001
```

The example above creates 250 users with IDs from 1001 through 1250. Generation fails early if
`USER_COUNT` exceeds `MAX_USER_COUNT`, if a value is not a positive integer, or if the resulting
ID exceeds JavaScript's safe integer range.

## Run with two commands

Start MySQL, run Flyway, and then start WireMock:

```bash
docker compose up -d --wait
```

Prepare data and run UI, database and API suites sequentially:

```bash
npm run test:e2e
```

Reports are written separately to avoid one sequential phase overwriting another:

```text
reports/ui/
reports/db/
reports/api/
```

Run an individual phase when developing:

```bash
npm run test:ui
npm run test:db
npm run test:api
```

Run all static checks:

```bash
npm run quality
```

Stop the services while keeping the MySQL volume:

```bash
docker compose down
```

To deliberately reset the disposable local test database, remove the Compose volume and start it
again:

```bash
docker compose down -v
docker compose up -d --wait
```

## Architecture decisions

The project separates test data, UI interaction and assertions into `data/`, `pages/` and
`tests/`. Page Objects expose stable user interactions but contain no assertions. Test files are
further separated into UI, database and API suites so that the required sequential command remains
clear while every suite continues to use the same Playwright reporter and attachment mechanism.

Flyway is the only owner of database structure. Prisma reads `DATABASE_URL` from the environment,
while the SQL migration corrects the invalid foreign-key references, duplicate constraint name,
MySQL identifier syntax and invalid timezone-bearing `DATETIME` default from the supplied task. The
repository keeps an introspection snapshot so TypeScript can be checked after installation;
`npm run db:prepare` refreshes it from the running database with `prisma db pull`. Prisma Migrate and
`db push` are deliberately not used. Role data lives in a separate, idempotent DML seed, and role
assignments use `INSERT ... SELECT` so they work with any configured user range.

Docker Compose expresses the required startup order with a MySQL healthcheck, Flyway's successful
one-shot completion and WireMock startup. The WireMock API is intentionally richer than a single
happy path: mappings have priorities and test request headers, query parameters, JSON bodies,
success responses and structured errors. `scripts/run-e2e.ts` executes the phases sequentially and
stops immediately when a phase fails. In CI, the static quality gate runs before Playwright browser
installation and Docker startup so invalid code fails before infrastructure resources are allocated.

## Corrected SQL assumptions

The task's SQL cannot execute unchanged on a default MySQL installation. This project makes the
smallest necessary corrections:

- Uses MySQL backtick identifiers instead of incompatible double quotes.
- References `Role.id` instead of the nonexistent `Role.role_id`.
- References `UserPhone.user_id` instead of the nonexistent `appuser_id`.
- Gives the UserPhone foreign key a unique and accurate constraint name.
- Removes the trailing comma in `UserPhone`.
- Uses `1970-01-01 00:00:00` because MySQL `DATETIME` does not store a timezone offset.
- Keeps the supplied non-auto-increment `BIGINT` user and role IDs and assigns them explicitly.

## Test data behavior

The generator uses deterministic Faker data and Prisma `upsert`, making repeated execution safe for
the configured ID range. It does not remove records outside that range. If the count is reduced and
an exact clean dataset is needed, reset the disposable Compose volume as described above.

Role assignment uses the following deterministic data-generation strategy:

- Every active user receives `ReadOnly`.
- Every active user with an even ID also receives `Editor`.
- The first active user and every tenth ID also receive `Superuser`.

These rules exist only to produce reproducible role combinations; they are not treated as business
requirements. The database test therefore does not assert that a particular ID must receive a
particular role. It verifies the required role catalog, confirms that the generated users have more
than one combination when multiple users are requested, performs an explicit `INNER JOIN`, verifies
every expected configurable ID and attaches the complete result as `users-with-roles.json`. `BIGINT`
values are converted to strings only while serializing the report evidence.

## WireMock contract

The mock service provides:

| Scenario                    | Expected result                            |
| --------------------------- | ------------------------------------------ |
| `GET /api/v1/health`        | `200` health response                      |
| Valid book list request     | `200` list and pagination contract         |
| Known ISBN                  | `200` detailed book contract               |
| Valid reservation           | `201`, response body and `Location` header |
| Invalid reservation         | `422` structured field errors              |
| Missing `X-Client-Id`       | `401` structured authentication error      |
| Unknown authorized resource | `404` structured not-found error           |

The original task does not define an API contract. This deterministic book/reservation contract was
chosen because it relates to the DemoQA Book Store while exercising different request-matching and
response-validation techniques.

## Known limitations

- DemoQA is an external website and can change or be unavailable independently of this repository.
- The visual test uses key-element comparison and attaches a stable table screenshot as evidence. It
  is deliberately not described as pixel-based golden-image regression, which would require
  baselines generated and maintained in the same Linux environment used by CI.
- Nairobi geolocation is configured for all browser projects, although the Book Store page does not
  currently expose location-dependent behavior.
- MySQL test data is persistent between local runs by design. Resetting the disposable volume is an
  explicit operation.
- The WireMock service is a test double, not an implementation of a production book service.

## Delivery plan

See [`docs/delivery-plan.md`](docs/delivery-plan.md) for the incremental review and improvement plan.
