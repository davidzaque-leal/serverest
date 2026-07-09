import ProductService from '../../support/services/ProductService';
import UserService from '../../support/services/UserService';
import { generateProduct } from '../../support/factories/product.factory';
import { MESSAGES } from '../../support/messages';

describe('API - Products (/produtos)', () => {
  let adminId;
  let token;

  // Ids registered by the tests; deleted in afterEach so cleanup still runs
  // when an assertion fails mid-test (an inline delete would be skipped).
  const createdProductIds = [];
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
    while (createdProductIds.length) {
      ProductService.delete(createdProductIds.pop(), token);
    }
    while (createdUserIds.length) {
      UserService.delete(createdUserIds.pop());
    }
  });

  it('should create a product when authenticated with a valid token', () => {
    const product = generateProduct();

    ProductService.create(product, token).then((response) => {
      createdProductIds.push(response.body._id);

      expect(response.status).to.eq(201);
      expect(response.body.message).to.eq(MESSAGES.registerSuccess);
      expect(response.body).to.have.property('_id').and.not.be.empty;
    });
  });

  it('should reject creating a product without an authentication token', () => {
    const product = generateProduct();

    ProductService.create(product).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.contain(MESSAGES.accessTokenFragment);
    });
  });

  context('Permissions', () => {
    it('should reject creating a product with a valid but non-admin token (403)', () => {
      cy.createUserWithToken({ administrador: 'false' }).then((regular) => {
        createdUserIds.push(regular.id);

        ProductService.create(generateProduct(), regular.token).then((response) => {
          expect(response.status).to.eq(403);
          expect(response.body.message).to.eq(MESSAGES.adminOnlyRoute);
        });
      });
    });
  });

  context('Duplicate product name', () => {
    it('should reject creating a product with a name that already exists', () => {
      const product = generateProduct();

      ProductService.create(product, token).then((created) => {
        createdProductIds.push(created.body._id);

        expect(created.status).to.eq(201);

        ProductService.create(product, token).then((duplicate) => {
          expect(duplicate.status).to.eq(400);
          expect(duplicate.body.message).to.eq(MESSAGES.duplicateProductName);
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
        createdProductIds.push(response.body._id);

        expect(response.status).to.eq(201);
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
        createdProductIds.push(response.body._id);

        expect(response.status).to.eq(201);
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
        expect(response.body.message).to.contain(MESSAGES.accessTokenFragment);
      });
    });

    it('should reject a token missing the "Bearer " prefix', () => {
      const rawToken = token.replace('Bearer ', '');

      ProductService.create(generateProduct(), rawToken).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.message).to.contain(MESSAGES.accessTokenFragment);
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
