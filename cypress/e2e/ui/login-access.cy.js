import loginPage from '../../support/pages/LoginPage';

describe('UI Access - Login screen', () => {
  it('should access the application and display the login screen with its elements', () => {
    loginPage.visit();

    // Confirms navigation reached the login route
    cy.url().should('include', '/login');

    // Validates that the main screen elements were loaded
    loginPage.elements.loginTitle().should('be.visible');
    loginPage.elements.emailInput().should('be.visible');
    loginPage.elements.passwordInput().should('be.visible');
    loginPage.elements.submitButton().should('be.visible').and('contain', 'Entrar');
    loginPage.elements.registerLink().should('be.visible');

    // Captures a screenshot as evidence of the access
    cy.screenshot('login-access-serverest');
  });
});
