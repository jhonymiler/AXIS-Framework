# AXIS — Plano de Remodelação (Sprint 1-4)

> **Origem:** análise empírica documentada em `/projetos/IA/memorias/cortex/AXIS_EVALUATION.md` + `/projetos/IA/memorias/cortex/AXIS_TECHNIQUES.md`, conversada em sessão de planejamento e aprovada pelo usuário em 2026-05-26.
>
> **Premissa central:** *AXIS é one-shot.* O CLI scaffolda · o agente (Opus 4.7+) gera o conteúdo · AXIS sai de cena · o projeto se auto-mantém via [agente lendo skills/rules] + [hooks no harness do próprio projeto].
>
> **Pattern arquitetural-chave:** sub-agentes em duas tiers — **Discoverers** genéricos transientes (Phase 1, paralelos) → **Specialists** project-bound persistentes com knowledge embutido (Phase 4.5).

---

## Índice das 7 Frentes do Plano

| Frente | Foco | Status |
|---|---|---|
| **F1** | Segurança/UX do CLI (não-destrutivo por default) | ✅ **100% em main** |
| **F2** | Posicionamento e comunicação | ✅ **100% em main** |
| **F3** | Fortalecer a meta-skill (onde está o produto real) | 🟡 **~85% em main** — falta F3.4 (Phase 6 example) |
| **F4** | Ferramental: 4A (CLI one-shot) + 4B (kit auto-manutenção) + 4C (re-bootstrap) | 🟡 **F4A 100% em main**; **F4B e F4C pendentes (Sprint 3-4)** |
| **F5** | Qualidade e polimento | ⚪ **pendente — Sprint 4** |
| **F6** | Remoções e consolidações | ⚪ **pendente — Sprint 4** |
| **F7** | Questões abertas (monorepo, multi-IDE hooks, plugins) | ⚪ **adiado para v2.x** |
| **F8** | Sub-agentes especializados (Discoverers + Specialists) | 🟡 **F8A+B em main**; **F8C (Phase 4.5) pendente — Sprint 3** |

---

## Sprint 1 — ✅ COMPLETO (em main)

### F1 — Segurança e UX do CLI ✅

| Item | Commit | Resultado |
|---|---|---|
| **F1.1** `--preset` não-destrutivo | `fa1efc9` | `presetBootstrap()` chama `detectProject()`; ramifica: **abort** (sem flag) · **--backup** (`.axis-bak-<ISO>`) · **--force** (warning loud) · **--dry-run** (lista plano sem escrever) |
| **F1.2** Detector explícito | `fa1efc9` | Estado da detecção printado antes de qualquer write |
| **F1.3** STATE.md template neutro | `fa1efc9` | Removidas todas as referências ao AXIS; estrutura + placeholder comments + `{{PROJECT_NAME}}` |
| **F1.4** Guard de Windows | `fa1efc9` | `process.platform === 'win32'` pula `bash`; hint para WSL/`mklink /D` |
| **F2.4** Warning greenfield em --preset | `fa1efc9` | `log.warn` no topo do preset path |

### F2 — Posicionamento e Comunicação ✅

| Item | Commit | Escopo |
|---|---|---|
| **F2.1** Rename "Memory Layer" → "Continuity Layer" (BREAKING) | `e15f576` | 17 arquivos: FRAMEWORK, READMEs, INSTRUCTIONS, CONVENTIONS, bundle axis-bootstrap; `PHASE-4-MEMORY.md` → `PHASE-4-CONTINUITY.md` com nota histórica; doctor.js, validate-axis.sh, skill description |
| **F2.2** README "How AXIS Actually Works" | `0c0e995` | Bloco explícito: CLI = scaffold em segundos, agente = conteúdo em 20-40min, AXIS = sai após bootstrap |
| **F2.3** SPDD consolidation | `3a5eaed` | 5 subcomandos print-only consolidados em `axis spdd guide [step]`; legacy names como aliases |

### Sprint 1 — extras

- **STATE.md curado** (`85ff800`): 99 → 46 linhas, com novas Active Decisions
- **6 branches deletadas** (4 mergeadas Sprint 1 + 2 obsoletas pré-existentes)
- `pr-1` permanece intocada (fora deste plano)

---

## Sprint 2 — 🟡 ~90% COMPLETO em main

### ✅ Concluído em main

#### F8A — 5 Discoverer sub-agents (commit `4cf7e08`)

Arquivos `.md` formato Claude Code agent em `.ai/skills/axis-bootstrap/agents/discoverers/`:

