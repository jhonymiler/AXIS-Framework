# Spec-Harness Framework — Instructions

> Você está dentro de um framework auto-aplicável para bootstrapar projetos com infraestrutura completa de IA. Este arquivo é seu entry point.

## Propósito

Este repositório contém uma **spec executável** que bootstrapa qualquer projeto (técnico ou não-técnico) com três camadas validadas:

- **Spec Layer** — INSTRUCTIONS, skills, rules, docs
- **Harness Layer** — settings.json, hooks, sub-agents, symlinks
- **Memory Layer** — STATE.md, RFCs, CONVENTIONS.md

Conceito completo em [FRAMEWORK.md](../FRAMEWORK.md).

## Como Operar

### Cenário 1 — Usuário pede para bootstrapar um projeto

1. Carregue o skill [`spec-harness-bootstrap`](skills/spec-harness-bootstrap/SKILL.md)
2. Siga o `PLANNER.md` em ordem rigorosa
3. **Não pule fases.** Cada fase tem um gate explícito que precisa ser confirmado pelo usuário antes da próxima começar
4. Use os templates de `references/TEMPLATES.md` ao gerar artefatos — não invente formatos

### Cenário 2 — Usuário pede para auditar um projeto existente

1. Carregue o skill `spec-harness-bootstrap`
2. Pule Fase 1 (discovery) se já há `INSTRUCTIONS.md` legível
3. Aplique apenas `PHASE-5-VALIDATION.md` para identificar lacunas
4. Reporte o que está faltando por camada (Spec / Harness / Memory)

### Cenário 3 — Usuário pede para entender o framework

1. Aponte para [FRAMEWORK.md](../FRAMEWORK.md) (modelo conceitual)
2. Aponte para [README.md](../README.md) (quick start)
3. Não execute o bootstrap até que o usuário peça explicitamente

## Princípios Invioláveis

1. **Single Source of Truth** — nunca duplique conteúdo entre IDEs. Use symlinks.
2. **Progressive Disclosure** — carregue apenas o que é necessário para a fase atual.
3. **Gates entre fases** — nenhum artefato de uma fase é gerado antes do gate da fase anterior ter sido aprovado.
4. **Sem fabricação** — se faltar informação, pergunte. Inventar quebra o contrato com o usuário.
5. **Recursividade** — este próprio repositório segue o padrão que ensina. Se você modificar o framework, mantenha a recursividade.

## Skills Disponíveis

| Skill | Quando usar |
| ----- | ----------- |
| [`spec-harness-bootstrap`](skills/spec-harness-bootstrap/SKILL.md) | Bootstrapar novo projeto, migrar de CLAUDE.md monolítico, ou auditar projeto existente para infra de IA |

## Convenções de Manutenção

Como manter este repositório, mapa de symlinks e protocolo de evolução: [CONVENTIONS.md](CONVENTIONS.md).

## Stack

Este repositório é stack-agnóstico — o framework se aplica a qualquer linguagem, ferramenta ou domínio. As ramificações específicas (Node, Python, Go, etc., ou domínios não-técnicos) são tratadas dentro do skill `spec-harness-bootstrap` em `references/UNIVERSAL-MAP.md` e `references/TEMPLATES.md`.
