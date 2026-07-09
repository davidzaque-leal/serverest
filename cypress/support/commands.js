// Custom Cypress commands.
// Reusable commands shared across specs are registered here via
// Cypress.Commands.add. UI interactions stay in the Page Objects; only
// cross-cutting API setup (seeding authenticated contexts/data) lives here.

import UserService from './services/UserService';
import LoginService from './services/LoginService';
import ProductService from './services/ProductService';
import { generateUser } from './factories/user.factory';
import { generateProduct } from './factories/product.factory';

/**
 * Creates a fresh user via the API and logs it in, yielding
 * `{ user, id, token }` for specs that need an authenticated context.
 * Defaults to an admin (the factory default); pass
 * `{ administrador: 'false' }` for a regular user.
 */
Cypress.Commands.add('createUserWithToken', (overrides = {}) => {
  const user = generateUser(overrides);

  return UserService.create(user).then((created) => {
    expect(created.status, 'user seed should succeed').to.eq(201);

    return LoginService.login(user.email, user.password).then((login) => ({
      user,
      id: created.body._id,
      token: login.body.authorization,
    }));
  });
});

/**
 * Seeds a product via the API (requires an admin token), yielding
 * `{ product, id }`. Used by UI specs that need catalog data to exist
 * before visiting the front.
 */
Cypress.Commands.add('seedProduct', (token, overrides = {}) => {
  const product = generateProduct(overrides);

  return ProductService.create(product, token).then((created) => {
    expect(created.status, 'product seed should succeed').to.eq(201);

    return { product, id: created.body._id };
  });
});
