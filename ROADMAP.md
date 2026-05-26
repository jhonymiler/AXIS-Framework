# AXIS Framework — Roadmap de Melhorias

> Plano de implantação baseado em análise comparativa interna com GitHub Spec Kit (106k ★),
> OpenSpec (51k ★) e BMAD-METHOD (48k ★). Todos os docs internos dos quatro frameworks foram
> lidos antes de produzir este documento. Cada item inclui: gap identificado, fonte de inspiração
> verificada, implementação concreta e critério de aceite.

---

## Mapa de gaps — diagnóstico honesto

| Gap                                                                 | AXIS hoje                                    | Concorrente que lidera                                                         |
| ------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------ |
| Brownfield: especificar *mudanças* em sistemas existentes           | Não tem                                      | OpenSpec (delta specs ADDED/MODIFIED/REMOVED)                                  |
| Constitutional rules concretas por stack                            | Regras genéricas (engineering-discipline.md) | GitHub Spec Kit (9 artigos + Phase -1 gates)                                   |
| Debate adversarial entre agentes                                    | Sub-agentes são workers paralelos            | BMAD (party-mode: PM/Arch/Dev discordam ativamente)                            |
| Automação de feature spec → branch → pasta                          | Manual                                       | GitHub Spec Kit (`/speckit.specify` auto-cria branch + spec folder)            |
| Artefatos ricos por feature (data model, contracts, test scenarios) | Canvas REASONS (7 dimensões, 1 artefato)     | GitHub Spec Kit (spec.md + plan.md + research.md + data-model.md + contracts/) |
| Schema de workflow customizável por time                            | Fases fixas no PLANNER.md                    | OpenSpec (artifact dependency graph editável)                                  |
| Documentação pública + tutoriais em vídeo                           | README + FRAMEWORK.md                        | GitHub Spec Kit (site, vídeos, walkthroughs)                                   |

**O que o AXIS genuinamente já lidera e deve preservar:**
- Harness de plataforma (settings.json enforçado pelo runtime + hooks de shell — model não bypasssa)
- Multi-IDE via symlinks single-source (1 arquivo, todos os IDEs leem via link)
- STATE.md como playbook curado cross-session (Active Decisions previne regressão)
- Failure attribution (planejamento / execução / resposta)

---

## Visão geral do roadmap

```
Sprint 3 (atual) — Fechar gaps de conteúdo
  F9  Delta Spec Skill           (brownfield, gap vs OpenSpec)
  F10 Constitutional Rules       (conteúdo concreto, gap vs Spec Kit)
  F11 CANVAS enriquecido T + C   (artefatos ricos, gap vs Spec Kit)

Sprint 4 — Automação e workflow
  F12 axis specify <feature>     (CLI, gap vs Spec Kit)
  F13 Fase Adversarial           (debate, gap vs BMAD)
  F4C axis-rebootstrap skill     (já em Deferred Ideas)

Sprint 5 — Flexibilidade e comunidade
  F14 Schema flexível leve       (opcional, gap vs OpenSpec)
  F15 Documentação pública       (crescimento de comunidade)
```

---

## Sprint 3 — Fechar gaps de conteúdo

### F9 — Delta Spec Skill (axis-delta)

**Gap fechado:** AXIS não tem como especificar *mudanças incrementais* em sistemas brownfield.
O canvas REASONS descreve o estado completo, não o delta. Isso força re-especificação completa
a cada mudança, que é o principal ponto fraco em projetos existentes.

**Inspiração verificada:**
OpenSpec `concepts.md` (765 linhas lidas) — estrutura `openspec/changes/<change-name>/` com
`proposal.md` + `design.md` + delta specs no formato:
```markdown
## ADDED
- <novo comportamento>

## MODIFIED
- <comportamento anterior> → <comportamento novo>, porque <razão>

## REMOVED
- <comportamento removido>, impacto: <…>
```
Archivamento: após merge, delta se integra ao spec principal (ADDED é appendado,
MODIFIED substitui, REMOVED deleta). Change folder move para `changes/archive/YYYY-MM-DD-name/`.

**Como implementar:**

