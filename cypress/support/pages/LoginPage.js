/**
 * Page Object da tela de Login (https://front.serverest.dev/login).
 * Concentra seletores e ações da página, mantendo as specs legíveis.
 */
class LoginPage {
  elements = {
    tituloLogin: () => cy.contains('h1', 'Login'),
    emailInput: () => cy.get('[data-testid="email"]'),
    senhaInput: () => cy.get('[data-testid="senha"]'),
    entrarButton: () => cy.get('[data-testid="entrar"]'),
    cadastrarLink: () => cy.get('[data-testid="cadastrar"]'),
  };

  visitar() {
    cy.visit('/login');
    return this;
  }

  preencherEmail(email) {
    this.elements.emailInput().clear().type(email);
    return this;
  }

  preencherSenha(senha) {
    this.elements.senhaInput().clear().type(senha, { log: false });
    return this;
  }

  submeter() {
    this.elements.entrarButton().click();
    return this;
  }

  fazerLogin(email, senha) {
    this.preencherEmail(email);
    this.preencherSenha(senha);
    this.submeter();
    return this;
  }
}

export default new LoginPage();
