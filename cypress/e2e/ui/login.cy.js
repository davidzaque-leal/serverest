import loginPage from '../../support/pages/LoginPage';
import UsuarioService from '../../support/services/UsuarioService';
import { gerarUsuario } from '../../support/factories/usuario.factory';

describe('UI - Login', () => {
  context('Credenciais válidas', () => {
    let usuario;

    beforeEach(() => {
      usuario = gerarUsuario();
      // Semeia o usuário via API (o mesmo backend que o front consome),
      // para que o login pela UI encontre credenciais válidas.
      UsuarioService.criar(usuario).its('status').should('eq', 201);
    });

    it('deve autenticar e redirecionar para a home', () => {
      loginPage.visitar();
      loginPage.fazerLogin(usuario.email, usuario.password);

      cy.url().should('include', '/home');
      cy.get('[data-testid="logout"]').should('be.visible');
    });
  });

  context('Credenciais inválidas', () => {
    it('deve permanecer no login e exibir mensagem de erro', () => {
      loginPage.visitar();
      loginPage.fazerLogin('usuario.inexistente@qa.com.br', 'senha-invalida');

      cy.contains('Email e/ou senha inválidos').should('be.visible');
      cy.url().should('include', '/login');
    });
  });
});
