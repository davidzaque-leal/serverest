import registerUserPage from '../../support/pages/RegisterUserPage';
import UserService from '../../support/services/UserService';
import { generateUser } from '../../support/factories/user.factory';

describe('UI - User Registration', () => {
  it('should register a new user and redirect to the home page', () => {
    const user = generateUser();

    registerUserPage.visit();
    registerUserPage.register(user);

    cy.contains('Cadastro realizado com sucesso').should('be.visible');
    // The app waits ~3s (a hardcoded setTimeout) before confirming the
    // login and redirecting, so the url assertion needs a longer timeout.
    cy.url({ timeout: 8000 }).should('include', '/home');
    cy.contains('h1', 'Serverest Store').should('be.visible');
    cy.get('[data-testid="logout"]').should('be.visible');
    cy.screenshot('register-user-success-home');
  });

  it('should show an inline error when the e-mail is already registered', () => {
    const existingUser = generateUser();

    UserService.create(existingUser).then((response) => {
      registerUserPage.visit();
      registerUserPage.register(existingUser);

      cy.contains('Este email já está sendo usado').should('be.visible');
      cy.url().should('include', '/cadastrarusuarios');
      cy.screenshot('register-user-duplicate-email-error');

      UserService.delete(response.body._id);
    });
  });
});
