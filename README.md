# ServeRest — Automated Tests (Cypress + JavaScript)

Automated **E2E (frontend)** and **API** tests for the [ServeRest](https://serverest.dev/)
application, built with [Cypress](https://www.cypress.io/) and JavaScript.

- **Frontend:** https://front.serverest.dev/
- **API (Swagger):** https://serverest.dev/

## About the project

This repository contains **3 E2E scenarios** validating the interface and **3 API scenarios**
validating the application endpoints, organized with a focus on readability, reuse and
maintainability.

> 🚧 Documentation in progress — will be expanded as development continues.

## Local environment

The public ServeRest instance (Google App Engine free tier) occasionally returns `503`
(cold start / quota), so the suite defaults to a **fully local, deterministic stack** via
Docker Compose: the API (official image) on port `3000` and the frontend (built from
[`ServeRest/front`](https://github.com/ServeRest/front), pointed at the local API) on port
`3001`.

```bash
npm run stack:up     # builds and starts api + front (waits until healthy)
npm run test:ui      # runs the UI specs against the local stack
npm run stack:down   # tears the stack down
```

Both URLs can be overridden to target the public instance instead:

```bash
CYPRESS_baseUrl=https://front.serverest.dev CYPRESS_apiUrl=https://serverest.dev npm run cy:run
```

## Folder structure

```
cypress/
├── e2e/
│   ├── ui/          # E2E scenarios (interface)
│   └── api/         # API scenarios
├── support/
│   ├── pages/       # Page Objects (POM), BasePage + concrete pages — UI layer
│   ├── services/    # Service Objects, BaseService + concrete services — API layer
│   └── factories/   # Dynamic test data generation (faker)
└── fixtures/        # Static data and test fixtures
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
```
