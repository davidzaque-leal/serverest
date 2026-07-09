import { faker } from '@faker-js/faker';

/**
 * Builds the local-part of an e-mail from the name, stripping accents and
 * special characters, and guarantees uniqueness with a timestamp.
 */
function buildUniqueEmail(name) {
  const localPart = name
    .normalize('NFD')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase();
  return `${localPart}.${Date.now()}@qa.com.br`;
}

/**
 * Builds a valid ServeRest user with a unique e-mail. Fields can be
 * overridden (e.g. to build negative scenarios). Field names follow the
 * ServeRest API contract (nome/email/password/administrador).
 *
 * @param {Partial<{nome,email,password,administrador}>} overrides
 * @returns {{nome:string, email:string, password:string, administrador:string}}
 */
export function generateUser(overrides = {}) {
  const nome = faker.person.fullName();

  return {
    nome,
    email: buildUniqueEmail(nome),
    password: faker.internet.password({ length: 12 }),
    // The API expects "administrador" as a string ("true"/"false").
    administrador: 'true',
    ...overrides,
  };
}
