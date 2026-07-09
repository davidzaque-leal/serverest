const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // URL base do frontend (usada por cy.visit). Padrão: front local do
    // docker-compose (determinístico). Para apontar ao público:
    // CYPRESS_baseUrl=https://front.serverest.dev
    baseUrl: 'http://localhost:3001',
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
      // Backend do ServeRest: usado pelos testes de API e para semear massa
      // nos testes de UI (é a mesma API que o front consome). Padrão local;
      // para apontar ao público: CYPRESS_apiUrl=https://serverest.dev
      apiUrl: 'http://localhost:3000',
    },
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
