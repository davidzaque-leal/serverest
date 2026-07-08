import { faker } from '@faker-js/faker';

/**
 * Cria um produto válido para o ServeRest com nome único (a API não
 * permite nomes duplicados). Campos sobrescrevíveis via `overrides`.
 *
 * @param {Partial<{nome,preco,descricao,quantidade}>} overrides
 * @returns {{nome:string, preco:number, descricao:string, quantidade:number}}
 */
export function gerarProduto(overrides = {}) {
  return {
    nome: `${faker.commerce.productName()} ${faker.string.alphanumeric(6)}`,
    preco: faker.number.int({ min: 1, max: 5000 }),
    descricao: faker.commerce.productDescription(),
    quantidade: faker.number.int({ min: 1, max: 500 }),
    ...overrides,
  };
}
