const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // URL base do frontend (usada por cy.visit)
    baseUrl: 'https://front.serverest.dev',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1366,
    viewportHeight: 768,
    // Repete o teste em caso de falha para reduzir flakiness (apenas em modo run)
    retries: {
      runMode: 2,
      openMode: 0,
    },
    video: false,
    env: {
      // URL base da API (usada por cy.request nos testes de API)
      apiUrl: 'https://serverest.dev',
    },
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
