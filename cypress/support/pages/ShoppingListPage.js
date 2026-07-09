import BasePage from './BasePage';

/**
 * Page Object for the shopping list screen
 * (https://front.serverest.dev/minhaListaDeProdutos). Reached by adding a
 * product from ClientHomePage rather than by direct navigation, since it
 * renders an empty-state message when the `products` localStorage cart is
 * empty (see `elements.emptyMessage`).
 */
class ShoppingListPage extends BasePage {
  constructor() {
    super('/minhaListaDeProdutos');
  }

  elements = {
    emptyMessage: () => cy.get('[data-testid="shopping-cart-empty-message"]'),
    clearListButton: () => cy.get('[data-testid="limparLista"]'),
    checkoutButton: () => cy.get('[data-testid="checkout-products"]'),
  };

  productCard(nome) {
    return cy.contains('[data-testid="shopping-cart-product-name"]', nome).parents('.card');
  }

  quantityFor(nome) {
    return this.productCard(nome).find('[data-testid="shopping-cart-product-quantity"]');
  }

  increaseQuantity(nome) {
    this.productCard(nome).find('[data-testid="product-increase-quantity"]').click();
    return this;
  }

  decreaseQuantity(nome) {
    this.productCard(nome).find('[data-testid="product-decrease-quantity"]').click();
    return this;
  }

  clearList() {
    this.elements.clearListButton().click();
    return this;
  }
}

export default new ShoppingListPage();
