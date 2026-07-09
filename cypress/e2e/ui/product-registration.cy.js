import productPage from '../../support/pages/ProductPage';
import UserService from '../../support/services/UserService';
import { generateProduct } from '../../support/factories/product.factory';

describe('UI - Product Registration (admin)', () => {
  let adminId;
  let token;

  before(() => {
    cy.createUserWithToken().then((admin) => {
      adminId = admin.id;
      token = admin.token;
    });
  });

  after(() => {
    UserService.delete(adminId);
  });

  it('should register a product and show it in the product listing page', () => {
    const product = generateProduct();

    productPage.visitWithToken(token);
    productPage.registerProduct(product);

    // The URL alone doesn't prove the product was actually created — it
    // only proves the app navigated. Assert the product's real data
    // renders in the listing table, confirming the write took effect.
    cy.url().should('include', '/admin/listarprodutos');
    cy.contains('td', product.nome).should('be.visible');
    cy.screenshot('product-registration-success-listing');
  });
});
