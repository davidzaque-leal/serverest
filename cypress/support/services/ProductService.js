import BaseService from './BaseService';

/**
 * Service object for the products resource (/produtos). Creating a product
 * requires the `authorization` token returned by the login endpoint.
 */
class ProductService extends BaseService {
  constructor() {
    super('/produtos');
  }

  /**
   * Creates a product. `failOnStatusCode` defaults to false (inherited) so
   * negative scenarios (e.g. missing token -> 401) can also be asserted.
   * @param {object} product
   * @param {string} [token] token returned by the login endpoint
   */
  create(product, token) {
    return this.request({ method: 'POST', body: product, headers: { authorization: token } });
  }

  /** Lists all registered products. */
  list() {
    return this.request({ method: 'GET', failOnStatusCode: true });
  }

  /** Deletes a product by id (used for test data cleanup). */
  delete(id, token) {
    return this.request({
      method: 'DELETE',
      url: `${this.resourceUrl}/${id}`,
      headers: { authorization: token },
    });
  }
}

export default new ProductService();
