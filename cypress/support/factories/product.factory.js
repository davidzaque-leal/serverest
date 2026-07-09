import { faker } from '@faker-js/faker';

/**
 * Builds a valid ServeRest product with a unique name (the API rejects
 * duplicate names). Fields can be overridden via `overrides`. Field names
 * follow the ServeRest API contract (nome/preco/descricao/quantidade).
 *
 * @param {Partial<{nome,preco,descricao,quantidade}>} overrides
 * @returns {{nome:string, preco:number, descricao:string, quantidade:number}}
 */
export function generateProduct(overrides = {}) {
  return {
    nome: `${faker.commerce.productName()} ${faker.string.alphanumeric(6)}`,
    preco: faker.number.int({ min: 1, max: 5000 }),
    descricao: faker.commerce.productDescription(),
    quantidade: faker.number.int({ min: 1, max: 500 }),
    ...overrides,
  };
}
