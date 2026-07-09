import loginPage from '../../support/pages/LoginPage';
import UserService from '../../support/services/UserService';
import { generateUser } from '../../support/factories/user.factory';

describe('UI - Login', () => {
  context('Valid credentials', () => {
    let user;

    beforeEach(() => {
      user = generateUser();
      // Seeds the user via the API (the same backend the front consumes)
      // so the login form finds valid credentials.
      UserService.create(user).its('status').should('eq', 201);
    });

    it('should authenticate and redirect to the home page', () => {
      loginPage.visit();
      loginPage.login(user.email, user.password);

      cy.url().should('include', '/home');
      cy.get('[data-testid="logout"]').should('be.visible');
    });
  });

  context('Invalid credentials', () => {
    it('should stay on the login page and show an error message', () => {
      loginPage.visit();
      loginPage.login('nonexistent.user@qa.com.br', 'invalid-password');

      cy.contains('Email e/ou senha inválidos').should('be.visible');
      cy.url().should('include', '/login');
    });
  });
});
