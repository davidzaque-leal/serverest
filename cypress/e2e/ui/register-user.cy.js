import registerUserPage from '../../support/pages/RegisterUserPage';
import UserService from '../../support/services/UserService';
import { generateUser } from '../../support/factories/user.factory';
import { MESSAGES } from '../../support/messages';

describe('UI - User Registration', () => {
  // Ids registered by the tests; deleted in afterEach so cleanup still runs
  // when an assertion fails mid-test (an inline delete would be skipped).
  const createdUserIds = [];

  afterEach(() => {
    while (createdUserIds.length) {
      UserService.delete(createdUserIds.pop());
    }
  });

  it('should register a new user and redirect to the home page', () => {
    const user = generateUser();

    registerUserPage.visit();
    registerUserPage.register(user);

    cy.contains(MESSAGES.registerSuccess).should('be.visible');
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
      createdUserIds.push(response.body._id);

      registerUserPage.visit();
      registerUserPage.register(existingUser);

      cy.contains(MESSAGES.emailAlreadyInUse).should('be.visible');
      cy.url().should('include', '/cadastrarusuarios');
      cy.screenshot('register-user-duplicate-email-error');
    });
  });
});