1. Criar `.ai/skills/axis-delta/SKILL.md` com frontmatter e conteúdo ≤ 60 linhas
2. Criar `.ai/skills/axis-delta/references/DELTA-TEMPLATE.md` com o template de delta spec
3. Criar `cli/templates/delta-skill/SKILL.md` (espelho para CLI)
4. Adicionar entrada na tabela de skills do `INSTRUCTIONS.md` e do `.github/copilot-instructions.md`
5. Executar `bash scripts/sync-cli-templates.sh` e `bash scripts/validate-axis.sh`

**Estrutura de artefatos gerados pelo skill:**

```
.ai/deltas/
└── <YYYY-MM-DD>-<feature-name>/
    ├── proposal.md      # O quê e por quê (1 página)
    ├── delta-spec.md    # ADDED / MODIFIED / REMOVED
    ├── impact.md        # Módulos afetados, riscos, rollback
    └── tasks.md         # Itens de implementação com [P] para paralelos
```

**SKILL.md — esqueleto:**

```markdown
---
name: axis-delta
description: Especifica mudanças incrementais (brownfield) via delta specs.
trigger: "brownfield", "mudança em sistema existente", "ADDED/MODIFIED/REMOVED"
---

## Quando usar
Qualquer mudança em sistema existente com ≥2 módulos afetados ou que altere contrato público.
Não usar para greenfield (use canvas REASONS via SPDD).

## Pipeline
1. Leia o spec atual da feature (se existir em .ai/deltas/ ou .ai/skills/)
2. Gere proposal.md — O quê (problema) e Por quê (valor) em ≤10 linhas
3. Gere delta-spec.md — seções ADDED / MODIFIED / REMOVED com evidência
4. Gere impact.md — módulos afetados, riscos, estratégia de rollback
5. Gate: apresente as 3 seções do delta ao usuário, aguarde confirmação
6. Após confirmação, gere tasks.md com marcadores [P] para itens paralelizáveis
7. Gate final: "Este delta está completo? Alguma modificação antes de implementar?"
```

**Como usar (após implantação) — skill-driven, sem CLI runtime:**

> Princípio (Active Decision "AXIS is one-shot"): após o bootstrap, o projeto não
> depende do CLI `axis`. A skill é auto-contida — o agente executa o pipeline
> usando Read/Write/Bash/git, lendo o `SKILL.md` instalado em `.ai/skills/axis-delta/`.

```text
# Usuário pede uma mudança em sistema existente
"Preciso adicionar rate limiting no endpoint de autenticação"

# Agente:
# 1. Detecta brownfield (sistema existente) + mudança de contrato pública
# 2. Carrega .ai/skills/axis-delta/SKILL.md (matriz de roteamento)
# 3. Executa o pipeline da skill:
#    - mkdir .ai/deltas/2026-05-26-auth-rate-limit/
#    - Write proposal.md, delta-spec.md, impact.md (templates em references/)
#    - Gate ao usuário, depois Write tasks.md
#    - git add .ai/deltas/2026-05-26-auth-rate-limit/

# Após merge bem-sucedido:
"Arquiva o delta auth-rate-limit"

# Agente (mesma skill, fase de arquivamento):
# - git mv .ai/deltas/2026-05-26-auth-rate-limit/ .ai/deltas/archive/
# - Edit no spec principal: ADDED é appendado, MODIFIED substitui, REMOVED deletado
```

**Por que não um comando `axis delta archive`:** criaria dependência permanente do
CLI no projeto bootstrapado. A operação é trivial (`git mv` + 2-3 `Edit`s) e fica
documentada no próprio `SKILL.md` como uma fase do pipeline.

**Critério de aceite:**
- [ ] `axis-delta/SKILL.md` existe, ≤ 60 linhas, com frontmatter válido
- [ ] `axis-delta/references/DELTA-TEMPLATE.md` contém as 3 seções (ADDED/MODIFIED/REMOVED)
- [ ] `axis-delta/references/ARCHIVE-PROCEDURE.md` descreve a fase de arquivamento (git mv + merge no spec)
- [ ] `validate-axis.sh` passa após o sync
- [ ] `.github/copilot-instructions.md` tabela de skills atualizada
- [ ] **Zero menção a comandos `axis <x>` no SKILL.md** (verificação manual)

---

### F10 — Constitutional Rules por Stack

