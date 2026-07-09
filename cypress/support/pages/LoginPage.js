import BasePage from './BasePage';

/**
 * Page Object for the login screen (https://front.serverest.dev/login).
 * Selectors and copy assertions match the real (Portuguese) app UI.
 */
class LoginPage extends BasePage {
  constructor() {
    super('/login');
  }

  elements = {
    loginTitle: () => cy.contains('h1', 'Login'),
    emailInput: () => cy.get('[data-testid="email"]'),
    passwordInput: () => cy.get('[data-testid="senha"]'),
    submitButton: () => cy.get('[data-testid="entrar"]'),
    registerLink: () => cy.get('[data-testid="cadastrar"]'),
  };

  fillEmail(email) {
    this.elements.emailInput().clear().type(email);
    return this;
  }

  fillPassword(password) {
    this.elements.passwordInput().clear().type(password, { log: false });
    return this;
  }

  submit() {
    this.elements.submitButton().click();
    return this;
  }

  login(email, password) {
    this.fillEmail(email);
    this.fillPassword(password);
    this.submit();
    return this;
  }
}

export default new LoginPage();
