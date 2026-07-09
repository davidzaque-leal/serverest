🇺🇸 [English version](test-design.md)

# ServeRest — Análise de Design e Cobertura de Testes

Documento de design de testes para os três fluxos centrais sob teste: **Cadastro de Usuário**,
**Login** e **Cadastro de Produto**. Toda regra e código de status abaixo foi verificado
diretamente contra a API real do ServeRest em execução (não presumido a partir da
documentação) — veja as notas de evidência inline. Todo cenário identificado nesta análise no
nível de API foi automatizado; os cenários de UI foram automatizados seletivamente com base na
análise de candidatos na [Seção 6](#6-análise-de-candidatos-à-automação-de-ui).

## Legenda

| Símbolo | Significado                                                              |
| ------- | ------------------------------------------------------------------------ |
| ✅      | Automatizado neste repositório (ver arquivo referenciado)                |
| 📋      | Documentado / recomendado, não automatizado — ver justificativa na linha |
| ⚠️      | Lacuna ou inconsistência real encontrada na aplicação ao sondá-la        |

---

## 1. Fluxo: Cadastro de Usuário (`POST /usuarios`, UI `/cadastrarusuarios`)

### Regras de campo confirmadas

| Campo           | Obrigatório | Validação observada                                                                                                                          | Limite                                                                                                    |
| --------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `nome`          | sim         | qualquer string não vazia                                                                                                                    | ⚠️ apenas espaços (`"   "`) é **aceito**; ⚠️ sem tamanho máximo — um nome de 1000 caracteres é **aceito** |
| `email`         | sim         | deve ter formato de e-mail válido (`"email deve ser um email válido"`); deve ser globalmente único (`"Este email já está sendo usado"`, 400) | sem tamanho máximo observado                                                                              |
| `password`      | sim         | qualquer string não vazia                                                                                                                    | sem tamanho mínimo exigido (`"123"` é aceito)                                                             |
| `administrador` | sim         | deve ser literalmente a string `"true"` ou `"false"` (`"administrador deve ser 'true' ou 'false'"`, 400)                                     | booleano representado como string, não um booleano real                                                   |

### Matriz de cenários

| Dimensão                          | Cenário                                                                     | Esperado                                                                                                                   | Status                                                |
| --------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Fluxo principal (Happy Path)      | Dados válidos e únicos, `administrador:"true"`                              | `201` + `{ message, _id }`                                                                                                 | ✅ `users.cy.js`                                      |
| Fluxo principal (Happy Path)      | Dados válidos e únicos, `administrador:"false"`                             | `201` + `{ message, _id }`                                                                                                 | ✅ `users.cy.js`                                      |
| Negativo                          | E-mail duplicado                                                            | `400` `"Este email já está sendo usado"`                                                                                   | ✅ `users.cy.js`                                      |
| Negativo                          | Todos os campos ausentes (`{}`)                                             | `400`, uma mensagem por campo ausente                                                                                      | ✅ `users.cy.js`                                      |
| Negativo                          | Formato de e-mail inválido (sem `@`)                                        | `400` `"email deve ser um email válido"`                                                                                   | ✅ `users.cy.js`                                      |
| Negativo                          | `administrador` fora de `"true"`/`"false"` (ex.: `"maybe"`)                 | `400` `"administrador deve ser 'true' ou 'false'"`                                                                         | ✅ `users.cy.js`                                      |
| Particionamento por equivalência  | E-mail: formato válido (aceito) vs. formato inválido (rejeitado)            | Válido → `201`; inválido → `400`                                                                                           | ✅ coberto pelos dois testes acima                    |
| Análise de valor limite           | Tamanho de `nome`: 0 caracteres / 1000 caracteres                           | 0 caracteres → `400` (coberto por "campos ausentes"); 1000 caracteres → **aceito** ⚠️                                      | ✅ `users.cy.js`                                      |
| Caso de borda                     | `nome` = apenas espaços (`"   "`)                                           | Expectativa de negócio: rejeitado. **Real: aceito (201)**                                                                  | ✅ teste de caracterização, ⚠️ lacuna real            |
| Caso de borda                     | Espaços no início/fim do `email`                                            | Não sondado — recomenda-se testar, provavelmente aceito literalmente (sem trim)                                            | 📋 baixa prioridade, sem impacto observado ao usuário |
| Comportamento inválido do usuário | Enviar o formulário de cadastro duas vezes rapidamente (duplo clique na UI) | Não deveria criar duas contas / botão deveria travar durante o envio                                                       | 📋 nível de UI, ver Seção 6                           |
| Regra de negócio implícita        | Nada impede o autocadastro como `administrador:"true"` via API              | Escalonamento de privilégio por design nesta aplicação de treinamento — seria um achado real em uma auditoria de produção  | ⚠️ registrado, fora do escopo "corrigir"              |
| Falha de API                      | Corpo JSON malformado (chaves/valores sem aspas)                            | `400` com mensagem de orientação                                                                                           | ✅ `users.cy.js`                                      |
| Validação de dados                | Formato do `id` em `GET /usuarios/:id`                                      | Deve ter exatamente 16 caracteres alfanuméricos, senão `400`                                                               | ✅ `users.cy.js`                                      |
| Inconsistência ⚠️                 | `DELETE /usuarios/:id` com id malformado (tamanho errado)                   | Diferente do `GET`, o `DELETE` **não** valida o formato do id — retorna `200` `"Nenhum registro excluído"` em vez de `400` | ✅ teste de caracterização, ⚠️ lacuna real            |
| Permissões                        | Cadastrar-se como `administrador:"false"` e depois tentar criar um produto  | Ver Fluxo 3 → Permissões                                                                                                   | ✅ `products.cy.js`                                   |

---

## 2. Fluxo: Login (`POST /login`, UI `/login`)

### Regras confirmadas

| Regra                                                                                                | Evidência                                                                                                                      |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Sucesso → `200` + `{ message, authorization }`, token no formato `Bearer <JWT>`                      | ✅ verificado                                                                                                                  |
| Credenciais inválidas (senha errada ou e-mail não cadastrado) → `401` `"Email e/ou senha inválidos"` | ✅ verificado, mesma mensagem para **ambos** os casos (sem enumeração de usuários — boa prática)                               |
| `email` / `password` ausentes → `400` com mensagem por campo                                         | ✅ verificado                                                                                                                  |
| TTL do token                                                                                         | JWT `exp - iat = 600s` (**10 minutos**), nenhum mecanismo de refresh token observado ✅ verificado decodificando um token real |

### Matriz de cenários

| Dimensão                           | Cenário                                                                                                                                 | Esperado                                                                                                                                                                                                 | Status                                                                                                                                                                                                                                         |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fluxo principal (Happy Path)       | E-mail + senha válidos, usuário comum                                                                                                   | `200` + token; UI redireciona para `/home`                                                                                                                                                               | ✅ `login.cy.js`, `login.cy.js` (UI)                                                                                                                                                                                                           |
| Fluxo principal (Happy Path)       | E-mail + senha válidos, usuário admin                                                                                                   | `200` + token; UI redireciona para `/admin/home` (destino e título diferentes do caso de usuário comum)                                                                                                  | ✅ `login.cy.js` (UI)                                                                                                                                                                                                                          |
| Negativo                           | Senha errada para uma conta real                                                                                                        | `401` `"Email e/ou senha inválidos"`                                                                                                                                                                     | ✅ `login.cy.js` (API + UI)                                                                                                                                                                                                                    |
| Negativo                           | E-mail inexistente                                                                                                                      | `401`, mensagem idêntica (sem enumeração de contas) — partição de equivalência distinta de "senha errada"                                                                                                | ✅ `login.cy.js`                                                                                                                                                                                                                               |
| Qualidade da assertiva ⚠️          | Assertar apenas `cy.url().should('include', '/home')` após o login                                                                      | Parece suficiente, mas `/admin/home` também contém a substring `/home`, e as duas navbars renderizam o mesmo `[data-testid="logout"]` — um teste que semeasse um usuário admin por engano ainda passaria | ⚠️ encontrado ao fortalecer exatamente este teste; corrigido assertando o título `h1` específico da página (`"Serverest Store"` vs. `"Bem Vindo"`) além da URL — agora são dois testes dedicados, um por destino de redirecionamento           |
| Negativo                           | `email` ausente / `password` ausente                                                                                                    | `400` com mensagem por campo                                                                                                                                                                             | ✅ `login.cy.js`                                                                                                                                                                                                                               |
| Caso de borda                      | Sensibilidade a maiúsculas/minúsculas no e-mail (`Test@qa.com` vs `test@qa.com`)                                                        | Não sondado — recomenda-se testar; fonte real de tickets de suporte "não consigo logar" se inconsistente com o cadastro                                                                                  | 📋 não automatizado                                                                                                                                                                                                                            |
| Caso de borda                      | Espaços no início/fim de e-mail/senha ao enviar                                                                                         | Não sondado — a UI não parece fazer trim visível dos campos                                                                                                                                              | 📋 não automatizado                                                                                                                                                                                                                            |
| Segurança / comportamento inválido | Tentativas de força bruta (muitos logins inválidos rápidos)                                                                             | Nenhum rate limiting/bloqueio observado no ServeRest — aceitável para uma aplicação de treinamento, seria um achado em auditoria real                                                                    | ⚠️ registrado                                                                                                                                                                                                                                  |
| Expiração de sessão                | Token usado após o `exp` de 10 minutos                                                                                                  | Esperado `401` em `/produtos`/outras rotas protegidas                                                                                                                                                    | 📋 **não automatizado por design**: o servidor verifica o tempo real (wall-clock) dentro da biblioteca JWT, então `cy.clock()` não consegue simular isso; o único teste fiel exigiria esperar 10+ minutos, uma troca ruim para uma suíte de CI |
| Expiração de sessão                | Comportamento da UI quando o token expira em meio à sessão (sem aviso visível de sessão/inatividade)                                    | O front não parece avisar proativamente antes da expiração                                                                                                                                               | 📋 lacuna de UX a sinalizar, ver Seção 6                                                                                                                                                                                                       |
| Concorrência                       | Mesmo usuário loga em duas abas/dispositivos simultaneamente                                                                            | O ServeRest emite um novo JWT stateless a cada login; ambos permanecem válidos até expirarem (sem controle de sessão única)                                                                              | 📋 documentado, baixo valor para automatizar (comportamento esperado por design stateless, não é um bug)                                                                                                                                       |
| Rede                               | Requisição de login expira por timeout / conexão cai no meio da requisição                                                              | A UI deveria mostrar um estado de erro de rede, não travar indefinidamente                                                                                                                               | 📋 candidato — ver Seção 6 (`cy.intercept` + erro de rede forçado)                                                                                                                                                                             |
| Falha de API                       | Login enquanto a API está fora do ar (corresponde à instabilidade de 503 do `serverest.dev` observada durante o trabalho neste projeto) | O front deveria mostrar um erro elegante, não uma tela quebrada/em branco                                                                                                                                | ⚠️ **efetivamente observado** durante este projeto: o front público não mostra nenhuma UI de fallback útil quando o backend retorna 503                                                                                                        |
| Localização                        | Mensagens de erro/sucesso fixas em português (`pt-BR`), sem camada de i18n                                                              | N/A para esta aplicação (single-locale por design)                                                                                                                                                       | 📋 documentado, não é um defeito                                                                                                                                                                                                               |

---

## 3. Fluxo: Cadastro de Produto (`POST /produtos`, UI `/cadastrarprodutos`, somente admin)

### Regras de campo confirmadas

| Campo        | Obrigatório | Validação observada                                                                                                       | Limite                                                                                                               |
| ------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `nome`       | sim         | deve ser único entre todos os produtos (`"Já existe produto com esse nome"`, 400)                                         | sem sondagem de limite de tamanho                                                                                    |
| `preco`      | sim         | deve ser um **número inteiro positivo** — `0`/negativo rejeitados (`"...positivo"`); decimais rejeitados (`"...inteiro"`) | faixa válida é inteiros em `[1, ∞)` — descoberto no meio da sessão; inicialmente presumi que decimais seriam válidos |
| `quantidade` | sim         | deve ser `>= 0` (`"quantidade deve ser maior ou igual a 0"`)                                                              | faixa válida é `[0, ∞)`, **inclusiva** — semântica de limite inconsistente em relação a `preco`                      |
| `descricao`  | sim         | não sondado a fundo                                                                                                       | 📋                                                                                                                   |

### Matriz de cenários

| Dimensão                          | Cenário                                                                                                           | Esperado                                                                                                                                   | Status                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Fluxo principal (Happy Path)      | Produto válido e único + token de admin válido                                                                    | `201` + `{ message, _id }`                                                                                                                 | ✅ `products.cy.js`                                                          |
| Negativo                          | Sem header `authorization`                                                                                        | `401` `"Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"`                                                  | ✅ `products.cy.js`                                                          |
| Permissões                        | Token válido, porém de usuário **não-admin** (`administrador:"false"`)                                            | `403` `"Rota exclusiva para administradores"` — **status/mensagem distintos do caso sem token**                                            | ✅ `products.cy.js`                                                          |
| Negativo                          | Nome de produto duplicado                                                                                         | `400` `"Já existe produto com esse nome"`                                                                                                  | ✅ `products.cy.js`                                                          |
| Análise de valor limite           | `preco` em `0`, `-50`, `1` (menor valor válido), `1.5` (não inteiro)                                              | `0`/`-50` → `400` "positivo"; `1` → `201`; `1.5` → `400` "inteiro"                                                                         | ✅ `products.cy.js`                                                          |
| Análise de valor limite           | `quantidade` em `0`, `-1`                                                                                         | `0` → `201` (aceito, limite inclusivo); `-1` → `400`                                                                                       | ✅ `products.cy.js`                                                          |
| Caso de borda                     | Token inválido/aleatório (ex.: `Bearer garbage-token-123`)                                                        | `401`, mesma mensagem genérica do caso "sem token"                                                                                         | ✅ `products.cy.js`                                                          |
| Caso de borda                     | Header `authorization` sem o prefixo `Bearer `                                                                    | `401`, mesma mensagem genérica                                                                                                             | ✅ `products.cy.js`                                                          |
| Validação de dados                | `preco` não numérico (string)                                                                                     | `400` `"preco deve ser um número"` (mensagem distinta dos casos "deve ser positivo"/"deve ser inteiro")                                    | ✅ `products.cy.js`                                                          |
| Permissões                        | `GET /produtos` sem nenhum token (escopo de leitura)                                                              | `200` — leitura é pública, somente escrita exige admin                                                                                     | ✅ `products.cy.js`                                                          |
| Concorrência                      | Dois admins criam um produto com o mesmo nome em paralelo (corrida)                                               | Um deveria vencer com `201`, o outro deveria receber `400` de duplicidade — risco real de corrida TOCTOU em armazenamento não transacional | 📋 não automatizado — ver justificativa na Seção 6                           |
| Falha de API                      | Criação de produto enquanto `/usuarios` (dependência de autenticação) está inacessível                            | Deveria falhar de forma controlada com `401`/`5xx`, sem quebrar o formulário na UI                                                         | 📋 candidato — ver Seção 6                                                   |
| Timeout                           | Rede lenta ao enviar (UI)                                                                                         | O botão de envio deveria mostrar um estado de carregamento e não permitir envios duplicados                                                | 📋 — a UI não tem indicador de carregamento visível no botão, vale sinalizar |
| Acessibilidade                    | Campos do formulário têm labels associados / são navegáveis por teclado / erros são anunciados a leitores de tela | Não auditado nesta rodada — recomenda-se uma passada com `axe-core` (`cypress-axe`) em `/cadastrarprodutos` e `/login`                     | 📋                                                                           |
| Compatibilidade entre navegadores | Formulário de produto renderiza/funciona igual em Chromium, Firefox, WebKit                                       | Não coberto — a suíte atualmente roda somente Electron                                                                                     | 📋 — ver Seção 6                                                             |

---

## 4. Preocupações transversais (aplicam-se aos três fluxos)

| Dimensão                                           | Observação / Recomendação                                                                                                                                                                                                              | Status                                                                                                                                                                                                                                                           |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Expiração de sessão**                            | O tempo de vida do JWT é fixo em 10 minutos, sem fluxo de refresh. Um usuário logado preenchendo um formulário por mais de 10 minutos terá sua próxima chamada à API rejeitada, sem aviso proativo na UI.                              | 📋 não automatizável de forma rápida/determinística — ver justificativa no Fluxo 2.                                                                                                                                                                              |
| **Concorrência**                                   | A aplicação é stateless (baseada em JWT), sem trava de sessão no servidor. Duas requisições de "criação" simultâneas para o mesmo recurso único (e-mail de usuário, nome de produto) são uma superfície real de condição de corrida.   | 📋 documentado, não automatizado — comandos do Cypress são enfileirados serialmente por padrão; requisições verdadeiramente paralelas exigiriam `fetch`/`Promise.all` "cru", fora da fila de comandos, complexidade não justificada para uma API de treinamento. |
| **Falhas de rede**                                 | Não exercitadas nesta suíte. `cy.intercept()` pode forçar `forceNetworkError: true` ou atrasos arbitrários para verificar os estados de erro/carregamento da UI.                                                                       | 📋 — um ponto de dor real, observado durante o trabalho neste projeto: a instância **pública** do ServeRest retornou `503` por horas, e o front não mostrou nenhuma UI de fallback, apenas um estado travado/em branco. Um achado genuíno, não hipotético.       |
| **Timeouts**                                       | Nenhum tratamento explícito de timeout de requisição visível no front (`src/services/*.js` usam `axios`/`fetch` puro, sem `timeout` configurado — confirmado lendo o código-fonte). Um backend travado prenderia a UI indefinidamente. | ⚠️ lacuna real encontrada ao ler o código-fonte do `ServeRest/front`.                                                                                                                                                                                            |
| **Permissões / perfis de acesso**                  | Apenas dois perfis: admin (`administrador:"true"`) e usuário comum (`"false"`). Usuários comuns podem logar, mas são bloqueados de escrever em `/produtos` com um `403` distinto. Usuários comuns **ainda podem** ler `GET /produtos`. | ✅ tanto o limite de permissão de escrita quanto o escopo de leitura pública estão verificados em `products.cy.js`.                                                                                                                                              |
| **Compatibilidade entre navegadores/dispositivos** | A suíte atual roda apenas no Electron (headless). O front construído com CRA (React 16, sem framework responsivo além de CSS básico) não foi testado em viewports mobile.                                                              | 📋 recomenda-se adicionar ao menos uma passada de smoke test em viewport mobile (`cy.viewport('iphone-x')`) em `/login`.                                                                                                                                         |
| **Localização (idioma, data, moeda, fuso)**        | Locale único (`pt-BR`), sem lógica de formatação de moeda/data encontrada para `preco` (número bruto, sem `Intl.NumberFormat`) — não é um defeito, apenas vale notar que não há superfície de i18n para testar.                        | 📋 documentado, nenhuma ação necessária para esta aplicação.                                                                                                                                                                                                     |
| **Acessibilidade**                                 | Não auditada. Recomenda-se `cypress-axe` em `/login`, `/cadastrarusuarios`, `/cadastrarprodutos` como uma linha de base automatizada rápida (contraste, labels, landmarks).                                                            | 📋                                                                                                                                                                                                                                                               |

---

## 5. Resumo de rastreabilidade

| Fluxo                             | Cenários automatizados                                                                                                                                                                                                       | Arquivo                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Cadastro de Usuário (API)         | Criação com sucesso (admin + não-admin), e-mail duplicado, campos ausentes, e-mail inválido, `administrador` inválido, `nome` vazio/longo, JSON malformado, limite de id, inconsistência de validação de id entre GET/DELETE | `cypress/e2e/api/users.cy.js`                 |
| Cadastro de Usuário (UI)          | Fluxo principal + redirecionamento, erro inline de e-mail duplicado                                                                                                                                                          | `cypress/e2e/ui/register-user.cy.js`          |
| Login (API)                       | Autenticação com sucesso, senha errada, e-mail inexistente, e-mail ausente, senha ausente                                                                                                                                    | `cypress/e2e/api/login.cy.js`                 |
| Login (UI)                        | Autenticação + redirecionamento (usuário comum), login admin + redirecionamento, credenciais inválidas + mensagem de erro                                                                                                    | `cypress/e2e/ui/login.cy.js`                  |
| Cadastro de Produto (API)         | Criação com token válido, rejeição sem token, 403 não-admin, nome duplicado, limites de `preco`/`quantidade`, token inválido/malformado, `preco` não numérico, leitura pública                                               | `cypress/e2e/api/products.cy.js`              |
| Cadastro de Produto (UI)          | Fluxo principal do admin + redirecionamento para a listagem de produtos                                                                                                                                                      | `cypress/e2e/ui/product-registration.cy.js`   |
| Cadastro de Usuário (UI, admin)   | Admin cadastra um usuário via Cadastrar Usuários, linha visível em Listar Usuários + confirmado via API                                                                                                                      | `cypress/e2e/ui/admin-register-user.cy.js`    |
| Lista de Compras (UI)             | Adicionar produto, somar quantidade em adições repetidas, atualizar quantidade via +/-, limpar lista, teste de caracterização da redução a zero (bug real)                                                                   | `cypress/e2e/ui/shopping-list.cy.js`          |
| Listagem e Busca de Produtos (UI) | Catálogo lista um produto cadastrado, busca filtra apenas o produto correspondente, mensagem de "nenhum resultado" em busca sem correspondência                                                                              | `cypress/e2e/ui/product-listing-search.cy.js` |
| Acesso à UI                       | Tela de login carrega com todos os elementos                                                                                                                                                                                 | `cypress/e2e/ui/login-access.cy.js`           |

**Todo cenário de API identificado nas Seções 1–4 está automatizado** (30 casos de teste de API
em 3 arquivos), com exceção do punhado explicitamente marcado com 📋 e justificativa (expiração
de sessão exige tempo real decorrido; concorrência verdadeira exige contornar a fila serial de
comandos do Cypress). Os três fluxos centrais de UI (cadastro de usuário, login, cadastro de
produto) agora têm cobertura end-to-end dedicada, além do cadastro de usuário pelo admin, do
fluxo de adição/remoção na Lista de Compras e da listagem/busca de produtos da Seção 7 (16 casos
de teste de UI em 7 arquivos), conforme as prioridades definidas na Seção 6. Itens marcados com
⚠️ são lacunas/inconsistências reais encontradas na própria aplicação ServeRest ao sondá-la para
esta análise — não são defeitos
desta suíte de testes.

---

## 6. Análise de candidatos à automação de UI

A camada de UI exige uma abordagem **seletiva** — automatizar cada dimensão acima também no
nível de UI duplicaria a cobertura da API sem agregar confiança, e tornaria a suíte lenta e
instável. Esta seção pontua cada fluxo candidato restante pelo valor de automação.

| Candidato                                                                | Risco para o usuário se quebrar                                                                | Sobreposição com cobertura de API                 | Custo de automação                                                                                                                           | Recomendação                                                                                                                               |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Formulário de cadastro de usuário** (fluxo principal + erros inline)   | Alto — é a primeira coisa que um novo usuário faz; formulário quebrado = cadastro perdido      | Regras de campo já comprovadas no nível de API    | Baixo (reaproveita o padrão POM do `LoginPage`, um novo page object)                                                                         | ✅ Automatizado — `register-user.cy.js`                                                                                                    |
| **Formulário de cadastro de produto** (fluxo principal do admin)         | Médio — recurso restrito a admin, perfil de ferramenta interna                                 | Regras de campo já comprovadas no nível de API    | Baixo-médio (exige setup de login como admin + novo page object)                                                                             | ✅ Automatizado — `product-registration.cy.js`                                                                                             |
| **Listagem/busca de produtos** (catálogo `/home` + `pesquisar`)          | Médio — busca quebrada bloqueia todos os fluxos de carrinho a jusante                          | Endpoint de leitura já coberto (`products.cy.js`) | Baixo                                                                                                                                        | ✅ Automatizado — `product-listing-search.cy.js`                                                                                           |
| **Trava de envio duplicado / botão** nos formulários                     | Baixo-médio — mais um incômodo de integridade de dados do que um bloqueio                      | Nenhuma (a API já rejeita duplicatas no servidor) | Médio (exige forçar um duplo clique real, naturalmente um pouco instável)                                                                    | 📋 adiar — a rejeição de duplicidade no servidor é a rede de segurança real                                                                |
| **Redirecionamento por expiração de sessão** (rota protegida)            | Médio — UX confusa de beco sem saída se falhar silenciosamente                                 | Nenhuma                                           | Alto (exige uma forma rápida de forçar um token expirado — ex.: semear o `localStorage` com um JWT já expirado em vez de esperar 10 minutos) | 📋 vale a pena com o truque do `localStorage`, adiado para uma iteração futura                                                             |
| **Estados de UI para falha de rede** (erros forçados via `cy.intercept`) | Médio — este projeto _vivenciou_ exatamente esse modo de falha com a API pública               | Nenhuma                                           | Baixo (Cypress tem suporte de primeira classe via `cy.intercept`)                                                                            | 📋 alto valor dada a instabilidade real que este projeto enfrentou com a API pública, bom candidato a um 4º teste de UI se a suíte crescer |
| **Passada cross-browser** (Firefox/WebKit além do Electron)              | Baixo para esta aplicação (nenhuma API exótica de navegador em uso)                            | N/A                                               | Baixo (uma linha a mais na matriz do CI)                                                                                                     | 📋 barato para adicionar ao CI depois, não é um teste funcional em si                                                                      |
| **Linha de base de acessibilidade** (`cypress-axe`)                      | Baixo-médio — usuários reais com tecnologia assistiva são afetados, mas não é quebra funcional | Nenhuma                                           | Baixo (plugin plug-and-play + uma assertiva por página)                                                                                      | 📋 bom "extra" se sobrar tempo                                                                                                             |
| **Smoke test em viewport mobile**                                        | Baixo — a aplicação é uma ferramenta de treinamento de QA, não um produto de consumo em escala | Nenhuma                                           | Muito baixo (`cy.viewport`)                                                                                                                  | 📋 barato, baixa prioridade                                                                                                                |

### Decisão

**Cadastro de Usuário** e **Cadastro de Produto** pontuam como alto valor/baixo custo e foram
ambos automatizados, completando a cobertura de UI dos três fluxos centrais (cadastro de usuário,
login, cadastro de produto). **Cadastro de Produto (fluxo principal do admin)** se destacou como
a adição de maior prioridade: é o único fluxo de UI que (a) ainda não havia sido tocado por
nenhum teste existente, (b) exercita um perfil de permissão distinto (login como admin) de ponta
a ponta pela UI real, e (c) tem sobreposição zero de cobertura de UI com a suíte de API (a suíte
de API comprova o contrato do endpoint; o teste de UI comprova que o **formulário** está
corretamente conectado a ele — modos de falha diferentes, ambos valem a pena cobrir uma vez
cada). Todo o restante da tabela acima foi deliberadamente deixado para uma iteração futura —
automatizá-lo agora trocaria velocidade e estabilidade da suíte por confiança marginal.

---

## 7. Fluxos adicionais: cadastro de usuário pelo admin, lista de compras, relatórios

A exploração manual da UI completa (nos dois perfis de acesso) revelou telas e fluxos fora dos
três fluxos centrais das Seções 1–3. O cadastro de usuário pelo admin e o fluxo de adicionar/
remover na lista de compras já estão automatizados (abaixo); Relatórios continua fora de escopo
por design.

### Perfis de acesso, como renderizados na UI

| Perfil                                  | Página inicial | O que é exibido                                                                                                                                                                   |
| --------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin (`administrador:"true"`)          | `/admin/home`  | Cinco cards de funcionalidade: **Cadastrar Usuários**, **Listar Usuários**, **Cadastrar Produtos**, **Listar Produtos**, **Relatórios**                                           |
| Usuário comum (`administrador:"false"`) | `/home`        | O catálogo de produtos já aparece diretamente (barra de pesquisa + grid de produtos, cada card com ação "Adicionar a lista") — sem etapa separada de "navegação" antes de comprar |

### Fluxo de Lista de Compras / Carrinho (usuário comum)

| Etapa                                    | Comportamento                                                                                                                                                                                                     |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Adicionar um produto a partir de `/home` | Envia o item para a **Lista de Compras**, não diretamente para um carrinho                                                                                                                                        |
| Tela de Lista de Compras                 | Lista os itens adicionados com controles de quantidade `+`/`-`, além das ações **"Adicionar no carrinho"** e **"Limpar Lista"**                                                                                   |
| ⚠️ Carrinho inacabado                    | "Adicionar no carrinho" não completa um fluxo de carrinho funcional — a funcionalidade de carrinho está em construção, conforme confirmado. É uma lacuna conhecida e intencional, não uma regressão a investigar. |

✅ Automatizado em `shopping-list.cy.js`: adicionar um produto a partir de `/home` e assertar que
ele aparece na Lista de Compras com quantidade 1; limpar a lista via "Limpar Lista" e assertar a
mensagem de estado vazio. As assertivas propositalmente não avançam até "Adicionar no carrinho",
pela lacuna acima.

⚠️ **Bug real encontrado ao automatizar**: reduzir a quantidade de um único item até 0 (clicar em
`-` num item com quantidade 1) **não** o remove da lista — ele permanece em "Total: 1"
indefinidamente. Causa raiz identificada diretamente no código-fonte do `ServeRest/front`
(`src/services/cart.js`, `deleteItem`): o filtro usa `element.id`, mas os itens do carrinho só
têm `_id` — logo o predicado do filtro nunca casa e nada é removido. Somente "Limpar Lista"
(`removeAll`, que apenas sobrescreve o array inteiro) funciona. Capturado como teste de
caracterização no contexto "Known gaps" de `shopping-list.cy.js`.

### Listagem e busca de produtos (usuário comum)

Correção à lista de candidatos da Seção 6: o recurso de busca (`data-testid="pesquisar"` /
`"botaoPesquisar"`) fica no **catálogo `/home` do usuário comum** (componente `CardList`), não na
tela `/admin/listarprodutos` do admin — essa tela do admin é uma tabela simples com ações de
editar/excluir, sem campo de busca, confirmado lendo diretamente o código-fonte do
`ServeRest/front` (`src/views/admin/showProducts.js` vs. `src/component/CardList.js`). Digitar um
termo e clicar em "Pesquisar" chama `GET /produtos?nome=<termo>` (correspondência por substring no
servidor) e re-renderiza a grade; um termo sem correspondência exibe a mensagem literal "Nenhum
produto foi encontrado" (sem `data-testid` dedicado, localizado pelo próprio texto).

✅ Automatizado em `product-listing-search.cy.js`: o catálogo lista um produto recém-cadastrado;
buscar por (uma substring de) seu nome filtra a grade para esse produto e oculta um produto não
relacionado criado na mesma execução; buscar um termo garantidamente inexistente mostra a
mensagem de "nenhum resultado" e nenhum card de produto.

### Admin: Relatórios

⚠️ Não implementado — a tela de Relatórios não está pronta. Nenhum caso de teste funcional deve
mirar essa tela até que seja construída. Se desejado, um teste de caracterização leve (ex.:
assertar um estado "em construção"/placeholder) poderia servir de guarda contra uma mudança
silenciosa não anunciada, mas isso é baixa prioridade.

### Admin: Listar Usuários — bug reportado, não reproduzido na stack local

⚠️→✅ **Retestado e não reproduzido**: o relato original era que usuários criados via
`Cadastrar Usuários` não aparecem em `Listar Usuários`. Ao automatizar
`admin-register-user.cy.js` contra a stack local em docker (imagem oficial
`paulogoncalvesbh/serverest` da API + build recente do `ServeRest/front`), o resultado foi o
oposto: a linha do usuário recém-criado aparece de forma consistente, confirmado em três
tentativas. O `GET /usuarios` não é paginado (`quantidade` é igual a `usuarios.length`), então
também não há corte por tamanho de página escondendo linhas novas.

✅ Automatizado como fluxo principal em `admin-register-user.cy.js`: cadastrar um usuário pelo
formulário do admin e assertar que a linha aparece em `Listar Usuários`, além de confirmar o
registro via `GET /usuarios`.

📋 Questão em aberto: o relato original pode refletir a instância pública `serverest.dev`, uma
aba de navegador desatualizada, ou uma condição ainda não identificada — vale confirmar os passos
exatos de reprodução/ambiente antes de marcar isso como defeito novamente. Se o problema
reaparecer, adicionar de volta como um teste de caracterização "falha conhecida", seguindo o
padrão já usado no restante desta suíte (ver o contexto "Known gaps" de `users.cy.js`).
