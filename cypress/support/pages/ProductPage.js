import BasePage from './BasePage';

/**
 * Page Object for the admin product registration screen
 * (https://front.serverest.dev/admin/cadastrarprodutos). Requires a token
 * in `serverest/userToken` — use `visitWithToken()` (inherited from
 * BasePage) rather than a UI login round-trip.
 */
class ProductPage extends BasePage {
  constructor() {
    super('/admin/cadastrarprodutos');
  }

  elements = {
    nomeInput: () => cy.get('[data-testid="nome"]'),
    precoInput: () => cy.get('[data-testid="preco"]'),
    descricaoInput: () => cy.get('[data-testid="descricao"]'),
    quantidadeInput: () => cy.get('[data-testid="quantity"]'),
    // "cadastarProdutos" (missing the "r") is a real typo in the app's
    // source (src/views/admin/registerProducts.js) — kept as-is on purpose.
    submitButton: () => cy.get('[data-testid="cadastarProdutos"]'),
  };

  fillForm({ nome, preco, descricao, quantidade }) {
    this.elements.nomeInput().type(nome);
    this.elements.precoInput().type(String(preco));
    this.elements.descricaoInput().type(descricao);
    this.elements.quantidadeInput().type(String(quantidade));
    return this;
  }

  submit() {
    this.elements.submitButton().click();
    return this;
  }

  registerProduct(product) {
    this.fillForm(product);
    this.submit();
    return this;
  }
}

export default new ProductPage();
