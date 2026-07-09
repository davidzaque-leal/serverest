# ServeRest — Automated Tests (Cypress + JavaScript)

Automated **E2E (frontend)** and **API** tests for the [ServeRest](https://serverest.dev/)
application, built with [Cypress](https://www.cypress.io/) and JavaScript.

- **Frontend:** https://front.serverest.dev/
- **API (Swagger):** https://serverest.dev/

## About the project

This repository automates the three core ServeRest flows — **user registration**, **login**,
and **product registration** — end-to-end through the UI and at the API level, plus admin user
registration and the shopping list add/remove flow, organized with a focus on readability, reuse
and maintainability: 43 test cases (30 API, 13 UI) across 9 spec files. See
[docs/test-design.md](docs/test-design.md) (🇧🇷
[PT-BR](docs/test-design.pt-BR.md)) for the full test design analysis: scenario matrices,
boundary values, coverage traceability, and the rationale behind what was automated vs.
documented.

## Design patterns

- **Page Object Model** (`cypress/support/pages/`) — `BasePage` centralizes navigation
  (`visit()`, `visitWithToken()` for admin-only routes); concrete pages (`LoginPage`,
  `RegisterUserPage`, `ProductPage`) extend it and only declare their own elements/actions.
- **Service Object** (`cypress/support/services/`) — `BaseService` centralizes URL resolution
  and request defaults; concrete services (`LoginService`, `UserService`, `ProductService`)
  extend it instead of duplicating `cy.request` boilerplate per endpoint.
- **Factory** (`cypress/support/factories/`) — `user.factory.js` / `product.factory.js` build
  valid, unique test data via [faker](https://fakerjs.dev/) on demand, with per-field overrides
  for negative scenarios.

## Folder structure

```
docker/front/           # Dockerfile that builds ServeRest/front pointed at the local API
docker-compose.yml       # Local stack: api (official image) + front (built above)
docs/                    # Test design documentation (EN + PT-BR)
cypress/
├── e2e/
│   ├── ui/               # E2E specs (login access, login, user/product registration)
│   └── api/               # API specs (usuarios, login, produtos)
├── support/
│   ├── pages/             # Page Objects — BasePage + concrete pages
│   ├── services/          # Service Objects — BaseService + concrete services
│   └── factories/         # Dynamic test data generation (faker)
└── fixtures/              # Static data and test fixtures
```

## Local environment

The public ServeRest instance (Google App Engine free tier) occasionally returns `503`
(cold start / quota), so the suite defaults to a **fully local, deterministic stack** via
Docker Compose: the API (official image) on port `3000` and the frontend (built from
[`ServeRest/front`](https://github.com/ServeRest/front), pointed at the local API) on port
`3001`.

### Prerequisites

- [Docker](https://www.docker.com/) with Compose v2 (`docker compose version` should work).
- Node.js (for `npm install` / running Cypress itself — not needed inside the containers).

### Bringing the API and the front up

```bash
npm run stack:up     # docker compose up -d --build --wait
```

This builds and starts two containers and waits for both to report healthy before returning:

- **`api`** — the official `paulogoncalvesbh/serverest` image, served at
  `http://localhost:3000`. You can hit it directly, e.g. `curl http://localhost:3000/usuarios`.
- **`front`** — built by [`docker/front/Dockerfile`](docker/front/Dockerfile), which clones
  [`ServeRest/front`](https://github.com/ServeRest/front) at build time, patches
  `src/services/utils.js` so the app calls `http://localhost:3000` instead of the public API,
  builds the CRA bundle (requires Node 14, handled inside the image), and serves the static
  build at `http://localhost:3001`. Open that URL in a browser to use the app exactly like the
  Cypress UI specs do.

The first `stack:up` takes a couple of minutes (cloning + `npm install` + CRA build for the
front image); subsequent runs reuse the Docker build cache and start in seconds. Rerunning
`npm run stack:up` is safe/idempotent — Compose recreates only what changed.

### Stopping it

```bash
npm run stack:down   # docker compose down (removes the containers)
```

### Running against the public instance instead

Both URLs can be overridden to skip the local stack entirely and target the public instance:

```bash
CYPRESS_baseUrl=https://front.serverest.dev CYPRESS_apiUrl=https://serverest.dev npm run cy:run
```

## How to run

```bash
npm install

# API tests (spins up a standalone local API automatically)
npm run test:api

# UI tests (requires the local stack, see above)
npm run stack:up
npm run test:ui

# Everything, interactively
npm run cy:open

# Lint / format
npm run lint
npm run format
```

## Test evidence

`npm run test:ui` records visual evidence for every UI run:

- **Video** — one recording per spec file (all its tests), saved to `cypress/videos/`.
- **Screenshot** — one per test, taken right after its final assertion, saved to
  `cypress/screenshots/<spec>/<name>.png`.

Both are local-only build artifacts (ignored by git, regenerated on every run) — not committed
to the repository.

## Code quality

- **ESLint** (flat config, `eslint.config.js`) with `eslint-plugin-cypress`'s recommended rules,
  plus `eslint-config-prettier` to avoid style conflicts.
- **Prettier** for consistent formatting across the whole project, including this README and
  the docs.
