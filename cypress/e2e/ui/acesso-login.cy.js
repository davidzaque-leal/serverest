import loginPage from '../../support/pages/LoginPage';

describe('Acesso à UI - Tela de Login', () => {
  it('deve acessar a aplicação e exibir a tela de login com seus elementos', () => {
    loginPage.visitar();

    // Confirma que a navegação chegou na rota de login
    cy.url().should('include', '/login');

    // Valida que os elementos principais da tela foram carregados
    loginPage.elements.tituloLogin().should('be.visible');
    loginPage.elements.emailInput().should('be.visible');
    loginPage.elements.senhaInput().should('be.visible');
    loginPage.elements.entrarButton().should('be.visible').and('contain', 'Entrar');
    loginPage.elements.cadastrarLink().should('be.visible');

    // Registra o print do acesso como evidência
    cy.screenshot('acesso-login-serverest');
  });
});
