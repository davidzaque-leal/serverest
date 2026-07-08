const globals = require('globals');
const cypress = require('eslint-plugin-cypress');
const prettier = require('eslint-config-prettier');

module.exports = [
  // Ignora artefatos e dependências
  {
    ignores: [
      'node_modules/**',
      'cypress/videos/**',
      'cypress/screenshots/**',
      'cypress/downloads/**',
    ],
  },

  // Regras recomendadas para testes Cypress (inclui os globals cy/Cypress)
  cypress.configs.recommended,

  // Configuração base do projeto
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
    },
  },

  // Desabilita regras de estilo que conflitam com o Prettier (deve ficar por último)
  prettier,
];
