🇺🇸 [English version](bug-report.md)

# ServeRest — Relatório de Bugs

Relatório consolidado de defeitos da aplicação ServeRest (API + front-end), produzido durante a
construção da suíte de testes automatizados deste repositório. Cada item abaixo foi verificado
diretamente contra a aplicação em execução (stack local em docker: imagem oficial da API
`paulogoncalvesbh/serverest` + build recente do `ServeRest/front`) — nenhum foi presumido a
partir de documentação. As referências cruzadas para a análise detalhada e os testes de
caracterização automatizados estão em [`test-design.pt-BR.md`](test-design.pt-BR.md).

## Legenda

| Campo          | Valores                                                                                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Severidade** | 🔴 Alta · 🟠 Média · 🟡 Baixa · ⚪ Informativo (não é um defeito, documentado por completude)                                                                                            |
| **Status**     | ✅ Confirmado (reproduzido localmente) · ❓ Não confirmado (relatado, não reproduzido) · 📌 Por design (aceito para uma aplicação de treinamento, seria um achado em uma auditoria real) |

## Resumo

| ID     | Título                                                                        | Severidade | Status                              |
| ------ | ----------------------------------------------------------------------------- | ---------- | ----------------------------------- |
| BUG-01 | Lista de Compras: reduzir a quantidade a 0 não remove o item                  | 🟠         | ✅ Confirmado                       |
| BUG-02 | `DELETE /usuarios/:id` não valida o formato do id (inconsistente com o `GET`) | 🟡         | ✅ Confirmado                       |
| BUG-03 | `nome` aceita valor apenas com espaços no cadastro de usuário                 | 🟡         | ✅ Confirmado                       |
| BUG-04 | `nome` não tem tamanho máximo no cadastro de usuário                          | 🟡         | ✅ Confirmado                       |
| BUG-05 | Semântica de limite inconsistente entre `preco` e `quantidade`                | 🟡         | ✅ Confirmado                       |
| BUG-06 | Qualquer conta pode se autocadastrar como `administrador:"true"` via API      | 🔴         | 📌 Por design                       |
| BUG-07 | Sem rate limiting / bloqueio após logins inválidos repetidos                  | 🟠         | 📌 Por design                       |
| BUG-08 | Sem UI de fallback quando o backend está inacessível (`503` observado)        | 🟠         | ✅ Confirmado                       |
| BUG-09 | Chamadas HTTP do front-end não têm timeout de requisição configurado          | 🟠         | ✅ Confirmado                       |
| BUG-10 | Formulários sem estado de carregamento / proteção contra envio duplicado      | 🟡         | ✅ Confirmado                       |
| BUG-11 | "Adicionar no carrinho" não completa um fluxo de carrinho funcional           | ⚪         | 📌 Por design (limitação conhecida) |
| BUG-12 | Tela de Relatórios não está implementada                                      | ⚪         | 📌 Por design (limitação conhecida) |
| BUG-13 | Listar Usuários: usuários recém-cadastrados supostamente ausentes da listagem | ⚪         | ❓ Não confirmado                   |

---

## BUG-01 — Lista de Compras: reduzir a quantidade a 0 não remove o item

**Severidade:** 🟠 Média **Status:** ✅ Confirmado

**Área:** Lista de Compras (`/home` → adicionar produto → Lista de Compras)

**Passos para reproduzir:**

1. Fazer login como usuário comum (`administrador:"false"`).
2. Adicionar um produto à Lista de Compras a partir de `/home` (quantidade vira 1).
3. Na tela da Lista de Compras, clicar em `-` no item para reduzir a quantidade de 1 para 0.

**Esperado:** O item é removido da lista ao atingir quantidade 0.

**Real:** O item permanece na lista em "Total: 1" indefinidamente. Apenas "Limpar Lista" (que
sobrescreve o array inteiro) esvazia a lista.

**Causa raiz (identificada no código-fonte):** `ServeRest/front`, `src/services/cart.js`,
`deleteItem` — a função filtra o array armazenado por `element.id`, mas os itens do carrinho só
possuem `_id`. O predicado do filtro nunca casa, então nada é removido pelo caminho de
decremento.

**Evidência / automatizado como:** Teste de caracterização em
`cypress/e2e/ui/shopping-list.cy.js` (contexto "Known gaps").

---

## BUG-02 — `DELETE /usuarios/:id` não valida o formato do id (inconsistente com o `GET`)

