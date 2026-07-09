import BasePage from './BasePage';

/**
 * Page Object for the public user registration screen
 * (https://front.serverest.dev/cadastrarusuarios).
 */
class RegisterUserPage extends BasePage {
  constructor() {
    super('/cadastrarusuarios');
  }

  elements = {
    nomeInput: () => cy.get('[data-testid="nome"]'),
    emailInput: () => cy.get('[data-testid="email"]'),
    passwordInput: () => cy.get('[data-testid="password"]'),
    adminCheckbox: () => cy.get('[data-testid="checkbox"]'),
    submitButton: () => cy.get('[data-testid="cadastrar"]'),
  };

  fillForm({ nome, email, password }) {
    this.elements.nomeInput().type(nome);
    this.elements.emailInput().type(email);
    this.elements.passwordInput().type(password, { log: false });
    return this;
  }

  submit() {
    this.elements.submitButton().click();
    return this;
  }

  register(user) {
    this.fillForm(user);
    this.submit();
    return this;
  }
}

export default new RegisterUserPage();
