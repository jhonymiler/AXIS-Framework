# Bootstrap Planner — Orquestração das Fases

Este documento descreve o **estado de execução** do bootstrap. O agente o consulta como uma máquina de estados: cada fase tem entrada, saída, e um gate antes de avançar.

---

## Princípios de Orquestração

1. **Sequencial e bloqueante** — não inicie a Fase N+1 sem ter confirmado o gate da Fase N com o usuário
2. **Cada fase é atômica** — se algo na Fase 2 indica que a Fase 1 estava errada, **volte** para a Fase 1, não corrija inline
3. **Stateful** — mantenha um registro do que foi decidido em cada fase (escreva em `.ai/docs/STATE.md` no projeto-alvo assim que a Fase 4 criar o arquivo; até lá, mantenha em memória de sessão)
4. **Nunca silencie o usuário** — apresente resumos antes de cada gate; espere aprovação explícita

---

## Estado Inicial

Ao invocar o skill, o agente verifica:

- Existe `.ai/INSTRUCTIONS.md` no projeto-alvo? → **Modo:** auditoria (pular para Fase 5)
- Existe `CLAUDE.md` ou `AGENTS.md` legível? → **Modo:** migração (Fase 1 reduzida — extrair contexto do existente)
- Pasta vazia ou só código? → **Modo:** bootstrap completo (todas as 5 fases)

Pergunte ao usuário qual modo se aplica caso a detecção seja ambígua.

---

## Fase 1 — Discovery

**Carrega:** [references/PHASE-1-DISCOVERY.md](references/PHASE-1-DISCOVERY.md)

**Entrada:** projeto-alvo + intenção do usuário

**Output esperado:**

- Tipo de projeto identificado (software / conteúdo / pesquisa / business / legal / educacional / outro)
- Stack ou ferramentas principais (se aplicável)
- 3-7 domínios candidatos a virar skills
- Restrições críticas (compliance, deadline, time, IDE preferida)
- Critérios de qualidade do output (proof-of-concept vs produção)

**Gate de saída:**

> Apresentar resumo estruturado em ~10 bullets. Pedir confirmação literal: *"Está correto e completo? Algo a adicionar antes de prosseguir?"*

**Não avance até receber "sim" ou correções aplicadas.**

---

## Fase 2 — Spec Layer

**Carrega:** [references/PHASE-2-SPEC.md](references/PHASE-2-SPEC.md) + [references/TEMPLATES.md](references/TEMPLATES.md)

**Entrada:** output da Fase 1

**Geração nesta ordem:**

1. `mkdir -p .ai/{skills,rules,docs}` no projeto-alvo
2. `INSTRUCTIONS.md` (100-180 linhas) usando template adaptado ao tipo
3. Esqueletos de skills (uma SKILL.md por domínio identificado, sem references/ ainda)
4. 3-7 rules iniciais com `applyTo` apropriado (omitir se não-técnico — usar protocolos)
5. Stubs de docs: `architecture.md`, `database-schema.md` (se software), `glossary.md` (se domínio especializado)

**Gate de saída:**

> Listar todos os arquivos criados com 1-linha de propósito cada. Mostrar contagem de linhas. Pedir confirmação: *"Esta é a Spec Layer mínima. Algum domínio crítico que esqueci? Algum arquivo que não faz sentido neste projeto?"*

---

## Fase 3 — Harness Layer

**Carrega:** [references/PHASE-3-HARNESS.md](references/PHASE-3-HARNESS.md) + [references/TEMPLATES.md](references/TEMPLATES.md)

**Entrada:** Fase 2 confirmada + tipo de projeto

**Decisões críticas:**

- **Hooks de lint/format:** apenas se software com formatter disponível
- **Hook de bloqueio destrutivo:** **sempre** (universal, baixo custo, alto valor)
- **Hook de testes no Stop:** apenas se software com test runner
- **Sub-agents:** habilitar `Explore` sempre; outros conforme escopo
- **Symlinks por IDE:** apenas para IDEs que o usuário declarou usar

**Geração:**

