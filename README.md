# ServeRest — Testes Automatizados (Cypress + JavaScript)

Automação de testes **E2E (frontend)** e de **API** para a aplicação [ServeRest](https://serverest.dev/),
construída com [Cypress](https://www.cypress.io/) e JavaScript.

- **Frontend:** https://front.serverest.dev/
- **API (Swagger):** https://serverest.dev/

## Sobre o projeto

Este repositório contém **3 cenários E2E** validando a interface e **3 cenários de API**
validando os endpoints da aplicação, organizados com foco em legibilidade, reuso e
manutenibilidade.

> 🚧 Documentação em construção — será complementada ao longo do desenvolvimento.

## Estrutura de pastas

```
cypress/
├── e2e/
│   ├── ui/          # Cenários E2E (interface)
│   └── api/         # Cenários de API
├── support/
│   ├── pages/       # Page Objects (padrão POM) — camada de UI
│   ├── services/    # Service Objects — camada de API
│   └── factories/   # Geração de dados dinâmicos (faker)
└── fixtures/        # Dados estáticos e massas de teste
```

## Como executar

> Instruções detalhadas serão adicionadas nos próximos passos.

```bash
npm install
npm run cy:open   # modo interativo
npm test          # modo headless (CI)
```