| Agent | Função |
|---|---|
| `business-rules-extractor.md` | Validações, invariantes, policies |
| `flow-extractor.md` | HTTP/RPC, jobs, eventos, CLI |
| `architecture-mapper.md` | Layers, módulos, dependency direction |
| `stack-profiler.md` | Language, framework, build, test, lint |
| `conventions-detector.md` | Naming, errors, logging, tests, commits |

Cada um: tools read-only (Read/Grep/Glob + Bash whitelist), anti-fabrication clause `[AMBÍGUO — needs human input]`, tool budget self-bounded, output schema markdown estruturado.

#### F8B — Orquestração paralela em Phase 1 (commit `4cf7e08`)

- `PHASE-1-DISCOVERY.md` Step 0: install (`cp` para `.claude/agents/`) + dispatch dos 5 em paralelo + consolida reports
- Ambiguidades consolidadas dirigem a entrevista humana
- Fallback documentado para IDEs sem subagent nativo
- `PLANNER.md` e `SKILL.md` referenciam discoverers
- `validate-axis.sh`: sync-check dos 5 discoverers

#### F3 polish (commit `c98c435`)

| Item | Mudança |
|---|---|
| **F3.1** | PHASE-3 Step 1.5 audit de orphan scripts antes de adicionar hooks; tabela filename→hook; critério "0 órfãos ao fim da Phase 3" |
| **F3.2** | PLANNER Phase 1.5 substitui trigger fuzzy por decision tree 2-de-3 (greenfield? >1 arquivo? user pediu Canvas?) |
| **F3.3** | PHASE-2-SPEC sub-protocolo de migração: archive→extract→regenerate→merge→diff |
| **F3.5** | SKILL.md frontmatter ganha `version: 1.0.0` + trigger terms estendidos |

#### F4A — CLI one-shot tools (commit `5d7b874`)

**F4A.1 — `axis hooks install`** (`cli/src/commands/hooks.js`, novo)
- Detecta `scripts/*.sh`, mapeia por filename → hook (patterns CONSERVADORES — só nomes canônicos)
- Plano interativo com `+ wire` / `· already wired` / `! skip`
- Backup automático `.claude/settings.json.axis-bak-<ISO>` antes de modificar
- Suporta `--dry-run`
- Registrado em `cli/src/index.js`

**F4A.2 — `axis doctor` expandido** (`cli/src/commands/doctor.js`)
- **Cross-link validator** com dual-context resolution (file dir + repo root) e skip de fenced code blocks (`​` ​`​` ​`​`)
- **Token approximations** (chars/4 proxy): INSTRUCTIONS ≤ 2500, SKILL ≤ 1200
- **Skill description uniqueness**: detecta routing ambiguity
- **Script ↔ settings.json coherence** (WARN advisory — não FAIL)
- Novo campo `warn` em checks: distinção entre falha (EXIT=1) e aviso (EXIT=0)

**Bug real encontrado e corrigido pelo novo validator:** 4 broken links em PLANNER.md (`../../skill-name/` corrigido para `../skill-name/`).

**Resultado em recursividade:** `axis doctor .` no próprio repo AXIS = **28 passed, 1 warning advisory, 0 failures, EXIT=0** ✅

### 🟡 Pendente em Sprint 2

| Item | Estado | Esforço estimado |
|---|---|---|
| **F3.4** Phase 6 example walkthrough | não iniciado | `references/PHASE-6-EXAMPLE.md` — walkthrough concreto: Canvas → código → review → STATE update. ~150 linhas. |

---

## Sprint 3 — ⚪ PENDENTE

> **Objetivo:** entregar a tese central — projeto bootstrappado tem CAPACIDADE de auto-manutenção via [skill guardian + rules trigger-based + hooks PostToolUse] **sem nunca chamar `axis` novamente**.

### F3.6 — Phase 3.5 "Bootstrap self-maintenance kit" (obrigatória no PLANNER)

Adicionar nova phase entre Phase 3 (Harness) e Phase 4 (Continuity). Materializa o F4B abaixo. Sem isso a tese "doc se mantém sozinha após AXIS sair" não se sustenta.

Atualizar:
- `PLANNER.md` — Phase 3.5 com loads, input, geração dos 8 artefatos, exit gate
- `SKILL.md` Summary Flow table — incluir Phase 3.5
- `references/PHASE-3-5-SELF-MAINTENANCE.md` (novo) — detalhamento do kit

### F4B — Kit de auto-manutenção bootstrappado (8 artefatos)