**Severidade:** 🟡 Baixa **Status:** ✅ Confirmado

**Área:** `DELETE /usuarios/:id`

**Passos para reproduzir:**

1. Chamar `GET /usuarios/:id` com um id malformado (não exatamente 16 caracteres alfanuméricos).
2. Chamar `DELETE /usuarios/:id` com o mesmo id malformado.

**Esperado:** Validação consistente do formato do id em ambos os endpoints — `400` para id
malformado.

**Real:** O `GET` retorna `400` para id malformado, mas o `DELETE` não valida o formato e retorna
`200` `"Nenhum registro excluído"`.

**Evidência / automatizado como:** Teste de caracterização em `cypress/e2e/api/users.cy.js`.

---

## BUG-03 — `nome` aceita valor apenas com espaços no cadastro de usuário

**Severidade:** 🟡 Baixa **Status:** ✅ Confirmado

**Área:** `POST /usuarios`, campo `nome`

**Passos para reproduzir:** Enviar um payload de cadastro com `nome: "   "` (apenas espaços) e
demais dados válidos.

**Esperado (premissa de negócio):** Rejeitado por ser efetivamente um nome vazio.

**Real:** Aceito, `201`.

**Evidência / automatizado como:** Teste de caracterização em `cypress/e2e/api/users.cy.js`.

---

## BUG-04 — `nome` não tem tamanho máximo no cadastro de usuário

**Severidade:** 🟡 Baixa **Status:** ✅ Confirmado

**Área:** `POST /usuarios`, campo `nome`

**Passos para reproduzir:** Enviar um payload de cadastro com `nome` de 1000 caracteres.

**Esperado:** Algum limite superior razoável rejeitaria uma entrada excessivamente longa.

**Real:** Aceito, `201`, nenhum teto de tamanho observado.

**Evidência / automatizado como:** `cypress/e2e/api/users.cy.js`.

---

## BUG-05 — Semântica de limite inconsistente entre `preco` e `quantidade`

**Severidade:** 🟡 Baixa **Status:** ✅ Confirmado

**Área:** `POST /produtos`

**Descrição:** `preco` deve ser um número inteiro positivo — sua faixa válida é `[1, ∞)`, `0` é
rejeitado. `quantidade` permite `0` — sua faixa válida é `[0, ∞)`, incluindo o limite inferior.
Dois campos numéricos do mesmo recurso usam convenções diferentes de inclusão/exclusão para o
limite inferior, sem racional documentado, o que é uma fonte fácil de erros de "off-by-one" para
consumidores da API.

**Evidência / automatizado como:** Testes de valor limite em `cypress/e2e/api/products.cy.js`.

---

## BUG-06 — Qualquer conta pode se autocadastrar como `administrador:"true"` via API

**Severidade:** 🔴 Alta (seria Crítica em um sistema de produção) **Status:** 📌 Por design nesta
aplicação de treinamento

**Área:** `POST /usuarios`

**Descrição:** Nada no endpoint de cadastro impede que um cliente defina
`administrador:"true"` no autocadastro. O escalonamento de privilégio é trivial — qualquer
chamador anônimo pode criar para si uma conta de admin com uma única requisição.

**Observação:** Documentado como uma característica intencional desta aplicação de treinamento,
não algo a "corrigir" aqui. Sinalizado porque seria um achado crítico em uma auditoria de
segurança real em produção.

**Evidência:** `cypress/e2e/api/users.cy.js` (o teste de fluxo principal com
`administrador:"true"` demonstra a ausência de qualquer restrição no servidor).

---

## BUG-07 — Sem rate limiting / bloqueio após logins inválidos repetidos

**Severidade:** 🟠 Média **Status:** 📌 Por design nesta aplicação de treinamento

**Área:** `POST /login`

**Descrição:** Nenhum bloqueio, backoff ou CAPTCHA é acionado após tentativas repetidas de
credenciais inválidas contra a mesma conta, deixando o endpoint suscetível a força
bruta/credential stuffing sem mitigação observada.

**Evidência:** Observado ao sondar cenários de `login.cy.js`; não automatizado (exigiria inundar
um ambiente de teste compartilhado).

---

## BUG-08 — Sem UI de fallback quando o backend está inacessível (`503` observado)

**Severidade:** 🟠 Média **Status:** ✅ Confirmado (efetivamente observado)

