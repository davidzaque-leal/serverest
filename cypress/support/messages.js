/**
 * ServeRest system messages asserted by more than one spec (API and/or UI).
 * Centralizing them keeps the message contract in a single place — a copy
 * change in the app breaks one constant instead of scattered literals.
 * One-off field-validation strings stay inline in the spec that owns them.
 */
export const MESSAGES = {
  registerSuccess: 'Cadastro realizado com sucesso',
  loginSuccess: 'Login realizado com sucesso',
  invalidCredentials: 'Email e/ou senha inválidos',
  emailAlreadyInUse: 'Este email já está sendo usado',
  duplicateProductName: 'Já existe produto com esse nome',
  adminOnlyRoute: 'Rota exclusiva para administradores',
  noRecordDeleted: 'Nenhum registro excluído',
  // Asserted with `contain` — the full message varies by scenario
  // ("Token de acesso ausente, inválido ou expirado...").
  accessTokenFragment: 'Token de acesso',
};
