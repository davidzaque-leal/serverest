import clientHomePage from '../../support/pages/ClientHomePage';
import LoginService from '../../support/services/LoginService';
import UserService from '../../support/services/UserService';
import ProductService from '../../support/services/ProductService';
import { generateUser } from '../../support/factories/user.factory';
import { generateProduct } from '../../support/factories/product.factory';

describe('UI - Product Listing & Search (regular user)', () => {
  let adminId;
  let adminToken;
  let clientId;
  let clientToken;
  let productA;
  let productAId;
  let productB;
  let productBId;

  before(() => {
    // Product writes require an admin token.
    const admin = generateUser();

    UserService.create(admin).then((response) => {
      adminId = response.body._id;

      LoginService.login(admin.email, admin.password).then((loginResponse) => {
        adminToken = loginResponse.body.authorization;

        // Two distinct products so the search test can prove the catalog is
        // actually filtered (matching product visible, non-matching hidden)
        // rather than just always showing everything.
        productA = generateProduct();
        productB = generateProduct();

        ProductService.create(productA, adminToken).then((response) => {
          productAId = response.body._id;
        });
        ProductService.create(productB, adminToken).then((response) => {
          productBId = response.body._id;
        });
      });
    });

    // The regular (non-admin) user who browses/searches the catalog.
    const client = generateUser({ administrador: 'false' });

    UserService.create(client).then((response) => {
      clientId = response.body._id;

      LoginService.login(client.email, client.password).then((loginResponse) => {
        clientToken = loginResponse.body.authorization;
      });
    });
  });

  after(() => {
    ProductService.delete(productAId, adminToken);
    ProductService.delete(productBId, adminToken);
    UserService.delete(adminId);
    UserService.delete(clientId);
  });

  it('should list the registered product on the home catalog', () => {
    clientHomePage.visitWithToken(clientToken);

    clientHomePage.productCard(productA.nome).should('be.visible');
    cy.screenshot('product-listing-catalog');
  });

  it('should filter the catalog to only the matching product when searching by name', () => {
    clientHomePage.visitWithToken(clientToken);

    // generateProduct() appends a random 6-char alphanumeric token to the
    // name, so searching by productA's own name can't accidentally also
    // match productB (or any pre-seeded product in the shared environment).
    clientHomePage.search(productA.nome);

    clientHomePage.productCard(productA.nome).should('be.visible');
    cy.contains('.card', productB.nome).should('not.exist');
    cy.screenshot('product-listing-search-match');
  });

  it('should show the "no results" message when searching for a term that matches nothing', () => {
    clientHomePage.visitWithToken(clientToken);

    clientHomePage.search(`no-such-product-${Date.now()}`);

    clientHomePage.elements.noResultsMessage().should('be.visible');
    cy.contains('.card', productA.nome).should('not.exist');
    cy.contains('.card', productB.nome).should('not.exist');
    cy.screenshot('product-listing-search-no-results');
  });
});