**Área:** Front-end, todas as telas dependentes da API (mais visível em `/login`)

**Descrição:** Durante este projeto, a API pública do ServeRest retornou `503` por um período
prolongado. O front-end não mostrou nenhum estado de erro elegante — a tela ficou
travada/em branco em vez de exibir uma mensagem de retry/erro ao usuário.

**Evidência:** Observado diretamente contra a instância pública; documentado em
`test-design.pt-BR.md`, Seção 4 (Falhas de rede). Não automatizado contra a stack local
(exigiria `cy.intercept()` forçando um `503`/erro de rede — listado como candidato em
`test-design.pt-BR.md`, Seção 6).

---

## BUG-09 — Chamadas HTTP do front-end não têm timeout de requisição configurado

**Severidade:** 🟠 Média **Status:** ✅ Confirmado (via leitura do código-fonte)

**Área:** `ServeRest/front`, `src/services/*.js`

**Descrição:** As chamadas do cliente HTTP (`axios`/`fetch`) usadas pelo front-end não
configuram nenhum `timeout` de requisição. Uma resposta lenta ou travada do backend deixaria a
UI esperando indefinidamente, sem corte no lado do cliente.

**Evidência:** Confirmado lendo diretamente o código-fonte do `ServeRest/front` (nenhuma opção
de timeout presente em nenhuma chamada de serviço).

---

## BUG-10 — Formulários sem estado de carregamento / proteção contra envio duplicado

**Severidade:** 🟡 Baixa **Status:** ✅ Confirmado (via observação da UI)

**Área:** Formulários do front-end, ex.: `/cadastrarprodutos`, `/cadastrarusuarios`

**Descrição:** Os botões de envio não mostram nenhum estado visível de carregamento/desabilitado
enquanto a requisição está em andamento, e nada impede que o usuário clique duas vezes no envio,
disparando requisições duplicadas (as validações de unicidade no servidor são a única rede de
segurança contra registros duplicados).

**Evidência:** Observado manualmente ao exercitar a UI; documentado em `test-design.pt-BR.md`,
Seção 3 e Seção 6, como candidato de automação adiado.

---

## BUG-11 — "Adicionar no carrinho" não completa um fluxo de carrinho funcional

**Severidade:** ⚪ Informativo **Status:** 📌 Por design (limitação conhecida)

**Área:** Tela de Lista de Compras

**Descrição:** Adicionar um produto a partir de `/home` envia o item para a Lista de Compras, não
para um carrinho. A Lista de Compras tem uma ação "Adicionar no carrinho" que não completa um
fluxo de carrinho funcional — essa funcionalidade nunca foi finalizada. Documentado aqui por
completude; tratado como uma lacuna intencional, não uma regressão a investigar.

---

## BUG-12 — Tela de Relatórios não está implementada

**Severidade:** ⚪ Informativo **Status:** 📌 Por design (limitação conhecida)

**Área:** Admin → Relatórios

**Descrição:** A tela de Relatórios existe como item de navegação, mas não tem implementação
funcional por trás. Nenhum caso de teste funcional a exercita.

---

## BUG-13 — Listar Usuários: usuários recém-cadastrados supostamente ausentes da listagem

**Severidade:** ⚪ Informativo **Status:** ❓ Não confirmado

**Área:** Admin → Listar Usuários

**Relato original:** Usuários criados via "Cadastrar Usuários" não aparecem em "Listar Usuários".

**Resultado da investigação:** Retestado contra a stack local em docker (imagem oficial da API
`paulogoncalvesbh/serverest` + build recente do `ServeRest/front`). O teste automatizado
`cypress/e2e/ui/admin-register-user.cy.js` mostra o oposto: a linha do usuário recém-criado
aparece de forma consistente, verificado em 3 tentativas. O `GET /usuarios` também não é paginado
(`quantidade` é igual a `usuarios.length`), descartando um corte por tamanho de página como
explicação.

**Status atual:** Não reproduz nesta stack. Pode refletir a instância pública `serverest.dev`,
uma sessão de navegador desatualizada, ou uma condição ainda não identificada. Precisa de passos
de reprodução/detalhes de ambiente concretos antes de ser reaberto como defeito confirmado. Se
reaparecer, adicionar um teste de caracterização "falha conhecida", seguindo o padrão já usado no
restante desta suíte (ver o contexto "Known gaps" de `users.cy.js`).