**Gap fechado:** AXIS tem o melhor *mecanismo* de enforcement (hooks de plataforma), mas as
regras que esse mecanismo enforça são genéricas. GitHub Spec Kit tem 9 artigos constitucionais
concretos (Library-First, Test-First Imperative, CLI Interface Mandate, Simplicity Gate,
Anti-Abstraction Gate). AXIS deve usar seu mecanismo superior para enforçar regras igualmente
concretas — ou mais fortes.

**Inspiração verificada:**
GitHub Spec Kit `spec-driven.md` (412 linhas lidas) — `memory/constitution.md`:
```
Article I: Library-First — every feature is a standalone library
Article II: CLI Interface Mandate — all CLI must accept stdin/output stdout  
Article III: Test-First Imperative — NON-NEGOTIABLE: tests before code
Article VII: Simplicity Gate — ≤3 projects, no future-proofing
Article VIII: Anti-Abstraction Gate — use framework directly
Article IX: Integration-First — real DBs over mocks
```
Aplicados via "Phase -1 Gates" embutidos em templates de implementação.

**Como implementar:**

1. Criar `cli/templates/rules/` com arquivos de regras por stack:
   - `constitutional-node.md`
   - `constitutional-python.md`
   - `constitutional-go.md`
   - `constitutional-generic.md`

2. Cada arquivo de regras constitucional contém 5-8 artigos concretos para a stack,
   formatados como gates verificáveis (não como conselhos):

```markdown
# Constitutional Rules — Node.js + TypeScript

## Article I — Test-First Imperative (NON-NEGOTIABLE)
Before writing implementation code:
1. Write failing tests that define the expected behavior
2. Get user confirmation that tests represent intent
3. Confirm tests are RED
4. Only then implement

**Gate:** `npm test` must show ≥1 failing test before implementation starts.

## Article II — No `any` Without Approval
TypeScript `any` types require explicit in-code comment:
`// any: <reason> — approved by <who> on <date>`
Undocumented `any` = blocker in code review.

## Article III — Dependency Boundary
External API calls live only in `src/infrastructure/`.
Services import repositories, not HTTP clients.
**Gate:** `grep -r 'axios\|fetch' src/application/ src/domain/` must return 0 results.

## Article IV — Single Responsibility Gate
Each class/module exports 1 primary public function/class.
If >1, split before proceeding.
```

3. Modificar `cli/src/commands/init.js` — no fluxo de preset, copiar o arquivo
   constitucional correspondente para `.ai/rules/constitutional.md` no projeto alvo

4. Atualizar `cli/templates/settings.json` para incluir, por stack, hooks de verificação
   constitucional no `hooks.PreToolUse`:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "bash .ai/hooks/constitutional-check.sh"
      }]
    }]
  }
}
```

5. Criar `cli/templates/hooks/constitutional-check.sh` que lê `.ai/rules/constitutional.md`
   e imprime lembrete dos gates antes de qualquer Write/Edit

**Como usar (após implantação):**

```bash
axis init --preset node
# Cria .ai/rules/constitutional.md com 8 artigos Node.js
# Configura hook que imprime lembretes antes de Write/Edit

# A cada Edit em arquivos .ts, o hook imprime:
# ⚠ Constitutional check:
#   Article I: Tests written and RED? [y/abort]
#   Article III: No axios/fetch in application/? [y/abort]
```

**Critério de aceite:**
- [ ] `cli/templates/rules/constitutional-node.md` com ≥5 artigos verificáveis
- [ ] `cli/templates/rules/constitutional-python.md` com ≥5 artigos verificáveis
- [ ] `cli/templates/rules/constitutional-go.md` com ≥5 artigos verificáveis
- [ ] `init.js` copia o arquivo correto baseado no preset
- [ ] `constitutional-check.sh` imprime gates antes de Write/Edit
- [ ] `validate-axis.sh` passa

---

### F11 — CANVAS REASONS enriquecido (dimensões T e C)

**Gap fechado:** O canvas REASONS tem 7 dimensões (R/E/A/S₁/O/N/S₂). GitHub Spec Kit gera
artefatos mais ricos: data-model.md, API contracts, test scenarios com Given/When/Then,
research.md. O CANVAS pode absorver isso sem aumentar a página — adicionando 2 novas dimensões
ou expandindo as existentes.