> Zero dependência do `axis` CLI a partir do bootstrap. Operação por: [agente do usuário lendo .md] + [harness Claude Code executando hooks].

| # | Artefato | Local | Quem operacionaliza |
|---|---|---|---|
| 4B.1 | Skill **`documentation-guardian`** | `cli/templates/skills/documentation-guardian.md` → bootstrap copia para `.ai/skills/documentation-guardian/SKILL.md` + `references/CHECKS.md` | Agente carrega quando suspeita de drift; instrui invocação de specialists; orienta re-extração via discoverer apenas em caso de drift extremo |
| 4B.2 | Rule `documentation-sync.md` | `cli/templates/rules/documentation-sync.md` → `.ai/rules/`; `applyTo: "src/**"` | Always-on quando editando código — "verifique tabela INSTRUCTIONS reflete o novo módulo; consulte `<project>-business-rules-keeper`" |
| 4B.3 | Rule `skill-emergence.md` | mesmo padrão | Triggera ao adicionar módulo novo sem skill correspondente — propõe criação |
| 4B.4 | Rule `state-curation.md` | mesmo padrão | Triggera no Stop hook — "se >50 linhas mudaram, propor update STATE Active Decisions" |
| 4B.5 | Hook `post-spec-edit.sh` | `cli/templates/hooks/post-spec-edit.sh` (já existe? sim) → wireado em settings.json matcher `Edit(.ai/**)` | Roda automático após edits em `.ai/` — chama `axis doctor --quick` no projeto |
| 4B.6 | Hook `post-code-change.sh` | novo `cli/templates/hooks/post-code-change.sh` → wireado em settings.json matcher `Edit(src/**)` | Roda automático após edits em `src/` — flagueia drift potencial entre estrutura e INSTRUCTIONS table |
| 4B.7 | Script `scripts/check-doc-drift.sh` | novo `cli/templates/scripts-self-maint/check-doc-drift.sh` | Agente roda quando rule 4B.2 trigga; compara `find src/` vs tabela parseada de INSTRUCTIONS.md |
| 4B.8 | Script `scripts/audit-docs.sh` | novo `cli/templates/scripts-self-maint/audit-docs.sh` | K-trial cold start local — 3 simulações: descrever via INSTRUCTIONS, achar skill via description, retomar via STATE |

Após escrita: atualizar `sync-cli-templates.sh` (novos dirs) + `validate-axis.sh` (novos check items) + `init.js` (copia kit + roda `axis hooks install` automaticamente para os 2 hooks novos).

### F8C — Transformação Discoverer → Specialist (Phase 4.5)

> Heurística: discoverer = ferramenta transiente; specialist = ativo persistente com knowledge embutido. Auto-transformação para 3 com mapeamento claro; opt-in para conventions; stack-profiler **não vira specialist**.

**Phase 4.5 nova no PLANNER** (entre Memory/Continuity e Validation):

1. Lê output dos 5 discoverers (em buffer da Phase 1, armazenado em `.ai/.discovery/` durante o bootstrap)
2. Para cada um cujo output justifica especialização, gera template Specialist com placeholders interpolados
3. Materializa em `.claude/agents/<project>-<role>-keeper.md`:
   - `<project>-business-rules-keeper`
   - `<project>-flow-architect`
   - `<project>-architecture-guardian`
   - (opt-in) `<project>-conventions-keeper`
4. Specialist system prompt = role definition + table extraída embedded inline (self-contained)

**Templates a criar em** `cli/templates/bootstrap-skill/agents/specialists/` (4 templates com `{{PROJECT_NAME}}`, `{{KNOWLEDGE_TABLE}}`, `{{EXTRACTED_AT}}` placeholders).

**Update** em `documentation-guardian` skill (F4B.1) para referenciar specialists durante operação normal + fallback para re-rodar discoverer.

**Update** em `PHASE-4-CONTINUITY.md` / `PHASE-5-VALIDATION.md`: Phase 4.5 step + gate criteria.

---

## Sprint 4 — ⚪ PENDENTE

### F4C — Skill `axis-rebootstrap` (única coisa que AXIS faz após bootstrap inicial)

> Disparada **apenas** quando user quer re-aplicar versão nova do AXIS num projeto que já tem `.ai/`. Skill SIBLING de `axis-bootstrap`.

