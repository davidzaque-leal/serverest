🇧🇷 [Versão em português](bug-report.pt-BR.md)

# ServeRest — Bug Report

Consolidated defect report for the ServeRest application (API + front-end), produced while
building the automated test suite in this repository. Every item below was verified directly
against the running application (local docker stack: official `paulogoncalvesbh/serverest` API
image + a fresh `ServeRest/front` build) — none are assumed from documentation. Cross-references
to the underlying analysis and automated characterization tests live in
[`test-design.md`](test-design.md).

## Legend

| Field        | Values                                                                                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Severity** | 🔴 High · 🟠 Medium · 🟡 Low · ⚪ Info (not a defect, documented for completeness)                                                                             |
| **Status**   | ✅ Confirmed (reproduced locally) · ❓ Unconfirmed (reported, not reproduced) · 📌 By design (accepted for a training app, would be a finding in a real audit) |

## Summary

| ID     | Title                                                                        | Severity | Status                          |
| ------ | ---------------------------------------------------------------------------- | -------- | ------------------------------- |
| BUG-01 | Shopping List: decreasing quantity to 0 does not remove the item             | 🟠       | ✅ Confirmed                    |
| BUG-02 | `DELETE /usuarios/:id` does not validate id format (inconsistent with `GET`) | 🟡       | ✅ Confirmed                    |
| BUG-03 | `nome` accepts a whitespace-only value on user registration                  | 🟡       | ✅ Confirmed                    |
| BUG-04 | `nome` has no maximum length on user registration                            | 🟡       | ✅ Confirmed                    |
| BUG-05 | Inconsistent boundary semantics between `preco` and `quantidade`             | 🟡       | ✅ Confirmed                    |
| BUG-06 | Any account can self-register as `administrador:"true"` via the API          | 🔴       | 📌 By design                    |
| BUG-07 | No rate limiting / lockout on repeated failed logins                         | 🟠       | 📌 By design                    |
| BUG-08 | No fallback UI when the backend is unreachable (observed `503`)              | 🟠       | ✅ Confirmed                    |
| BUG-09 | Front-end HTTP calls have no request timeout configured                      | 🟠       | ✅ Confirmed                    |
| BUG-10 | Forms have no loading state / duplicate-submit protection                    | 🟡       | ✅ Confirmed                    |
| BUG-11 | "Adicionar no carrinho" does not complete a working cart flow                | ⚪       | 📌 By design (known limitation) |
| BUG-12 | Relatórios (Reports) screen is not implemented                               | ⚪       | 📌 By design (known limitation) |
| BUG-13 | Listar Usuários: newly registered users allegedly missing from the list      | ⚪       | ❓ Unconfirmed                  |

---

## BUG-01 — Shopping List: decreasing quantity to 0 does not remove the item

**Severity:** 🟠 Medium **Status:** ✅ Confirmed

**Area:** Shopping List (`/home` → add product → Lista de Compras)

**Steps to reproduce:**

1. Log in as a regular user (`administrador:"false"`).
2. Add one product to the Shopping List from `/home` (quantity becomes 1).
3. On the Shopping List screen, click `-` on that item to decrease its quantity from 1 to 0.

**Expected:** The item is removed from the list once its quantity reaches 0.

**Actual:** The item stays in the list at "Total: 1" indefinitely. Only "Limpar Lista" (which
overwrites the entire array) empties the list.

**Root cause (read from source):** `ServeRest/front`, `src/services/cart.js`, `deleteItem` —
the function filters the stored array on `element.id`, but cart items only ever carry `_id`.
The filter predicate never matches, so nothing is ever removed by the decrement path.

**Evidence / automated as:** Characterization test in
`cypress/e2e/ui/shopping-list.cy.js` ("Known gaps" context).

---

## BUG-02 — `DELETE /usuarios/:id` does not validate id format (inconsistent with `GET`)

**Severity:** 🟡 Low **Status:** ✅ Confirmed

**Area:** `DELETE /usuarios/:id`

**Steps to reproduce:**

1. Call `GET /usuarios/:id` with a malformed id (not exactly 16 alphanumeric characters).
2. Call `DELETE /usuarios/:id` with the same malformed id.

**Expected:** Consistent id-shape validation across both endpoints — `400` for a malformed id.

**Actual:** `GET` returns `400` for a malformed id, but `DELETE` skips shape validation entirely
and returns `200` `"Nenhum registro excluído"`.

**Evidence / automated as:** Characterization test in `cypress/e2e/api/users.cy.js`.

---

## BUG-03 — `nome` accepts a whitespace-only value on user registration

**Severity:** 🟡 Low **Status:** ✅ Confirmed

**Area:** `POST /usuarios`, field `nome`

**Steps to reproduce:** Submit a registration payload with `nome: "   "` (spaces only) and
otherwise valid data.

**Expected (business assumption):** Rejected as an effectively empty name.

**Actual:** Accepted, `201`.

**Evidence / automated as:** Characterization test in `cypress/e2e/api/users.cy.js`.

---

## BUG-04 — `nome` has no maximum length on user registration

**Severity:** 🟡 Low **Status:** ✅ Confirmed

**Area:** `POST /usuarios`, field `nome`

**Steps to reproduce:** Submit a registration payload with a 1000-character `nome`.

**Expected:** Some reasonable upper bound rejects excessively long input.

**Actual:** Accepted, `201`, no length ceiling observed.

**Evidence / automated as:** `cypress/e2e/api/users.cy.js`.