**Proposta:** Adicionar 2 dimensões ao canvas, tornando-o REASONS**TC**:

| Nova  | Dimensão       | Preenche            | Propósito                                                            |
| ----- | -------------- | ------------------- | -------------------------------------------------------------------- |
| **T** | Test Scenarios | `story-decompose`   | Given/When/Then obrigatório por AC, incluindo cenários de falha      |
| **C** | Contracts      | `abstraction-first` | Interfaces entre componentes (input/output types, pré/pós-condições) |

**Como implementar:**

1. Editar `.ai/skills/axis-bootstrap/references/CANVAS-REASONS.md`:
   - Adicionar **T** e **C** à tabela das dimensões
   - Adicionar seções ao template do canvas com exemplos concretos

2. Editar `cli/templates/CANVAS.md` (template distribuído pelo CLI)

3. Executar `bash scripts/sync-cli-templates.sh`

**Adição ao template do canvas:**

```markdown
## T — Test Scenarios
| #   | Given             | When           | Then                             | Type       |
| --- | ----------------- | -------------- | -------------------------------- | ---------- |
| 1   | <estado inicial>  | <ação do ator> | <resultado esperado com números> | happy path |
| 2   | <estado inválido> | <ação>         | <erro com código>                | failure    |
| 3   | …                 | …              | …                                | edge case  |

**Minimum:** 1 happy path + 1 failure + 1 edge case por story.
**Gate:** nenhuma implementação inicia sem esta tabela preenchida.

## C — Contracts
```typescript
// <ComponentA> → <ComponentB>
interface <OperationInput> {
  <field>: <type>; // obrigatório porque <razão>
}

interface <OperationOutput> {
  <field>: <type>;
}

// Pré-condição: <o que deve ser verdade antes da chamada>
// Pós-condição: <o que é garantido após sucesso>
// Invariante: <o que nunca muda>
```
```

**Critério de aceite:**
- [ ] `CANVAS-REASONS.md` contém dimensões T e C na tabela e no template
- [ ] `cli/templates/CANVAS.md` sincronizado
- [ ] `validate-axis.sh` passa (sync OK)
- [ ] Canvas de exemplo no PHASE-6-EXAMPLE.md atualizado com T e C preenchidos

---

## Sprint 4 — Automação e workflow

### F12 — skill `axis-specify` (feature scaffolding, skill-driven)

**Gap fechado:** GitHub Spec Kit automatiza setup inicial de uma feature com
`/speckit.specify`: cria branch, cria pasta de spec, popula template. AXIS exige
isso manualmente.

**Decisão arquitetural (2026-05-26):** *não* virar comando CLI (`axis specify`)
porque criaria dependência permanente do CLI no projeto bootstrapado, violando a
Active Decision "AXIS is one-shot". Em vez disso, vira uma **skill auto-contida**
que o agente carrega quando o usuário diz "nova feature X".

**Como implementar:**

1. Criar `.ai/skills/axis-specify/SKILL.md` (≤ 60 linhas) com frontmatter:
   ```yaml
   name: axis-specify
   description: Inicializa pasta de spec + branch para uma nova feature greenfield.
   trigger: "nova feature", "specify", "comece uma spec", "inicializar feature"
   ```

2. Pipeline da skill (executado pelo agente via Bash/Write):
   ```
   1. Sanitiza feature-name → slug (lowercase, hífens)
   2. Detecta brownfield vs greenfield:
      - Se brownfield (≥2 módulos afetados / muda contrato público) → delega axis-delta
      - Se greenfield → continua aqui
   3. (Opcional, se git repo) git checkout -b feat/<slug>
   4. mkdir .ai/specs/<slug>/
   5. Write .ai/specs/<slug>/canvas.md (template CANVAS-REASONSTC populado com nome)
   6. Write .ai/specs/<slug>/tasks.md (esqueleto com ## Tasks)
   7. git add .ai/specs/<slug>/
   8. Reporta: "Canvas em .ai/specs/<slug>/canvas.md — próximo passo: preencher dimensão R"
   ```

