# AXIS Framework

> CLI + skills para agentes de IA que instalam a infraestrutura `.ai/` que um projeto precisa para trabalhar de forma confiável com ferramentas de IA.

AXIS é um **bootstrap one-shot**. O CLI cria o esqueleto; um agente de IA (Claude Code, Cursor, Copilot, etc.) preenche com conteúdo específico do projeto; depois disso, o projeto se mantém sozinho sem o AXIS.

Três camadas instaladas:

| Camada         | O que é                      | Arquivos principais              |
| -------------- | ---------------------------- | -------------------------------- |
| **Spec**       | O que o projeto é e precisa  | `INSTRUCTIONS.md`, skills, rules |
| **Harness**    | Como o agente se comporta    | `settings.json`, hooks, symlinks |
| **Continuity** | O que persiste entre sessões | `STATE.md`, `CONVENTIONS.md`     |

---

## Como funciona

```text
axis init        ← ~10 segundos
                   cria .ai/ skeleton, settings.json, hooks, symlinks
       ↓
Agente IA roda a skill axis-bootstrap   ← 20-40 minutos
                   lê seu projeto, roda 5 fases com gates,
                   preenche skills/rules/INSTRUCTIONS contextuais
       ↓
axis cleanup     ← remove a meta-skill de bootstrap
                   projeto é autossuficiente a partir daqui
```

Sem um agente de IA seguindo a meta-skill, o `axis init` produz apenas placeholders de template. O agente faz o trabalho real.

---

## Quick Start

```bash
# uso único, sem instalar
npx @axis-bootstrap/cli init

# ou instalar globalmente
npm i -g @axis-bootstrap/cli
axis init
```

O `axis init` detecta o contexto automaticamente e pergunta em PT ou EN pelo `$LANG`:

| Detectado                                | Modo                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| Diretório vazio                          | Quick scaffold — preenche templates interativamente (sem agente de IA)         |
| Projeto existente (`package.json`, etc.) | AI-driven — instala a skill `axis-bootstrap`; você pede ao seu agente que rode |
| Já tem `.ai/`                            | Pergunta antes de sobrescrever                                                 |

Após o init AI-driven concluir:

```bash
axis cleanup     # remove a skill de bootstrap; o projeto mantém todo o resto
```

---

## Comandos

Três comandos cobrem o ciclo de bootstrap:

```bash
axis init        # bootstrap (uma vez) — scaffold + instala a skill axis-bootstrap
axis cleanup     # remove a skill de bootstrap após o agente terminar (uma vez)
axis doctor      # valida tamanhos, symlinks, cross-links, contagem de tokens
```

Para desenvolvimento por feature (após o bootstrap), o AXIS inclui um pipeline SPDD opcional:

```bash
axis spdd canvas <slug>              # cria um Canvas REASONS
axis spdd story|align|design|review  # preenche cada seção com seu agente de IA
```

O resto é situacional:

| Comando                                                | Quando usar                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| `axis init --preset <node\|python\|go\|docs\|minimal>` | Scaffold não-interativo                                       |
| `axis init --rebootstrap`                              | Atualizar um `.ai/` existente para nova versão do AXIS        |
| `axis doctor --strict`                                 | Modo CI — também roda checagem de duplicatas, falha em avisos |
| `axis audit`                                           | Diagnosticar quais camadas AXIS estão faltando                |
| `axis link`                                            | Recriar symlinks de IDE se quebrarem                          |
| `axis hooks install`                                   | Conectar `scripts/*.sh` ao `.claude/settings.json`            |
| `axis state hot / archive`                             | Gestão do STATE.md (usado principalmente pelos hooks)         |
| `axis dedupe`                                          | Escanear `.ai/**/*.md` por parágrafos duplicados              |
| `axis log`                                             | Telemetria (opt-in, gitignored)                               |

Referência completa: [cli/README.md](cli/README.md)

---

## SPDD — o que é e como usar

