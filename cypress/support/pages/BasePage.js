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
}

export default BasePage;