3. Criar `.ai/skills/axis-specify/references/SPEC-FOLDER-LAYOUT.md` descrevendo
   estrutura de `.ai/specs/<slug>/` e quando aborta (branch existe, slug colide).

4. Registrar `axis-specify` no `INSTRUCTIONS.md` skill table com triggers.

5. Mirror para `cli/templates/skills/axis-specify/` via `sync-cli-templates.sh`
   (o bootstrap copia a skill no projeto — depois disso, projeto fica independente).

**Como usar (após bootstrap, sem CLI):**

```text
Usuário: "nova feature: rate-limit no endpoint de auth"

Agente: → detecta greenfield (auth é módulo novo? ou brownfield?)
        → se brownfield, carrega axis-delta
        → se greenfield, carrega axis-specify e executa pipeline acima
        → reporta próximo passo
```

**Critério de aceite:**
- [ ] `axis-specify/SKILL.md` existe, ≤ 60 linhas, frontmatter válido
- [ ] Pipeline cria `.ai/specs/<slug>/` com `canvas.md` (template REASONSTC) e `tasks.md`
- [ ] Branch é criado quando há git repo, com flag implícita para skip em monorepos
- [ ] Slug sanitizado (espaços → hífens, lowercase, sem chars especiais)
- [ ] Slug colidindo com pasta existente → aborta com mensagem clara
- [ ] **Zero menção a comandos `axis <x>` no SKILL.md** (verificação manual)
- [ ] `INSTRUCTIONS.md` skill table inclui `axis-specify` com triggers
- [ ] Mirror em `cli/templates/skills/axis-specify/` após sync

---

### F13 — Fase Adversarial (Challenger Agents)

**Gap fechado:** BMAD party-mode mostrou que colocar PM, Architect e Dev para *discordar*
produz melhores decisões do que workers paralelos que apenas reportam. AXIS sub-agentes
são Discoverers (paralelos, read-only) e Specialists (especialistas do projeto). Falta um
passo onde o output do SPDD é desafiado antes de virar código.

**Proposta:** Adicionar Fase 1.8 no PLANNER.md — após o canvas REASONS ser preenchido
(Phase 1.5) e antes do Spec Layer (Phase 2), disparar 2-3 "challenger agents" cujo papel
explícito é encontrar falhas.

**Como implementar:**

1. Criar `agents/challengers/` dentro do skill bundle:
   - `security-challenger.md` — procura injection, auth gaps, data exposure no canvas
   - `simplicity-challenger.md` — procura overengineering, abstrações desnecessárias, fases que poderiam ser puladas
   - `scope-challenger.md` — procura features implícitas, MVP scope creep, DoD muito vago

2. Cada challenger recebe o canvas preenchido e responde com:
   ```
   ## Problemas encontrados
   - [CRÍTICO] <problema> — Seção afetada: <R|E|A|S₁|O|N|S₂|T|C>
   - [ALERTA] <problema>
   
   ## Perguntas não respondidas pelo canvas
   - <pergunta>
   
   ## O que aprovei (não alterar)
   - <lista>
   ```

3. Adicionar Fase 1.8 ao `PLANNER.md`:

```markdown
## Phase 1.8 — Adversarial Challenge *(after canvas, before spec)*

Dispatch security-challenger, simplicity-challenger, scope-challenger in parallel.
Each receives the filled REASONS canvas and returns critique.

Exit gate:
> Present consolidated critique. For each CRÍTICO: resolve or explicitly accept-and-document.
> For each ALERTA: resolve or mark as accepted risk in S₂.
> Advance only after user confirms: "Canvas is final."
```

4. Instalar challengers via `axis init` (mesma lógica dos discoverers — copia para `.claude/agents/`)

**Como usar:**

```bash
# Automático — após canvas ser preenchido, PLANNER.md dispara os challengers:

# security-challenger retorna:
# [CRÍTICO] Seção C não define rate limit no contrato de AuthService → S₂ omite invariante
# [ALERTA] Seção T não tem cenário de ataque (brute force, token replay)

# simplicity-challenger retorna:
# [ALERTA] Componente TokenBlacklist pode ser substituído por short-lived JWTs — elimina Redis
# [APROVEI] Separação AuthService ↔ UserService (boundary correto)

# Usuário decide: aceitar críticas ou corrigir canvas antes de implementar
```

