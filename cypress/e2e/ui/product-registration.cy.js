import productPage from '../../support/pages/ProductPage';
import LoginService from '../../support/services/LoginService';
import UserService from '../../support/services/UserService';
import { generateUser } from '../../support/factories/user.factory';
import { generateProduct } from '../../support/factories/product.factory';

describe('UI - Product Registration (admin)', () => {
  let adminId;
  let token;

  before(() => {
    const admin = generateUser();

    UserService.create(admin).then((response) => {
      adminId = response.body._id;

      LoginService.login(admin.email, admin.password).then((loginResponse) => {
        token = loginResponse.body.authorization;
      });
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
