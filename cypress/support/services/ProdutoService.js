/**
 * Service Object do recurso de produtos (/produtos).
 * O cadastro exige o token de autenticação no header `authorization`.
 */
class ProdutoService {
  /**
   * Cria um produto. `failOnStatusCode: false` permite asserir cenários
   * de erro (ex.: requisição sem token -> 401).
   * @param {object} produto
   * @param {string} [token] token retornado pelo login
   */
  criar(produto, token) {
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/produtos`,
      body: produto,
      headers: { authorization: token },
      failOnStatusCode: false,
    });
  }

  /** Lista todos os produtos cadastrados. */
  listar() {
    return cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/produtos`,
    });
  }

  /** Exclui um produto pelo id (usado em limpeza de massa). */
  excluir(id, token) {
    return cy.request({
      method: 'DELETE',
      url: `${Cypress.env('apiUrl')}/produtos/${id}`,
      headers: { authorization: token },
      failOnStatusCode: false,
    });
  }
}

export default new ProdutoService();
