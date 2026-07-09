import LoginService from '../../support/services/LoginService';
import ProductService from '../../support/services/ProductService';
import UserService from '../../support/services/UserService';
import { generateUser } from '../../support/factories/user.factory';
import { generateProduct } from '../../support/factories/product.factory';

describe('API - Products (/produtos)', () => {
  let adminId;
  let token;

  before(() => {
    const admin = generateUser();

    UserService.create(admin).then((response) => {
      adminId = response.body._id;

      LoginService.login(admin.email, admin.password).then((loginResponse) => {
        token = loginResponse.body.authorization;
      });
    });
  });

  after(() => {
    UserService.delete(adminId);
  });

  it('should create a product when authenticated with a valid token', () => {
    const product = generateProduct();

    ProductService.create(product, token).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.message).to.eq('Cadastro realizado com sucesso');
      expect(response.body).to.have.property('_id').and.not.be.empty;

      ProductService.delete(response.body._id, token);
    });
  });

  it('should reject creating a product without an authentication token', () => {
    const product = generateProduct();

    ProductService.create(product).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.contain('Token de acesso');
    });
  });

  context('Permissions', () => {
    it('should reject creating a product with a valid but non-admin token (403)', () => {
      const regularUser = generateUser({ administrador: 'false' });

      UserService.create(regularUser).then((created) => {
        LoginService.login(regularUser.email, regularUser.password).then((loginResponse) => {
          const regularToken = loginResponse.body.authorization;

          ProductService.create(generateProduct(), regularToken).then((response) => {
            expect(response.status).to.eq(403);
            expect(response.body.message).to.eq('Rota exclusiva para administradores');

            UserService.delete(created.body._id);
          });
        });
      });
    });
  });

  context('Duplicate product name', () => {
    it('should reject creating a product with a name that already exists', () => {
      const product = generateProduct();

      ProductService.create(product, token).then((created) => {
        expect(created.status).to.eq(201);

        ProductService.create(product, token).then((duplicate) => {
          expect(duplicate.status).to.eq(400);
          expect(duplicate.body.message).to.eq('Já existe produto com esse nome');

          ProductService.delete(created.body._id, token);
        });
      });
    });
  });

  context('Boundary value analysis', () => {
    it('should reject preco = 0 (exclusive lower bound)', () => {
      const product = generateProduct({ preco: 0 });

      ProductService.create(product, token).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.preco).to.eq('preco deve ser um número positivo');
      });
    });

    it('should reject a negative preco with the same "must be positive" message', () => {
      const product = generateProduct({ preco: -50 });

      ProductService.create(product, token).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.preco).to.eq('preco deve ser um número positivo');
      });
    });

    it('should accept preco = 1, the smallest valid positive integer', () => {
      const product = generateProduct({ preco: 1 });

      ProductService.create(product, token).then((response) => {
        expect(response.status).to.eq(201);

        ProductService.delete(response.body._id, token);
      });
    });

    it('should reject a non-integer preco (e.g. 1.5)', () => {
      // Discovered while probing the API: "preco" must be a whole number —
      // fractional values are rejected regardless of being positive.
      const product = generateProduct({ preco: 1.5 });

      ProductService.create(product, token).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.preco).to.eq('preco deve ser um inteiro');
      });
    });

    it('should accept quantidade = 0 (inclusive lower bound)', () => {
      const product = generateProduct({ quantidade: 0 });

      ProductService.create(product, token).then((response) => {
        expect(response.status).to.eq(201);

        ProductService.delete(response.body._id, token);
      });
    });

    it('should reject quantidade = -1', () => {
      const product = generateProduct({ quantidade: -1 });

      ProductService.create(product, token).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.quantidade).to.eq('quantidade deve ser maior ou igual a 0');
      });
    });
  });

  context('Token validation', () => {
    it('should reject a garbage/invalid token', () => {
      ProductService.create(generateProduct(), 'Bearer garbage-token-123').then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.message).to.contain('Token de acesso');
      });
    });

    it('should reject a token missing the "Bearer " prefix', () => {
      const rawToken = token.replace('Bearer ', '');

      ProductService.create(generateProduct(), rawToken).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.message).to.contain('Token de acesso');
      });
    });
  });

  context('Data type validation', () => {
    it('should reject a non-numeric preco', () => {
      const product = generateProduct({ preco: 'abc' });

      ProductService.create(product, token).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.preco).to.eq('preco deve ser um número');
      });
    });
  });

  context('Public read access', () => {
    it('should list products without requiring an authentication token', () => {
      ProductService.list().then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('produtos');
      });
    });
  });
});
