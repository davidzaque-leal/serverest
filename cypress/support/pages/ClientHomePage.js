import BasePage from './BasePage';

/**
 * Page Object for the regular-user product catalog
 * (https://front.serverest.dev/home). The "Adicionar a lista" button is
 * repeated once per product card, so actions are scoped to the card that
 * contains the given product name rather than a bare data-testid lookup.
 * Requires a token in `serverest/userToken` — use `visitWithToken()`
 * (inherited from BasePage).
 */
class ClientHomePage extends BasePage {
  constructor() {
    super('/home');
  }

  elements = {
    searchInput: () => cy.get('[data-testid="pesquisar"]'),
    searchButton: () => cy.get('[data-testid="botaoPesquisar"]'),
  };

  productCard(nome) {
    return cy.contains('.card', nome);
  }

  addToShoppingList(nome) {
    this.productCard(nome).find('[data-testid="adicionarNaLista"]').click();
    return this;
  }
}

export default new ClientHomePage();