**Critério de aceite:**
- [ ] 3 arquivos de challenger em `agents/challengers/` com formato de saída padronizado
- [ ] Fase 1.8 descrita em `PLANNER.md` com gate explícito
- [ ] `axis init` copia challengers para `.claude/agents/` (junto com discoverers)
- [ ] `PHASE-1-DISCOVERY.md` atualizado para referenciar Fase 1.8

---

### F4C — axis-rebootstrap skill (Deferred → Sprint 4)

**Contexto:** Já existe `axis init --rebootstrap` que instala o skill. O skill em si
(`axis-rebootstrap`) existe em `.ai/skills/axis-rebootstrap/` mas precisa ser completado.

**Gap preenchido:** Permite que projetos já bootstrapped atualizem para nova versão do AXIS
sem perder conteúdo de domínio (rules, skills, STATE, CONVENTIONS).

**Como implementar:**

1. Completar `.ai/skills/axis-rebootstrap/references/` com os 5 planos de fase:
   - `PHASE-1-BACKUP.md` ✓ (já existe)
   - `PHASE-2-DIFF.md` ✓ (já existe)
   - `PHASE-3-APPLY.md` ✓ (já existe)
   - `PHASE-4-CONSOLIDATE.md` ✓ (já existe)
   - `PHASE-5-VALIDATE.md` ✓ (já existe)

2. Adicionar `.axis-version` ao projeto bootstrapped durante `axis init`
   (arquivo com `2.0.0` na raiz do `.ai/`) para o rebootstrap saber de qual versão migrar

3. Adicionar `axis rebootstrap` como comando no CLI (atualmente só existe como `--rebootstrap` flag)

**Critério de aceite:**
- [ ] `axis rebootstrap` funciona como comando standalone
- [ ] `.axis-version` é criado durante `axis init`
- [ ] PHASE-3-APPLY.md descreve merge strategy (domain content preservado, harness substituído)

---

## Sprint 5 — Flexibilidade e comunidade

### F14 — Schema de workflow leve (phase skipping declarativo)

**Gap fechado:** OpenSpec permite que times definam seu próprio grafo de dependência entre
artefatos. O AXIS tem fases fixas. A versão leve (sem a complexidade do schema system do
OpenSpec) é permitir que times *pule fases opcionalmente com declaração explícita*.

**Proposta:** Adicionar `axis.config.json` no projeto bootstrapped que declara fases opcionais:

```json
{
  "phases": {
    "spdd": "required",
    "adversarial": "optional",
    "delta": "required-for-brownfield"
  },
  "artifacts": {
    "canvas": "required",
    "tasks": "required",
    "contracts": "optional"
  }
}
```

**Como usar:**

```bash
# Time que trabalha com TDD estrito e não quer adversarial:
# axis.config.json → "adversarial": "skip"

# Fase é pulada automaticamente, sem precisar modificar PLANNER.md
# PLANNER.md lê o config e ajusta o fluxo
```

**Critério de aceite:**
- [ ] `axis.config.json` é gerado durante `axis init` com defaults do preset
- [ ] PLANNER.md consulta o config antes de cada fase opcional
- [ ] `axis doctor` valida o config contra schema esperado

---

### F15 — Documentação pública e tutoriais

**Gap fechado:** GitHub Spec Kit tem site dedicado, vídeos, walkthroughs, contribuidores.
O AXIS tem README.md e FRAMEWORK.md — suficiente para quem já chegou no repo, insuficiente
para discovery orgânico.

**Entregas:**
1. `docs/` com guias separados por papel (dev individual, tech lead, time)
2. Tutorial "Do zero ao canvas em 10 minutos" (texto + comandos executáveis)
3. Tutorial "Migrando de CLAUDE.md para AXIS" (caso de uso mais comum)
4. Tutorial "Usando AXIS em projeto existente" (audit + rebootstrap)
5. Comparação honesta com BMAD/OpenSpec/Spec Kit (`docs/comparison.md`)
6. GitHub Pages via `docs/` folder

**Critério de aceite:**
- [ ] `docs/quickstart.md` — "do zero ao canvas" executável em 10 min
- [ ] `docs/migrate-from-claude.md` — migration guide
- [ ] `docs/brownfield.md` — axis-delta workflow completo
- [ ] GitHub Pages habilitado