1. `.claude/settings.json` (ou equivalente) versionado, com perfil de permissões adequado
2. `scripts/` com hooks (`format-file.sh`, `validate-bash.sh`, `run-tests-if-changed.sh` — apenas os aplicáveis)
3. Symlinks via `setup-ide-links.sh` adaptado às IDEs declaradas
4. (Opcional) `.gitignore` ajustado

**Gate de saída:**

> Mostrar `settings.json`, lista de hooks instalados, e árvore de symlinks. Smoke test: *"Vou rodar `ls -la` para confirmar os symlinks. Posso?"* Após confirmação, executar e mostrar saída.

---

## Fase 4 — Memory Layer

**Carrega:** [references/PHASE-4-MEMORY.md](references/PHASE-4-MEMORY.md)

**Entrada:** Fases 2 e 3 confirmadas

**Geração:**

1. `.ai/docs/STATE.md` com seções: Decisões Ativas, Em Progresso, Blockers, Ideias Adiadas, Lições Aprendidas, TODOs
2. `.ai/CONVENTIONS.md` com mapa de symlinks e regras de manutenção

**Gate de saída:**

> Mostrar conteúdo gerado. Perguntar: *"Há decisões já tomadas, blockers atuais, ou contexto importante para registrar agora antes da primeira sessão real?"* Atualizar `STATE.md` com o que o usuário responder.

---

## Fase 5 — Validation

**Carrega:** [references/PHASE-5-VALIDATION.md](references/PHASE-5-VALIDATION.md)

**Entrada:** Fases 1-4 completas

**Execução:**

1. Rodar checklist de quality gates (12-15 itens)
2. Calcular métricas (linhas em INSTRUCTIONS, tamanho médio de SKILL.md, contagem de rules)
3. Smoke tests automatizados (symlinks resolvem, hooks executam)
4. Gerar handoff: lista de arquivos criados + próximos passos sugeridos

**Gate final:**

> Apresentar relatório de bootstrap concluído. Listar 3-5 ações sugeridas para o usuário fazer em seguida (ex: "Crie a primeira skill detalhada para o domínio X", "Configure CI para validar symlinks").

---

## Recovery

Se uma fase falhar (usuário recusa o output, surge informação contraditória):

- **Em Fase 1-2:** revise as perguntas, ajuste o resumo, regenere
- **Em Fase 3:** se a stack mudou, regenere `settings.json` e hooks; symlinks são reversíveis (`rm` + recriar)
- **Em Fase 4-5:** raramente requer voltar; geralmente é correção pontual no `STATE.md` ou `CONVENTIONS.md`

**Nunca destrua trabalho do usuário.** Antes de sobrescrever um arquivo existente, faça backup (`.bak`) ou peça confirmação.

---

## Mapa de Decisões Frequentes

| Pergunta da fase                       | Resposta padrão                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| Tipo desconhecido na Fase 1            | Tratar como "outro" e usar UNIVERSAL-MAP para inferir                               |
| Stack não está em TEMPLATES.md         | Usar template Node.js como base e adaptar — registrar como follow-up                |
| Usuário não sabe quais skills criar    | Sugerir 3 baseadas no domínio descrito + 1 skill universal de qualidade (lint/test) |
| Usuário não usa nenhuma IDE específica | Criar apenas symlinks raiz (CLAUDE.md, AGENTS.md) e `.agents/`                      |
| Projeto não-técnico                    | Pular Fase 3 (hooks) parcialmente; manter bloqueio destrutivo + permissões          |

---

## Estado Final Esperado

Ao final, o projeto-alvo tem:

```text
projeto-alvo/
├── .ai/
│   ├── INSTRUCTIONS.md
│   ├── CONVENTIONS.md
│   ├── skills/                 (3-7 skills com SKILL.md mínimo)
│   ├── rules/                  (3-7 rules — se aplicável)
│   └── docs/
│       ├── architecture.md     (se software)
        └── STATE.md
├── .claude/                    (symlinks)
├── .cursor/, .agents/, .github/ (conforme IDEs declaradas)
├── CLAUDE.md, AGENTS.md        (symlinks)
├── .claude/settings.json       (versionado)
└── scripts/                    (hooks — se software)
```

Estrutura completa esperada em [PROMPT-TEMPLATE.md](PROMPT-TEMPLATE.md).