| # | Item | Arquivos |
|---|---|---|
| 4C.1 | Skill `axis-rebootstrap` | `.ai/skills/axis-rebootstrap/SKILL.md` + `PLANNER.md` + `references/PHASE-{1..5}.md`. 5 phases: **(1)** Backup completo para `.ai/.archive/<ISO>/`; **(2)** Diff entre `.ai/.axis-version` antigo e versão atual do CLI; **(3)** Aplica estrutura nova (templates atualizados via `sync-cli-templates.sh` espelhado); **(4)** Consolida: agente lê backup e re-integra conteúdo de domínio (skills custom, rules, STATE) no novo formato; **(5)** Validation gate (doctor + diff humano-revisável) |
| 4C.2 | CLI: `axis init --rebootstrap` | Modifica `cli/src/commands/init.js`. Apenas detecta o caso (`.ai/INSTRUCTIONS.md` + `.ai/.axis-version` pré-existentes) e instala a skill, não executa lógica |
| 4C.3 | `.ai/.axis-version` | Bootstrap atual cria; rebootstrap lê para decidir migration path |
| 4C.4 | Mirror em CLI templates | `sync-cli-templates.sh` ampliado para `cli/templates/rebootstrap-skill/` |

### F5 — Qualidade e Polimento (Sprint 4)

| # | Item | Esforço |
|---|---|---|
| **5.1** | Doctor: já tem links + tokens + uniqueness + coherence. Adicionar `--strict` que falha em warnings, **absorve `dedupe`** | M |
| **5.2** | Frontmatter enriquecido: `applyTo: <glob>` + `trigger: always\|on-edit\|on-mention` em rules; `type: process\|reference` em skills (limite 60 vs 120 linhas conforme) | M |
| **5.3** | Telemetria automática: hooks padrão (post-spec-edit, post-code-change, session-start, stop) chamam `axis log` com `hook:fired:<name>`, `skill:loaded:<name>` | M |
| **5.4** | Banner enxuto: ASCII art só em `axis init` (1ª execução em projeto novo); outros comandos linha 1 mínima | S |
| **5.5** | Suite de testes do CLI (`node --test` ou `vitest`) com fixtures `/tmp/axis-test-projects/<name>/` | L |
| **5.6** | Lazy creation: não criar `docs/canvases/done/` vazio no init | S |
| **5.7** | Limites configuráveis: `.ai/axis.config.json` opcional permite override de tamanhos | M |

### F6 — Remoções e Consolidações (Sprint 4)

| # | Remoção / Consolidação |
|---|---|
| **6.1** | `axis dedupe` standalone → absorvido em `axis doctor --strict` |
| **6.2** | `axis cleanup` standalone → prompt automático no fim do init AI-driven |
| **6.3** | Subcomandos SPDD soltos → já consolidados em F2.3 ✅ |
| **6.4** | Rules genéricas no init (`engineering-discipline`, `context-economy`, `knowledge-verification`) → opt-in via `axis rules add <name>`; default = só `session-start` |

---

## Sprint 4 (continuação) — Testes finais e Release

### Testes finais

Em ordem:

1. **`bash scripts/validate-axis.sh`** — todas as 4 gates verdes (sync de discoverers + specialists)
2. **`node cli/src/index.js doctor .`** — recursividade: 0 failures, warns aceitáveis
3. **Smoke completo:** `axis init --preset python /tmp/axis-fresh-smoke` em dir vazio + verificar:
   - `.ai/` populado com discoverers + skills SPDD + rules + STATE neutro
   - `.claude/agents/` populado com 5 discoverers + (após bootstrap simulado) 3-4 specialists
   - `.claude/settings.json` com hooks do kit auto-manutenção
   - `setup-ide-links.sh` cria symlinks
4. **Rebootstrap smoke:** projeto com `.ai/` antigo → `axis init --rebootstrap` instala skill `axis-rebootstrap` → agente segue 5 phases → diff revisado pelo usuário simulando aceitação
5. **`axis hooks install`** em projeto com `scripts/format-file.sh + validate-bash.sh + run-tests.sh` detectáveis → 3 wirings sugeridos
6. **Recursividade final:** AXIS evaluation sobre AXIS — rodar a meta-skill dentro do próprio repo em modo audit, comparar resultados com plano

### Release

