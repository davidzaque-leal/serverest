import adminRegisterUserPage from '../../support/pages/AdminRegisterUserPage';
import UserService from '../../support/services/UserService';
import { generateUser } from '../../support/factories/user.factory';

describe('UI - User Registration (admin)', () => {
  let adminId;
  let token;

  // Ids registered by the tests; deleted in afterEach so cleanup still runs
  // when an assertion fails mid-test (an inline delete would be skipped).
  const createdUserIds = [];

  before(() => {
    cy.createUserWithToken().then((admin) => {
      adminId = admin.id;
      token = admin.token;
    });
  });

  after(() => {
    UserService.delete(adminId);
  });

  afterEach(() => {
    while (createdUserIds.length) {
      UserService.delete(createdUserIds.pop());
    }
  });

  it('should register a new user through the admin form and show it in the user listing page', () => {
    const newUser = generateUser({ administrador: 'false' });

    adminRegisterUserPage.visitWithToken(token);
    adminRegisterUserPage.register(newUser);

    // The URL alone doesn't prove the row actually renders — assert the
    // new user's real e-mail shows up in the listing table itself.
    // NB: a previously reported issue ("admin-created users don't show in
    // Listar Usuários") does NOT reproduce against this local stack — the
    // row consistently renders. See docs/test-design.md Section 7.
    cy.url().should('include', '/admin/listarusuarios');
    cy.contains('td', newUser.email).should('be.visible');

    UserService.list().then((response) => {
      const created = response.body.usuarios.find((u) => u.email === newUser.email);
      expect(created, 'user created via the admin form should exist in the API').to.exist;

      createdUserIds.push(created._id);
    });

    cy.screenshot('admin-register-user-success-listing');
  });
});
