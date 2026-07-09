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
    // The app has no dedicated data-testid for this message (src/component/
    // NoSearching.js just renders a bare <p>) — matched by its literal copy.
    noResultsMessage: () => cy.contains('Nenhum produto foi encontrado'),
  };

  productCard(nome) {
    return cy.contains('.card', nome);
  }

  addToShoppingList(nome) {
    this.productCard(nome).find('[data-testid="adicionarNaLista"]').click();
    return this;
  }

  /**
   * Searches the catalog via the "Pesquisar Produtos" input (filters by
   * `nome` through `GET /produtos?nome=<term>`, a substring match on the
   * server). Typing alone doesn't filter — the search button must be
   * clicked.
   */
  search(term) {
    this.elements.searchInput().clear().type(term);
    this.elements.searchButton().click();
    return this;
  }
}

export default new ClientHomePage();
