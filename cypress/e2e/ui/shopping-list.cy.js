import clientHomePage from '../../support/pages/ClientHomePage';
import shoppingListPage from '../../support/pages/ShoppingListPage';
import UserService from '../../support/services/UserService';
import ProductService from '../../support/services/ProductService';

describe('UI - Shopping List (regular user)', () => {
  let adminId;
  let adminToken;
  let clientId;
  let clientToken;
  let product;
  let productId;

  before(() => {
    // Product writes require an admin token.
    cy.createUserWithToken().then((admin) => {
      adminId = admin.id;
      adminToken = admin.token;

      cy.seedProduct(admin.token).then((seeded) => {
        product = seeded.product;
        productId = seeded.id;
      });
    });

    // The regular (non-admin) user who browses the catalog and shops.
    cy.createUserWithToken({ administrador: 'false' }).then((client) => {
      clientId = client.id;
      clientToken = client.token;
    });
  });

  after(() => {
    ProductService.delete(productId, adminToken);
    UserService.delete(adminId);
    UserService.delete(clientId);
  });

  it('should add a product to the shopping list from the home page', () => {
    clientHomePage.visitWithToken(clientToken);
    clientHomePage.addToShoppingList(product.nome);

    // Adding a product routes to the Shopping List, not a finished cart
    // (see docs/test-design.md Section 7 — the cart flow is unfinished).
    cy.url().should('include', '/minhaListaDeProdutos');
    shoppingListPage.productCard(product.nome).should('be.visible');
    shoppingListPage.quantityFor(product.nome).should('contain', 'Total: 1');
    cy.screenshot('shopping-list-add-product');
  });

  it('should sum the quantity when the same product is added from the home page multiple times', () => {
    clientHomePage.visitWithToken(clientToken);
    clientHomePage.addToShoppingList(product.nome);
    shoppingListPage.quantityFor(product.nome).should('contain', 'Total: 1');

    clientHomePage.visitWithToken(clientToken);
    clientHomePage.addToShoppingList(product.nome);
    shoppingListPage.quantityFor(product.nome).should('contain', 'Total: 2');

    clientHomePage.visitWithToken(clientToken);
    clientHomePage.addToShoppingList(product.nome);
    shoppingListPage.quantityFor(product.nome).should('contain', 'Total: 3');

    cy.screenshot('shopping-list-sum-quantity');
  });

  it('should update the quantity using the + and - controls', () => {
    clientHomePage.visitWithToken(clientToken);
    clientHomePage.addToShoppingList(product.nome);
    shoppingListPage.quantityFor(product.nome).should('contain', 'Total: 1');

    shoppingListPage.increaseQuantity(product.nome);
    shoppingListPage.quantityFor(product.nome).should('contain', 'Total: 2');

    shoppingListPage.increaseQuantity(product.nome);
    shoppingListPage.quantityFor(product.nome).should('contain', 'Total: 3');

    // Decreasing above 1 is the "remove one unit" path that actually works
    // (Cart.removeItem) — distinct from decreasing the last unit to 0,
    // which is the broken Cart.deleteItem path covered under "Known gaps"
    // below.
    shoppingListPage.decreaseQuantity(product.nome);
    shoppingListPage.quantityFor(product.nome).should('contain', 'Total: 2');

    shoppingListPage.decreaseQuantity(product.nome);
    shoppingListPage.quantityFor(product.nome).should('contain', 'Total: 1');

    cy.screenshot('shopping-list-update-quantity');
  });

  it('should remove all products from the shopping list via "Limpar Lista"', () => {
    clientHomePage.visitWithToken(clientToken);
    clientHomePage.addToShoppingList(product.nome);

    cy.url().should('include', '/minhaListaDeProdutos');
    shoppingListPage.productCard(product.nome).should('be.visible');

    shoppingListPage.clearList();

    shoppingListPage.elements.emptyMessage().should('be.visible');
    cy.contains('[data-testid="shopping-cart-product-name"]', product.nome).should('not.exist');
    cy.screenshot('shopping-list-clear-list');
  });

  context('Known gaps (characterization test)', () => {
    // Documents the app's actual (unexpected) behavior so a future fix is
    // caught by CI, not to imply the behavior is desirable. Root cause:
    // ServeRest/front's Cart.deleteItem (src/services/cart.js) filters on
    // a nonexistent `id` field instead of the real `_id`, so the filter
    // never matches and never removes the item.
    it("decreasing a single item's quantity to 0 does not remove it from the list", () => {
      clientHomePage.visitWithToken(clientToken);
      clientHomePage.addToShoppingList(product.nome);

      cy.url().should('include', '/minhaListaDeProdutos');
      shoppingListPage.quantityFor(product.nome).should('contain', 'Total: 1');

      shoppingListPage.decreaseQuantity(product.nome);

      // Expected (business intent): the item disappears once its quantity
      // reaches 0. Actual: it stays in the list, still at "Total: 1".
      shoppingListPage.productCard(product.nome).should('be.visible');
      shoppingListPage.quantityFor(product.nome).should('contain', 'Total: 1');
    });
  });
});
