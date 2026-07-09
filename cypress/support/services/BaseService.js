/**
 * Base class for API service objects. Centralizes URL resolution and the
 * default request options shared by every ServeRest resource, so concrete
 * services only declare their resource path and endpoint-specific methods.
 */
class BaseService {
  constructor(resourcePath) {
    this.resourcePath = resourcePath;
  }

  get resourceUrl() {
    return `${Cypress.env('apiUrl')}${this.resourcePath}`;
  }

  /**
   * Performs the HTTP request. `failOnStatusCode` defaults to false so
   * negative scenarios (4xx/5xx) can be asserted without Cypress failing
   * the test; callers can opt back into the strict default when needed.
   */
  request({ method, url = this.resourceUrl, body, headers, failOnStatusCode = false }) {
    return cy.request({ method, url, body, headers, failOnStatusCode });
  }
}

export default BaseService;
