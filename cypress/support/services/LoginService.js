/**
 * Service Object do endpoint de autenticação (POST /login).
 * Encapsula a chamada HTTP, deixando as specs focadas nas assertivas.
 */
class LoginService {
  /**
   * Autentica um usuário e retorna a resposta (com o token em body.authorization).
   * @param {string} email
   * @param {string} password
   */
  logar(email, password) {
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/login`,
      body: { email, password },
      failOnStatusCode: false,
    });
  }
}

export default new LoginService();
