# AXIS — Modelo Conceitual

> Framework harness-first para projetos aumentados por IA.

Este documento é o **mapa mental** do AXIS. Para o roteiro de execução, ver [.ai/skills/axis-bootstrap/SKILL.md](.ai/skills/axis-bootstrap/SKILL.md). Para o quick start, ver [README.md](README.md).

---

## O Problema que Resolve

Equipes que trabalham com agentes de IA enfrentam três falhas recorrentes:

1. **Documentação divergente** entre IDEs — Cursor lê uma versão, Claude Code lê outra, Copilot uma terceira. Em semanas o conteúdo está fora de sincronia.
2. **Comportamento inconsistente** entre sessões e devs — sem hooks e permissões versionados, cada máquina age diferente.
3. **Perda de contexto** entre sessões — decisões, blockers e lições somem quando uma sessão fecha.

A solução combina três conceitos normalmente tratados separados: **Harness Engineering**, **Spec-Driven Development** e **Context Engineering (ACE)**.

---

## Por que Harness-First

A literatura convergia em spec-first (GitHub Spec Kit, Kiro, Tessl). Mas a evidência empírica aponta harness como o bottleneck real:

- LangChain moveu um agente do fora-do-top-30 para top-5 no **Terminal Bench 2.0** mudando apenas o harness — mesmo modelo ([fonte: Augment Code](https://www.augmentcode.com/guides/harness-engineering-ai-coding-agents))
- **ReliabilityBench (Jan 2026)** mostra que pass@1 superestima confiabilidade em 20-40%; arquiteturas mais simples superam complexas sob estresse ([arxiv 2601.06112](https://arxiv.org/abs/2601.06112))
- Operadores relatam que swarms altamente autônomos são frágeis, caros e impossíveis de debugar em produção — padrão dominante é um único agente com acesso determinístico a ferramentas ([MindStudio](https://www.mindstudio.ai/blog/ai-agent-failure-pattern-recognition))

> **Reposicionamento AXIS:** a Spec descreve o que o agente sabe. O Harness define como ele age — independente do que "decide" no momento. A Memory torna o sistema antifrágil ao tempo.

---

## O Modelo: Três Camadas

```
┌─────────────────────────────────────────────────────────┐
│  SPEC LAYER ─ O conhecimento (O QUÊ)                    │
│  • INSTRUCTIONS.md  — contexto geral                    │
│  • skills/          — conhecimento de domínio           │
│  • rules/           — regras de comportamento/código    │
│  • docs/            — referências estáticas             │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  HARNESS LAYER ─ A infraestrutura (COMO o agente age)   │
│  • settings.json    — permissões versionadas            │
│  • hooks            — automação (lint, testes, blocos)  │
│  • sub-agents       — delegação e paralelismo           │
│  • symlinks         — distribuição multi-IDE            │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  MEMORY LAYER ─ A continuidade (O QUE persiste)         │
│  • STATE.md         — estado, blockers, lições          │
│  • CONVENTIONS.md   — como manter a estrutura           │
└─────────────────────────────────────────────────────────┘
```

### Por que três camadas e não duas

A separação **Spec / Harness** já existe na literatura (Anthropic, Red Hat, GitHub Spec Kit). A adição da **Memory Layer** vem da observação prática reforçada pelo paper **ACE — Agentic Context Engineering** ([arxiv 2510.04618](https://arxiv.org/abs/2510.04618)): sem ela, projetos de longa duração regridem a cada sessão. A memória não é um log — é um **playbook evolutivo** que acumula, refina e curada estratégias, prevenindo colapso com atualizações incrementais estruturadas.

### Como as camadas interagem

```
  Início de sessão
       │
       ▼
  [Spec] ────► IA carrega contexto mínimo (~1.500 tokens)
       │
       ▼
  [Memory] ──► IA lê STATE.md para saber onde parou
       │
       ▼
  Trabalho ──► [Harness] aplica hooks, permissões, sub-agents
       │
       ▼
  Mudança ──► Atualiza Spec se padrão mudou; atualiza Memory sempre
       │
       ▼
  Fim de sessão ─► STATE.md curado; loop recomeça mais informado
```

---

## Spec Layer em Detalhe

### Single Source of Truth

Todo conteúdo vive em `.ai/`. Pastas IDE-específicas (`.claude/`, `.cursor/`, `.github/`, `.agents/`) contêm apenas symlinks. **É fisicamente impossível ter divergência.**

```
projeto/
├── .ai/                          ← FONTE ÚNICA
│   ├── INSTRUCTIONS.md
│   ├── skills/
│   ├── rules/
│   └── docs/
├── CLAUDE.md     → .ai/INSTRUCTIONS.md
├── AGENTS.md     → .ai/INSTRUCTIONS.md
├── .claude/{rules,skills}        → ../.ai/{rules,skills}
├── .cursor/{rules,skills}        → ../.ai/{rules,skills}
├── .agents/{rules,skills}        → ../.ai/{rules,skills}
└── .github/
    ├── copilot-instructions.md   → ../.ai/INSTRUCTIONS.md
    ├── instructions/             → ../.ai/rules/
    └── skills/                   → ../.ai/skills/
```

### Progressive Disclosure

Skills carregam em três momentos distintos para minimizar tokens:

| Camada            | Quando carrega    | Conteúdo                              | Tamanho         |
| ----------------- | ----------------- | ------------------------------------- | --------------- |
| **1 — Discovery** | Sempre (startup)  | `name` + `description` do frontmatter | ~3 linhas/skill |
| **2 — Index**     | Quando relevante  | `SKILL.md` completo                   | ~40-60 linhas   |
| **3 — On-demand** | Quando necessário | `references/*.md` específicos         | sob demanda     |

---

## Harness Layer em Detalhe

A spec define o que o agente sabe. O harness define como ele se comporta — independente do que "decide" no momento. **Produção confiável depende mais do harness que do modelo.**

### Cinco subsistemas do harness

1. **Context Harness** — orçamento de tokens, regras de loading/unloading, Progressive Disclosure
2. **Permission Harness** — `settings.json` versionado com allow/deny/ask
3. **Execution Harness** — hooks `PreToolUse`, `PostToolUse`, `Stop` automatizam validação, formatação e testes
4. **Orchestration Harness** — sub-agents (Planner, Generator, Evaluator, Explore) para delegar e paralelizar
5. **Verification Harness** — quality gates + **failure attribution** (cada falha é localizada em planning / execution / response, não apenas registrada como pass/fail)

### Failure Attribution

Inspirado em **AgentProp-Bench** ([arxiv 2604.16706](https://arxiv.org/html/2604.16706)) e **ReliabilityBench**, o AXIS não mede só se o agente passou — localiza onde falhou:

| Categoria de Falha | Causa Raiz                           | Sinal no Harness                                        |
| ------------------ | ------------------------------------ | ------------------------------------------------------- |
| **Planning**       | Spec vaga, objetivo ambíguo          | Hook PreToolUse rejeita tasks sem critério de aceitação |
| **Execution**      | Tool call inválida, permissão negada | Hook PostToolUse registra tentativa + contexto          |
| **Response**       | Output correto mas formato errado    | Gate de validação na Fase 5                             |

### Padrão Anthropic dos Três Agentes

A Anthropic publicou (2026) uma arquitetura que separa três responsabilidades em sub-agents distintos:

- **Planner** decompõe spec em tasks
- **Generator** implementa tasks  
- **Evaluator** valida output contra spec

Esse padrão está embutido no AXIS: `PLANNER.md` orquestra fases, cada `PHASE-N.md` gera artefatos, `PHASE-5-VALIDATION.md` valida.

---

## Memory Layer em Detalhe

### Princípio ACE — Memória como Playbook

O paper **ACE (Agentic Context Engineering)** ([arxiv 2510.04618](https://arxiv.org/abs/2510.04618)) demonstrou +10.6% em benchmarks de agentes e +8.6% em finanças com uma abordagem que trata contexto como **playbooks evolutivos** — não como logs de histórico.

**Implicação para AXIS:**

- `STATE.md` não é um diário; é um playbook curado
- Cada sessão **refina** o STATE — remove o que ficou obsoleto, eleva o que se provou útil
- Specs longas geram ruído; specs testáveis e curtas geram confiabilidade

### Três tipos de memória, três artefatos

| Tipo                       | Artefato         | Atualização                                  |
| -------------------------- | ---------------- | -------------------------------------------- |
| **Estado vivo (playbook)** | `STATE.md`       | A cada sessão — curado, não apenas appendado |
| **Meta**                   | `CONVENTIONS.md` | Quando a estrutura do `.ai/` muda            |

### Session Handoff Protocol

Ao final de cada sessão com mudanças relevantes, o agente:
1. Atualiza `STATE.md` com o que foi feito, o que falta e contexto que se perderia
2. **Remove** do STATE o que está resolvido (curação ativa)
3. Ao iniciar próxima sessão, lê `STATE.md` antes de qualquer outra coisa

---

## Posicionamento Competitivo

| Framework             | Stars (approx.) | Ângulo Principal                    | Lacuna vs AXIS                                                                                    |
| --------------------- | --------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Spec Kit (GitHub)** | ~3k             | Spec-first para coding              | Sem harness; sem memória; contexto esquecido entre sessões (issue #75: "cria ilusão de trabalho") |
| **BMAD-METHOD**       | ~8k             | Agile AI-driven development         | Focado em software; não resolve divergência multi-IDE                                             |
| **SuperClaude**       | ~2k             | Personas especializadas para Claude | Específico para Claude; sem camada de memória estruturada                                         |
| **LangGraph**         | ~45k            | Runtime de grafos de agentes        | Runtime, não infra de projeto; lock-in de framework; complexidade alta                            |
| **CrewAI**            | ~28k            | Multi-agent role-based              | Sem gestão de contexto entre IDEs; SQLite3 limita escala                                          |
| **DSPy**              | ~22k            | Programar (não promptar) LLMs       | Focado em otimização de prompts; não é infra de projeto                                           |
| **AXIS**              | —               | **Harness + Spec + Memory**         | Multi-IDE, stack-agnóstico, 3 camadas integradas                                                  |

**Posição única de AXIS:** é a única estrutura que resolve simultaneamente (1) divergência multi-IDE via symlinks, (2) comportamento não-determinístico via harness versionado, e (3) regressão entre sessões via memory como playbook.

---

## Por que Funciona

### 1. Cada camada é validável independentemente

- Spec: `INSTRUCTIONS.md` tem 100-180 linhas? Skills têm description forte?
- Harness: hooks executam? Permissões fazem sentido? Symlinks resolvem?
- Memory: `STATE.md` tem seções obrigatórias? Foi curado?

### 2. O framework é recursivo

A pasta deste repositório segue **exatamente** o padrão que ensina. Você pode auditá-la com o próprio framework. Se encontrar inconsistência, é um bug no framework — não no documento.

### 3. Universal por design

A camada Spec é puramente sobre conhecimento. A Memory é puramente sobre continuidade. Apenas a Harness tem partes opcionais (hooks de lint não fazem sentido em projeto não-técnico). Ver [.ai/skills/axis-bootstrap/references/UNIVERSAL-MAP.md](.ai/skills/axis-bootstrap/references/UNIVERSAL-MAP.md).

### 4. Spec testável, não verbosa

Spec Kit revelou ([issue #75](https://github.com/github/spec-kit/issues/75)) que specs longas criam ilusão de trabalho. AXIS impõe limites explícitos (INSTRUCTIONS.md ≤ 180 linhas, SKILL.md ≤ 60 linhas) e gates que verificam testabilidade — não comprimento.

---

## Benefícios Mensuráveis

| Métrica                      | Antes (CLAUDE.md monolítico) | Depois (AXIS)                                 |
| ---------------------------- | ---------------------------- | --------------------------------------------- |
| Tokens fixos por sessão      | ~8.000-12.000                | ~800-1.500 + on-demand                        |
| Divergência entre IDEs       | comum em semanas             | impossível (symlinks)                         |
| Tempo de onboarding          | varia por dev                | <10 min com `INSTRUCTIONS.md`                 |
| Comportamento entre máquinas | inconsistente                | idêntico (`settings.json` no git)             |
| Ações destrutivas acidentais | risco real                   | bloqueadas por hook                           |
| Continuidade entre sessões   | manual e frágil              | automática via `STATE.md` curado              |
| Localização de falhas        | pass/fail opaco              | atribuída por camada (planning/exec/response) |

---

## Trade-offs

### Symlinks em Windows

Exigem permissão de administrador ou Developer Mode. **Mitigação:** documentar no README; usar `mklink /D` ou `core.symlinks = true` no Git.

### Curva inicial

Mais conceitos que "colar tudo no CLAUDE.md". **Mitigação:** o `axis-bootstrap` skill conduz a curva — o usuário não precisa entender tudo antes de começar.

### Overhead em projetos triviais

Para um projeto solo de 1-2 dias, a estrutura completa é over-engineering. **Recomendação — adotar quando:**

- 3+ pessoas envolvidas, ou
- Mais de uma IDE/agente em uso, ou
- Projeto com domínio complexo (regras de negócio, integrações, compliance), ou
- Expectativa de duração >2 semanas

### CI/CD com shallow clone

Pipelines podem não resolver symlinks. **Mitigação:** clone completo ou `core.symlinks = true` no pipeline.

---

## Onde Cada Detalhe Está Documentado

| Você quer...                             | Vá para                                                                                                        |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Entender a visão geral                   | este documento                                                                                                 |
| Quick start                              | [README.md](README.md)                                                                                         |
| Bootstrap em 5 minutos                   | [.ai/skills/axis-bootstrap/references/QUICKSTART.md](.ai/skills/axis-bootstrap/references/QUICKSTART.md)       |
| Bootstrapar um projeto                   | [.ai/skills/axis-bootstrap/SKILL.md](.ai/skills/axis-bootstrap/SKILL.md)                                       |
| Aprender padrões (PD, KVC, ACE, k-trial) | [.ai/skills/axis-bootstrap/references/PATTERNS.md](.ai/skills/axis-bootstrap/references/PATTERNS.md)           |
| Ver templates copy-paste                 | [.ai/skills/axis-bootstrap/references/TEMPLATES.md](.ai/skills/axis-bootstrap/references/TEMPLATES.md)         |
| Aplicar a projeto não-técnico            | [.ai/skills/axis-bootstrap/references/UNIVERSAL-MAP.md](.ai/skills/axis-bootstrap/references/UNIVERSAL-MAP.md) |
| Manter o framework                       | [.ai/CONVENTIONS.md](.ai/CONVENTIONS.md)                                                                       |

---

## Conclusão

Documentação para IA não é luxo, é infraestrutura. Mas a infraestrutura tradicional (um arquivo monolítico) regride sob escala. **Spec + Harness + Memory** é a decomposição mínima que sobrevive ao tempo, ao tamanho do time e à variedade de IDEs.

A diferença entre saber disso e ter implementado é o `axis-bootstrap` — uma spec executável que entrega o sistema completo em uma sessão, com harness como prioridade e memória como playbook.