SPDD (Structured Prompt-Driven Development, [Martin Fowler](https://martinfowler.com/articles/structured-prompt-driven)) é um pipeline para trabalhar em features individuais com IA. O problema que resolve: quando você descreve uma feature e pede ao agente para gerar código, você cai num loop de “regenerate até funcionar” sem contrato compartilhado. O SPDD corrige isso preenchendo um **Canvas REASONS** de uma página *antes* de gerar código, para que você e o agente estejam alinhados no que deve ser construído.

```bash
# iniciar uma nova feature
axis spdd canvas payment-webhook     # cria .ai/canvases/payment-webhook.md

# preencher o canvas colaborativamente com seu agente de IA (cada passo abre o canvas)
axis spdd story    # agente preenche R — história INVEST + critérios Given/When/Then + DoD
axis spdd align    # agente preenche O, N, S₂ — operações, normas, salvaguardas
axis spdd design   # agente preenche E, A, S₁ — entidades, abordagem, estrutura de sistema

# gerar código com seu agente normalmente

axis spdd review   # agente verifica o diff contra o canvas — o código honrou o contrato?
```

O canvas tem 7 dimensões (REASONS):

| | Dimensão | O que captura |
| --- | --- | --- |
| **R** | Requirements | História INVEST + ACs Given/When/Then + Definition of Done |
| **E** | Entities | Objetos de domínio, relacionamentos, responsabilidade única |
| **A** | Approach | Estratégia de alto nível para satisfazer R |
| **S₁** | System structure | Componentes, camadas, árvore de arquivos |
| **O** | Operations | Passos concretos / endpoints / métodos |
| **N** | Norms | Padrões de engenharia (nomenclatura, logging, segurança) |
| **S₂** | Safeguards | Invariantes não-negociáveis (correção, perf, segurança) |

Se o canvas não couber em uma página, a feature é grande demais — volte ao `axis spdd story` e decomponha primeiro.

---

## O que o bootstrap instala

- `INSTRUCTIONS.md` — entry point de IA específico do projeto (100-180 linhas)
- `settings.json` — permissões de ferramentas versionadas + hooks conectados a `.ai/hooks/`
- Skills — `documentation-guardian` (auto-manutenção) + 4 skills SPDD (opt-in)
- Rules — `session-start.md` por padrão; mais 6 disponíveis opt-in
- Hooks — `session-start.sh`, `post-spec-edit.sh`, `stop.sh`, `post-code-change.sh`
- Sub-agentes Discoverer — 5 agentes read-only rodados em paralelo na Fase 1 (arquitetura, regras de negócio, fluxos, stack, convenções)
- Agentes Specialist — 4 agentes específicos do projeto gerados a partir do output dos discoverers (arch guardian, business-rules keeper, flow architect, conventions keeper)
- Symlinks multi-IDE — `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md` todos apontam para `.ai/INSTRUCTIONS.md`
- `STATE.md` — continuidade de sessão curada (não é um log)

---

## Atualizando um projeto existente

Se o AXIS lançar mudanças estruturais e você quiser aplicá-las a um projeto já bootstrappado:

```bash
cd seu-projeto
axis init --rebootstrap
```

Isso instala a skill `axis-rebootstrap`. Seu agente de IA a executa: faz backup do `.ai/`, aplica a nova estrutura e reintegra o conteúdo de domínio (skills, rules, STATE). O agente mostra um diff antes de sobrescrever qualquer coisa.

---

## Quando usar AXIS

- Trabalhar em um projeto com múltiplas sessões onde você precisa de continuidade
- Adotar workflows de IA em uma base de código existente
- Migrar de um `CLAUDE.md` monolítico para uma estrutura modular
- Padronizar infraestrutura de IA em múltiplos projetos do time

## Quando NÃO usar AXIS

- Um script descartável que você vai terminar em uma sessão
- Projeto sem perspectiva de continuidade
- Quando o overhead da estrutura supera o benefício (projeto solo, < 1 semana)

---

## Estrutura do repositório

```text
axis/
├── README.md, README.pt.md
├── FRAMEWORK.md                  ← modelo conceitual
├── setup-ide-links.sh
├── cli/                          ← @axis-bootstrap/cli  (Node.js ≥18)
│   ├── package.json              ← bin: axis, versão: 2.0.0
│   ├── src/commands/             ← init, doctor, audit, spdd, hooks, …
│   └── templates/                ← arquivos instalados pelo `axis init`
│       ├── bootstrap-skill/      ← bundle da skill axis-bootstrap
│       │   └── agents/{discoverers,specialists}/
│       ├── rebootstrap-skill/    ← bundle da skill axis-rebootstrap
│       ├── skills/               ← 4 skills SPDD + documentation-guardian
│       ├── rules/                ← 7 rules (session-start é o padrão)
│       └── hooks/
├── scripts/
│   ├── validate-axis.sh          ← 4 quality gates
│   └── sync-cli-templates.sh     ← propaga .ai/skills/ → cli/templates/
└── .ai/                          ← fonte de verdade deste repo
    ├── INSTRUCTIONS.md
    ├── rules/, hooks/
    └── skills/
        ├── axis-bootstrap/       ← meta-skill de bootstrap (fases + referências)
        ├── axis-rebootstrap/     ← meta-skill de atualização
        ├── abstraction-first/, alignment/
        ├── iterative-review/, story-decompose/
        └── copilot-review/       ← específico do repo AXIS
```

O repo é **self-hosting** — o próprio `.ai/` segue o mesmo padrão que instala em outros projetos.

---

## Trabalhando no AXIS

```bash
bash scripts/validate-axis.sh         # 4 quality gates (tamanhos, sync, symlinks)
bash scripts/sync-cli-templates.sh    # sincroniza .ai/skills/ → cli/templates/ após editar
node cli/src/index.js doctor .        # check de recursividade
node cli/src/index.js init /tmp/smoke # smoke test
```

Convenções, estratégia de branches, formato de commits: [.ai/INSTRUCTIONS.md](.ai/INSTRUCTIONS.md)
