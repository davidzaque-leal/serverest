import loginPage from '../../support/pages/LoginPage';
import UserService from '../../support/services/UserService';
import { generateUser } from '../../support/factories/user.factory';

describe('UI - Login', () => {
  context('Valid credentials - regular user', () => {
    let user;

    beforeEach(() => {
      user = generateUser({ administrador: 'false' });
      // Seeds the user via the API (the same backend the front consumes)
      // so the login form finds valid credentials.
      UserService.create(user).its('status').should('eq', 201);
    });

    it('should authenticate and redirect to the client home page', () => {
      loginPage.visit();
      loginPage.login(user.email, user.password);

      // "/home" alone is not a safe assertion: "/admin/home" (the admin
      // redirect target) also contains that substring, and both navbars
      // render the same [data-testid="logout"]. The page-specific heading
      // is what actually distinguishes a client login from an admin one.
      cy.url().should('include', '/home');
      cy.contains('h1', 'Serverest Store').should('be.visible');
      cy.get('[data-testid="logout"]').should('be.visible');
      cy.screenshot('login-valid-credentials-home');
    });
  });

  context('Valid credentials - admin user', () => {
    let admin;

    beforeEach(() => {
      admin = generateUser({ administrador: 'true' });
      UserService.create(admin).its('status').should('eq', 201);
    });

    it('should authenticate and redirect to the admin home page', () => {
      loginPage.visit();
      loginPage.login(admin.email, admin.password);

      cy.url().should('include', '/admin/home');
      cy.contains('h1', 'Bem Vindo').should('be.visible');
      cy.get('[data-testid="logout"]').should('be.visible');
      cy.screenshot('login-admin-credentials-home');
    });
  });

  context('Invalid credentials', () => {
    it('should stay on the login page and show an error message', () => {
      loginPage.visit();
      loginPage.login('nonexistent.user@qa.com.br', 'invalid-password');

      cy.contains('Email e/ou senha inválidos').should('be.visible');
      cy.url().should('include', '/login');
      cy.screenshot('login-invalid-credentials-error');
    });
  });
});