- **Bump de versão:** **2.0.0** (MAJOR per workflow.md — `MAJOR: breaking changes to template format, removed phases, renamed artifacts` — qualifica por causa de `PHASE-4-MEMORY.md` → `PHASE-4-CONTINUITY.md` e rename de pillar conceitual)
- `cli/package.json` → 2.0.0
- Commit `chore(release): bump CLI to v2.0.0`
- GitHub Releases UI → create tag `cli-v2.0.0`
- Release notes auto-geradas + bloco de highlights manual:
  - **Breaking:** rename Memory Layer → Continuity Layer (file rename incluso); SPDD subcommands consolidados (legacy aliases); rules genéricas viram opt-in
  - **Novo:** `axis hooks install`; `axis doctor` expandido (links + tokens + uniqueness + coherence); 5 Discoverer sub-agents; 4 Specialist agents project-bound; skill `axis-rebootstrap`; kit auto-manutenção bootstrappado (1 skill + 3 rules + 2 hooks + 2 scripts); Phase 3.5 self-maintenance + Phase 4.5 specialist transformation
  - **Segurança:** `--preset` não-destrutivo (`--backup` / `--force` / `--dry-run`); Windows guard
- `.github/workflows/publish-cli.yml` dispara em tag create → npm publish com provenance

---

## Filosofia Salva em Memória

Duas memórias persistentes foram criadas durante o planejamento:

- `/home/jhony/.claude/projects/-projetos-IA-AXIS-Framework/memory/axis_philosophy.md` — AXIS é **one-shot**, agente do usuário continua, re-bootstrap é uma skill (não daemon)
- `/home/jhony/.claude/projects/-projetos-IA-AXIS-Framework/memory/axis_subagent_pattern.md` — **Two-tier**: Discoverers transientes (Phase 1) → Specialists persistentes (Phase 4.5)

---

## Estado de branches (snapshot atual)

| Branch | Conteúdo | Status |
|---|---|---|
| `main` | Sprint 1 completo + Sprint 2 (F8A+B, F3.1-3.3+3.5 polish, F4A) merged | ✅ HEAD remoto = `5d7b874` (a confirmar push) |
| `pr-1` | `feat(skill): project-review` — fora deste plano | ⚪ intocada |

**Branches deletadas (já mergeadas via squash):**
- Sprint 1: `feat/defensive-init`, `docs/rename-memory-to-continuity`, `docs/readme-positioning`, `refactor/spdd-consolidation`
- Sprint 2: `feat/sprint2-subagents`, `feat/sprint2-meta-skill-polish`, `feat/sprint2-cli-f4a`
- Obsoletas (pré-plano): `feat/copilot-code-review`, `feat/memory-tiers-presets-dedupe-safeguards`

---

## Roadmap de implementação restante

### Próximo passo imediato

1. **Push F4A** para origin/main
2. **F3.4 — Phase 6 example** (fecha Sprint 2)

### Sprint 3 — Tese central (kit auto-manutenção + Specialists)

**Ordem proposta:**
1. F8C primeiro — templates de 4 Specialists em `cli/templates/bootstrap-skill/agents/specialists/`
2. F4B em sequência:
   - 4B.1 skill `documentation-guardian` (a "cabeça" do kit)
   - 4B.2-4 rules (`documentation-sync`, `skill-emergence`, `state-curation`)
   - 4B.6 hook `post-code-change.sh` + 4B.7-8 scripts (`check-doc-drift.sh`, `audit-docs.sh`)
   - 4B.5 hook `post-spec-edit.sh` (já existe — apenas ajustar)
3. F3.6 — Phase 3.5 no PLANNER ancorando o kit (atualiza SKILL.md table + cria `references/PHASE-3-5-SELF-MAINTENANCE.md`)
4. F8C Phase 4.5 no PLANNER + `references/PHASE-4-5-SPECIALIST.md`
5. Update `init.js` para copiar specialists templates e rodar `axis hooks install` automático para os 2 hooks novos
6. Update `sync-cli-templates.sh` + `validate-axis.sh` para os novos files
7. Validate + commit + merge

### Sprint 4 — Re-bootstrap + Polish + Release

**Ordem proposta:**
1. F4C skill `axis-rebootstrap` (5 phases) + CLI `axis init --rebootstrap` detection + `.ai/.axis-version` file
2. F5 polish: doctor `--strict`, frontmatter `applyTo`/`trigger`/`type`, telemetria automática, banner enxuto, lazy creation, axis.config.json
3. F6 remoções: dedupe→strict, cleanup→init prompt, rules genéricas→opt-in
4. F5.5 suite de testes (`node --test`)
5. Testes finais (smoke completo + rebootstrap simulado + recursividade)
6. Bump 2.0.0 + tag `cli-v2.0.0` + release notes

---

**Data deste snapshot:** 2026-05-26
**Sessão atual:** F4A acabou de cair em `main` (commit `5d7b874`). Próximo: push origin/main, depois F3.4 (Phase 6 example), depois Sprint 3.
