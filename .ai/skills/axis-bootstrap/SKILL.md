---
name: axis-bootstrap
description: Bootstrap any project — software or non-technical — with a complete Spec + Harness + Memory structure for AI-augmented work. Harness-first: permissions, hooks, and symlinks are configured before prompt optimization. Use when starting a new project from scratch, when adopting AI-augmented workflows in an existing project, when migrating from a monolithic CLAUDE.md to a structured framework, or when auditing a project for missing AI infrastructure. Also handles quick-start path (5 minutes). Trigger terms: bootstrap, inicializar projeto, setup IA, estrutura .ai, CLAUDE.md, AGENTS.md, multi-IDE, skills, harness, spec-driven, progressive disclosure, axis, axis-bootstrap, failure attribution, ACE, memory playbook.
---

# AXIS Bootstrap

Spec executável para bootstrapar projetos com infraestrutura completa de IA. Orquestra a criação das três camadas (Spec, Harness, Memory) em fases sequenciais com gates explícitos. **Harness é a prioridade — não o prompt.**

## Quando Usar

- Iniciando um projeto novo (técnico ou não-técnico) e querendo fundação sólida para colaborar com IA
- Adotando agentes de IA em projeto existente que ainda não tem `.ai/` estruturado
- Migrando de `CLAUDE.md` monolítico para estrutura com Progressive Disclosure
- Auditando projeto para identificar lacunas em Spec/Harness/Memory
- Padronizando múltiplos projetos do time sob a mesma fundação
- Quick start: caminho de 5 minutos (ver `references/QUICKSTART.md`)

## Fluxo Resumido

| Fase | Foco | Gate de saída |
| ---- | ---- | ------------- |
| **1 — Discovery** | Entrevistar para entender o projeto | Resumo confirmado pelo usuário |
| **2 — Spec Layer** | Gerar INSTRUCTIONS, skills, rules, docs | Estrutura `.ai/` populada e validada |
| **3 — Harness Layer** | Configurar settings, hooks, failure attribution, symlinks | Permissões e automações em vigor |
| **4 — Memory Layer** | Criar STATE (playbook), CONVENTIONS, RFC-001 | Memória curada pronta para primeira sessão |
| **5 — Validation** | Quality gates, k-trial smoke test, handoff | Bootstrap entregue |

A orquestração detalhada está em [PLANNER.md](PLANNER.md). O contrato de output final está em [PROMPT-TEMPLATE.md](PROMPT-TEMPLATE.md).

## Princípios de Execução

1. **Harness antes de prompts** — settings.json e hooks têm precedência
2. **Não pule fases** — cada uma depende da validação da anterior
3. **Não fabrique** — se faltar informação, pergunte (Knowledge Verification Chain)
4. **Confirme antes de gerar** — mostre o plano da fase, espere aprovação
5. **Use templates** — não invente formatos; eles vivem em `references/TEMPLATES.md`

## Referências

- [PLANNER.md](PLANNER.md) — orquestração das fases e regras de gate
- [PROMPT-TEMPLATE.md](PROMPT-TEMPLATE.md) — estrutura final esperada do projeto bootstrappado
- [references/QUICKSTART.md](references/QUICKSTART.md) — caminho de 5 minutos
- [references/PHASE-1-DISCOVERY.md](references/PHASE-1-DISCOVERY.md) — entrevista e árvore de decisão
- [references/PHASE-2-SPEC.md](references/PHASE-2-SPEC.md) — geração da Spec Layer
- [references/PHASE-3-HARNESS.md](references/PHASE-3-HARNESS.md) — configuração da Harness Layer + failure attribution
- [references/PHASE-4-MEMORY.md](references/PHASE-4-MEMORY.md) — inicialização da Memory Layer + princípios ACE
- [references/PHASE-5-VALIDATION.md](references/PHASE-5-VALIDATION.md) — quality gates e handoff
- [references/TEMPLATES.md](references/TEMPLATES.md) — todos os templates copy-paste
- [references/PATTERNS.md](references/PATTERNS.md) — padrões técnicos (PD, KVC, ACE, k-trial)
- [references/UNIVERSAL-MAP.md](references/UNIVERSAL-MAP.md) — mapeamento técnico ↔ não-técnico

## Validação Final (resumo)

Antes de declarar bootstrap concluído:

- [ ] Estrutura `.ai/` criada e populada
- [ ] `INSTRUCTIONS.md` entre 100-180 linhas
- [ ] Cada skill tem description >2 linhas e SKILL.md ≤ 60 linhas
- [ ] `settings.json` no git com allow/deny/ask explícitos
- [ ] Hooks executam smoke test (se aplicável)
- [ ] Symlinks resolvem (`ls -la` confirmado)
- [ ] `STATE.md` populado com playbook inicial (não vazio)
- [ ] `CONVENTIONS.md` com mapa de symlinks
- [ ] `RFC-001` documenta a adoção do framework
- [ ] Handoff entregue ao usuário com próximos passos

Checklist completo em [references/PHASE-5-VALIDATION.md](references/PHASE-5-VALIDATION.md).
