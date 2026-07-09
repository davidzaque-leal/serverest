/**
 * Base class for Page Objects. Centralizes navigation so every page only
 * declares its own route and elements/actions.
 */
class BasePage {
  constructor(path) {
    this.path = path;
  }

  visit() {
    cy.visit(this.path);
    return this;
  }

  /**
   * Visits the page with an auth token seeded into localStorage before the
   * app boots (`onBeforeLoad`), for pages that gate on `serverest/userToken`
   * (e.g. admin-only routes). Avoids re-doing a UI login in every spec.
   */
  visitWithToken(token) {
    cy.visit(this.path, {
      onBeforeLoad(win) {
        win.localStorage.setItem('serverest/userToken', token);
      },
    });
    return this;
  }
}

export default BasePage;
