import BasePage from './BasePage';

/**
 * Page Object for the admin-only user registration screen
 * (https://front.serverest.dev/admin/cadastrarusuarios). Distinct from the
 * public RegisterUserPage (`/cadastrarusuarios`): different route, different
 * submit `data-testid`, and an admin-only "Cadastrar como administrador?"
 * checkbox. Requires a token in `serverest/userToken` — use
 * `visitWithToken()` (inherited from BasePage).
 */
class AdminRegisterUserPage extends BasePage {
  constructor() {
    super('/admin/cadastrarusuarios');
  }

  elements = {
    nomeInput: () => cy.get('[data-testid="nome"]'),
    emailInput: () => cy.get('[data-testid="email"]'),
    passwordInput: () => cy.get('[data-testid="password"]'),
    adminCheckbox: () => cy.get('[data-testid="checkbox"]'),
    submitButton: () => cy.get('[data-testid="cadastrarUsuario"]'),
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

  register({ nome, email, password, administrador }) {
    this.fillForm({ nome, email, password });
    if (administrador === 'true') {
      this.elements.adminCheckbox().check();
    }
    this.submit();
    return this;
  }
}

export default new AdminRegisterUserPage();
