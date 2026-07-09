import LoginService from '../../support/services/LoginService';
import UserService from '../../support/services/UserService';
import { generateUser } from '../../support/factories/user.factory';

describe('API - Login (/login)', () => {
  context('Valid credentials', () => {
    let user;
    let userId;

    beforeEach(() => {
      user = generateUser();
      UserService.create(user).then((response) => {
        userId = response.body._id;
      });
    });

    afterEach(() => {
      UserService.delete(userId);
    });

    it('should authenticate a registered user and return a bearer token', () => {
      LoginService.login(user.email, user.password).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.eq('Login realizado com sucesso');
        expect(response.body.authorization).to.match(/^Bearer\s.+/);
      });
    });
  });

  context('Invalid credentials', () => {
    let user;
    let userId;

    beforeEach(() => {
      user = generateUser();
      UserService.create(user).then((response) => {
        userId = response.body._id;
      });
    });

    afterEach(() => {
      UserService.delete(userId);
    });

    it('should reject a wrong password for a registered account', () => {
      LoginService.login(user.email, 'wrong-password').then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.message).to.eq('Email e/ou senha inválidos');
      });
    });

    it('should reject a non-existent e-mail with the same generic message', () => {
      // ServeRest intentionally returns the same message for "wrong password"
      // and "e-mail not found", avoiding account enumeration.
      LoginService.login('nonexistent.account@qa.com.br', 'any-password').then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.message).to.eq('Email e/ou senha inválidos');
      });
    });
  });

  context('Required field validation', () => {
    it('should return 400 when password is missing', () => {
      LoginService.login('someone@qa.com.br', undefined).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.password).to.eq('password é obrigatório');
      });
    });

    it('should return 400 when email is missing', () => {
      LoginService.login(undefined, 'some-password').then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.email).to.eq('email é obrigatório');
      });
    });
  });
});