---

## BUG-05 — Inconsistent boundary semantics between `preco` and `quantidade`

**Severity:** 🟡 Low **Status:** ✅ Confirmed

**Area:** `POST /produtos`

**Description:** `preco` must be a positive integer — its valid range is `[1, ∞)`, `0` is
rejected. `quantidade` allows `0` — its valid range is `[0, ∞)`, inclusive of the lower bound.
Two numeric fields on the same resource use different inclusive/exclusive conventions for their
lower bound with no documented rationale, which is an easy source of off-by-one mistakes for
API consumers.

**Evidence / automated as:** Boundary-value tests in `cypress/e2e/api/products.cy.js`.

---

## BUG-06 — Any account can self-register as `administrador:"true"` via the API

**Severity:** 🔴 High (would be Critical in a production system) **Status:** 📌 By design for
this training app

**Area:** `POST /usuarios`

**Description:** Nothing on the registration endpoint prevents a client from setting
`administrador:"true"` on self-registration. Privilege escalation is trivial — any anonymous
caller can mint themselves an admin account with a single request.

**Note:** Documented as an intentional characteristic of this training application, not something
to "fix" here. Flagged because it would be a critical finding in a real production security audit.

**Evidence:** `cypress/e2e/api/users.cy.js` (happy-path test with `administrador:"true"`
demonstrates the absence of any server-side restriction).

---

## BUG-07 — No rate limiting / lockout on repeated failed logins

**Severity:** 🟠 Medium **Status:** 📌 By design for this training app

**Area:** `POST /login`

**Description:** No lockout, backoff, or CAPTCHA is triggered after repeated invalid-credential
attempts against the same account, making the endpoint susceptible to brute-force/credential
stuffing with no mitigation observed.

**Evidence:** Noted while probing `login.cy.js` scenarios; not automated (would require flooding
a shared test environment).

---

## BUG-08 — No fallback UI when the backend is unreachable (observed `503`)

**Severity:** 🟠 Medium **Status:** ✅ Confirmed (actually observed)

**Area:** Front-end, all screens depending on the API (most visibly `/login`)

**Description:** During this project, the public ServeRest API returned `503` for an extended
period. The front-end showed no graceful error state — the screen was left stuck/blank rather
than surfacing a retry/error message to the user.

**Evidence:** Directly observed against the public instance; documented in
`test-design.md` Section 4 (Network failures). Not automated against the local stack (would
require `cy.intercept()` with a forced `503`/network error — listed as a candidate in
`test-design.md` Section 6).

---

## BUG-09 — Front-end HTTP calls have no request timeout configured

**Severity:** 🟠 Medium **Status:** ✅ Confirmed (via source read)

**Area:** `ServeRest/front`, `src/services/*.js`

**Description:** The HTTP client calls (`axios`/`fetch`) used by the front-end do not configure
any request `timeout`. A hung or slow backend response would leave the UI waiting indefinitely
with no client-side cutoff.

**Evidence:** Confirmed by reading `ServeRest/front` source directly (no timeout option present
in any service call).

---

## BUG-10 — Forms have no loading state / duplicate-submit protection

**Severity:** 🟡 Low **Status:** ✅ Confirmed (via UI observation)

**Area:** Front-end forms, e.g. `/cadastrarprodutos`, `/cadastrarusuarios`

**Description:** Submit buttons show no visible loading/disabled state while a request is in
flight, and nothing prevents a user from double-clicking submit and firing duplicate requests
(the server-side uniqueness checks are the only safety net against duplicate records).

**Evidence:** Observed manually while exercising the UI; documented in `test-design.md`
Section 3 and Section 6 as a deferred automation candidate.

---

## BUG-11 — "Adicionar no carrinho" does not complete a working cart flow

**Severity:** ⚪ Info **Status:** 📌 By design (known limitation)

**Area:** Shopping List screen

**Description:** Adding a product from `/home` sends it to the Shopping List, not a cart. The
Shopping List has an "Adicionar no carrinho" action that does not complete a working cart flow —
this feature was never finished. Documented here for completeness; treated as an intentional gap,
not a regression to chase.

---

## BUG-12 — Relatórios (Reports) screen is not implemented

**Severity:** ⚪ Info **Status:** 📌 By design (known limitation)

**Area:** Admin → Relatórios

**Description:** The Relatórios screen exists as a navigation entry but has no functional
implementation behind it. No functional test cases target it.

---

## BUG-13 — Listar Usuários: newly registered users allegedly missing from the list

**Severity:** ⚪ Info **Status:** ❓ Unconfirmed

**Area:** Admin → Listar Usuários

**Original report:** Users created via "Cadastrar Usuários" do not appear in "Listar Usuários".

**Investigation result:** Re-tested against the local docker stack (official
`paulogoncalvesbh/serverest` API image + a fresh `ServeRest/front` build). Automated
`cypress/e2e/ui/admin-register-user.cy.js` shows the opposite: the newly created user's row
renders reliably, verified across 3 retries. `GET /usuarios` is also unpaginated
(`quantidade` equals `usuarios.length`), ruling out a page-size cutoff as an explanation.

**Current status:** Does not reproduce on this stack. May reflect the public `serverest.dev`
instance, a stale browser session, or a condition not yet identified. Needs concrete repro
steps/environment details before being re-opened as a confirmed defect. If it resurfaces, add a
"known failing" characterization test following the pattern used elsewhere in this suite (see
`users.cy.js`'s "Known gaps" context).
