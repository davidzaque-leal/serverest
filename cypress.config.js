const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Frontend base URL (used by cy.visit). Default: local front from
    // docker-compose (deterministic). To target the public instance:
    // CYPRESS_baseUrl=https://front.serverest.dev
    baseUrl: 'http://localhost:3001',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1366,
    viewportHeight: 768,
    // Retries failed tests to reduce flakiness (run mode only)
    retries: {
      runMode: 2,
      openMode: 0,
    },
    video: false,
    env: {
      // ServeRest backend: used by the API tests and to seed data in the UI
      // tests (it's the same API the front consumes). Defaults to local;
      // to target the public instance: CYPRESS_apiUrl=https://serverest.dev
      apiUrl: 'http://localhost:3000',
    },
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
