/**
 * Service Object do recurso de usuários (/usuarios).
 * Centraliza as chamadas HTTP do endpoint.
 */
class UsuarioService {
  /**
   * Cria um usuário. `failOnStatusCode: false` permite asserir também
   * cenários de erro (ex.: e-mail duplicado -> 400).
   * @param {object} usuario
   */
  criar(usuario) {
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/usuarios`,
      body: usuario,
      failOnStatusCode: false,
    });
  }

  /** Lista todos os usuários cadastrados. */
  listar() {
    return cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/usuarios`,
    });
  }

  /** Busca um usuário pelo id. */
  buscarPorId(id) {
    return cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/usuarios/${id}`,
      failOnStatusCode: false,
    });
  }

  /** Exclui um usuário pelo id (usado em limpeza de massa). */
  excluir(id) {
    return cy.request({
      method: 'DELETE',
      url: `${Cypress.env('apiUrl')}/usuarios/${id}`,
      failOnStatusCode: false,
    });
  }
}

export default new UsuarioService();