---

## Dependências entre features

```
F10 (constitutional rules)
  └── depende de: init.js (já existe) — BLOQUEANTE ZERO

F9 (axis-delta)  
  └── depende de: F11 (CANVAS enriquecido) — ideal ter T+C antes do delta template
  └── independente de F10, F12, F13

F11 (CANVAS T+C)
  └── depende de: CANVAS-REASONS.md (já existe) — BLOQUEANTE ZERO

F12 (axis specify)
  └── depende de: F11 (canvas template enriquecido) — para criar canvas.md correto
  └── independente de F9, F10, F13

F13 (adversarial)
  └── depende de: F11 (canvas preenchido como input dos challengers)
  └── independente de F9, F10, F12

F4C (rebootstrap)
  └── independente de todos

F14 (schema flexível)
  └── depende de: F13 (para que adversarial seja a primeira fase "opcionável")

F15 (docs)
  └── depende de: F9+F10+F11+F12+F13 (para documentar o que foi construído)
```

**Ordem recomendada dentro do Sprint 3:**
```
F11 → F10 → F9
(CANVAS enriquecido primeiro — F10 e F9 dependem de ter o template correto)
```

---

## Resumo de esforço vs. impacto

| Feature                    | Esforço                        | Impacto           | Sprint |
| -------------------------- | ------------------------------ | ----------------- | ------ |
| F11 — CANVAS T+C           | Baixo (editar 2 md + sync)     | Médio-alto        | 3      |
| F10 — Constitutional rules | Baixo (novos md + init.js)     | Alto              | 3      |
| F9 — axis-delta skill      | Médio (novo skill + CLI)       | Alto              | 3      |
| F12 — axis specify         | Médio (novo comando CLI)       | Médio             | 4      |
| F13 — Adversarial phase    | Médio (3 agents + PLANNER.md)  | Alto              | 4      |
| F4C — rebootstrap          | Médio (já parcialmente pronto) | Médio             | 4      |
| F14 — Schema flexível      | Alto (config + PLANNER lógica) | Baixo             | 5      |
| F15 — Documentação         | Alto (escrita + site)          | Alto (comunidade) | 5      |

**Quick wins (podem ser feitos em 1-2 horas cada):**
- F11: editar CANVAS-REASONS.md + CANVAS.md + sync — 1 hora
- F10: criar 3 arquivos de regras constitucionais + modificar init.js — 2 horas

---

## Verificação e qualidade

Após cada feature implementada, executar obrigatoriamente:

```bash
bash scripts/sync-cli-templates.sh   # sincroniza .ai/skills/ → cli/templates/
bash scripts/validate-axis.sh        # 4 gates: tamanhos + sync + symlinks
```

Gates adicionais para cada feature:
- **F9, F10, F13:** novos SKILL.md devem ter ≤ 60 linhas
- **F11:** CANVAS.md no CLI deve ser o mirror exato do CANVAS-REASONS.md
- **F12:** `axis specify test-feature` em dir temporário deve criar estrutura sem erros
- **F13:** challengers devem ser read-only (sem Write/Edit no toolset)

---

## Referências dos docs lidos

| Framework       | Doc interno lido                       | Linhas | Key insight extraído                                                                   |
| --------------- | -------------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| GitHub Spec Kit | `spec-driven.md`                       | 412    | Constitutional Foundation, 9 artigos, Phase -1 gates, template `[NEEDS CLARIFICATION]` |
| OpenSpec        | `docs/concepts.md`                     | 765    | Delta specs ADDED/MODIFIED/REMOVED, schema system, archive process                     |
| BMAD            | `docs/explanation/project-context.md`  | 157    | project-context.md auto-carregado por todos os workflows                               |
| BMAD            | `docs/explanation/party-mode.md`       | 59     | Debate adversarial PM/Arch/Dev/QA em uma conversa                                      |
| AXIS            | `.ai/skills/axis-bootstrap/PLANNER.md` | 80+    | Fase 1.5 SPDD, decision tree 2-of-3, REASONS canvas                                    |
| AXIS            | `scripts/validate-axis.sh`             | 60+    | 4 gates de qualidade automatizados                                                     |
