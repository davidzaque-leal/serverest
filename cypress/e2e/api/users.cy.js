import UserService from '../../support/services/UserService';
import { generateUser } from '../../support/factories/user.factory';

describe('API - Users (/usuarios)', () => {
  it('should create a user and return 201 with a generated id', () => {
    const user = generateUser();

    UserService.create(user).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.message).to.eq('Cadastro realizado com sucesso');
      expect(response.body).to.have.property('_id').and.not.be.empty;

      UserService.delete(response.body._id);
    });
  });

  it('should create a non-admin user (administrador:"false")', () => {
    const user = generateUser({ administrador: 'false' });

    UserService.create(user).then((response) => {
      expect(response.status).to.eq(201);

      UserService.delete(response.body._id);
    });
  });

  it('should reject creating a user with an already registered e-mail', () => {
    const user = generateUser();

    UserService.create(user).then((created) => {
      expect(created.status).to.eq(201);

      UserService.create(user).then((duplicate) => {
        expect(duplicate.status).to.eq(400);
        expect(duplicate.body.message).to.eq('Este email já está sendo usado');

        UserService.delete(created.body._id);
      });
    });
  });

  context('Required field validation', () => {
    it('should return one message per missing required field', () => {
      UserService.create({}).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.deep.eq({
          nome: 'nome é obrigatório',
          email: 'email é obrigatório',
          password: 'password é obrigatório',
          administrador: 'administrador é obrigatório',
        });
      });
    });
  });

  context('Field format validation', () => {
    it('should reject an e-mail without a valid shape', () => {
      const user = generateUser({ email: 'not-an-email' });

      UserService.create(user).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.email).to.eq('email deve ser um email válido');
      });
    });

    it('should reject an administrador value other than "true"/"false"', () => {
      const user = generateUser({ administrador: 'maybe' });

      UserService.create(user).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.administrador).to.eq("administrador deve ser 'true' ou 'false'");
      });
    });
  });

  context('Known gaps (characterization tests)', () => {
    // These document the API's actual (unexpected) behavior so a future
    // change is caught by CI, not to imply the behavior is desirable.
    it('accepts a whitespace-only nome — no blank/trim validation exists', () => {
      const user = generateUser({ nome: '   ' });

      UserService.create(user).then((response) => {
        expect(response.status).to.eq(201);

        UserService.delete(response.body._id);
      });
    });

    it('accepts a nome with no upper length bound (1000 chars)', () => {
      const user = generateUser({ nome: 'A'.repeat(1000) });

      UserService.create(user).then((response) => {
        expect(response.status).to.eq(201);

        UserService.delete(response.body._id);
      });
    });
  });

  context('Malformed request', () => {
    it('should return 400 with a guidance message for invalid JSON', () => {
      UserService.request({
        method: 'POST',
        body: '{nome: sem aspas}',
        headers: { 'content-type': 'application/json' },
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.contain('Adicione aspas em todos os valores');
      });
    });
  });

  context('Lookup and deletion by id', () => {
    it('should return 400 when the id does not have exactly 16 alphanumeric characters', () => {
      UserService.getById('short-id').then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.id).to.eq('id deve ter exatamente 16 caracteres alfanuméricos');
      });
    });

    it('deleting a malformed id returns 200 without validating its shape (inconsistent with GET)', () => {
      UserService.delete('not-a-real-id').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.eq('Nenhum registro excluído');
      });
    });
  });
});
