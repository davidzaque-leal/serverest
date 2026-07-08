import { faker } from '@faker-js/faker';

/**
 * Gera o local-part de um e-mail a partir do nome, sem acentos nem
 * caracteres especiais, garantindo unicidade com um timestamp.
 */
function gerarEmailUnico(nome) {
  const base = nome
    .normalize('NFD')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase();
  return `${base}.${Date.now()}@qa.com.br`;
}

/**
 * Cria um usuário válido para o ServeRest com e-mail único.
 * Campos podem ser sobrescritos via `overrides` (ex.: cenários negativos).
 *
 * @param {Partial<{nome,email,password,administrador}>} overrides
 * @returns {{nome:string, email:string, password:string, administrador:string}}
 */
export function gerarUsuario(overrides = {}) {
  const nome = faker.person.fullName();

  return {
    nome,
    email: gerarEmailUnico(nome),
    password: faker.internet.password({ length: 12 }),
    // A API espera "administrador" como string ("true"/"false").
    administrador: 'true',
    ...overrides,
  };
}
