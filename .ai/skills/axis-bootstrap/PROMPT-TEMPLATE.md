# Prompt Template — Contrato do Output Final

Este é o **contrato** do que um bootstrap bem-sucedido entrega. Use como referência ao gerar e como base para a validação na Fase 5.

---

## Estrutura Final Esperada

```text
projeto-alvo/
├── .ai/                                           ← FONTE ÚNICA
│   ├── INSTRUCTIONS.md                            (100-180 linhas)
│   ├── CONVENTIONS.md                             (mapa + regras)
│   ├── skills/
│   │   ├── <skill-1>/SKILL.md                     (40-60 linhas)
│   │   ├── <skill-2>/SKILL.md
│   │   └── ...                                    (3-7 skills)
│   ├── rules/                                     (3-7 rules — se aplicável)
│   │   ├── code-style.md
│   │   ├── architecture-patterns.md
│   │   └── ...
│   └── docs/
│       ├── architecture.md                        (se software)
│       ├── database-schema.md                     (se software)
│       ├── glossary.md                            (se domínio especializado)
│       ├── STATE.md
│       └── RFC/
│           └── RFC-001-spec-harness-adoption.md
│
├── CLAUDE.md           → .ai/INSTRUCTIONS.md
├── AGENTS.md           → .ai/INSTRUCTIONS.md
│
├── .claude/                                       (se Claude Code declarado)
│   ├── CLAUDE.md       → ../.ai/INSTRUCTIONS.md
│   ├── rules           → ../.ai/rules
│   ├── skills          → ../.ai/skills
│   └── settings.json                              (versionado)
│
├── .cursor/, .agents/, .github/                   (conforme declaradas)
│
├── scripts/                                       (se software)
│   ├── format-file.sh
│   ├── validate-bash.sh
│   └── run-tests-if-changed.sh
│
└── setup-ide-links.sh                             (idempotente)
```

---

## Conteúdo Mínimo por Arquivo

### `.ai/INSTRUCTIONS.md`

Ordem (frequência de consulta, não importância lógica):

1. O que o projeto faz (1-2 frases)
2. Stack ou ferramentas (com versões)
3. Como rodar / como começar
4. Arquitetura em tabela (componentes + responsabilidade)
5. Princípios de design (3-7 bullets com rationale)
6. Convenções de código (resumo — detalhes em rules)
7. Skills disponíveis (tabela com quando usar)
8. Links para docs e referências

**Tamanho:** 100-180 linhas. Abaixo de 100 é superficial; acima de 200 perde foco.

### `.ai/skills/<skill>/SKILL.md`

```markdown
---
name: <nome-skill>
description: <2-4 linhas mencionando termos de domínio que agem como gatilhos>
---

# <Título da Skill>

<Propósito em 1-2 frases.>

## Quando Usar
- <Cenário 1>
- <Cenário 2>
- <Cenário 3>

## Resumo Rápido
<Tabela ou bullets densos>

## Referências
- [GUIDE.md](references/GUIDE.md) — <propósito>
- [REFERENCE.md](references/REFERENCE.md) — <propósito>
```

**Tamanho:** 40-60 linhas. Description: 2-4 linhas, escrito em terceira pessoa, com termos-gatilho.

### `.ai/CONVENTIONS.md`

- Mapa de symlinks
- Regras para o agente (onde criar arquivos, o que nunca fazer)
- Knowledge Verification Chain
- Como adicionar nova IDE (3-4 linhas de `ln -s`)
- Templates pointer (link para TEMPLATES.md ou cópia local)

### `.ai/docs/STATE.md`

Seções obrigatórias:

- **Decisões Ativas** (com data e rationale)
- **Em Progresso** (com % de completude estimado)
- **Blockers** (com responsável aguardado)
- **Ideias Adiadas** (com critério para retomar)
- **Lições Aprendidas** (com contexto)
- **TODOs Pendentes** (checkbox)

### `.ai/docs/RFC/RFC-001-spec-harness-adoption.md`

```markdown
# RFC-001: Adoção do AXIS Framework

**Status:** Aceito
**Data:** YYYY-MM-DD

## Contexto
<Por que este projeto adotou o framework — problema que resolve>

## Decisão
Adotar AXIS com as seguintes camadas:
- Spec: <skills criadas, rules, docs>
- Harness: <hooks, sub-agents, IDEs suportadas>
- Memory: STATE.md + RFCs versionados

## Consequências
- **Positivas:** <esperadas>
- **Negativas:** <trade-offs aceitos>

## Alternativas Consideradas
- CLAUDE.md monolítico — rejeitado porque <motivo>
- <Outras se houver>
```

### `.claude/settings.json` (ou equivalente)

```json
{
  "permissions": {
    "allow": ["Read", "Bash(git *)", "<stack-specific>", "Edit(/src/**)", "Edit(/.ai/**)"],
    "deny": ["Bash(rm -rf *)", "Bash(git push --force*)"],
    "ask": ["Bash(git push *)", "Edit(/.env*)"]
  },
  "hooks": {
    "PostToolUse": [/* lint hook se software */],
    "PreToolUse": [/* validate-bash sempre */],
    "Stop": [/* test hook se software */]
  }
}
```

---

## Validation Checklist

Antes de declarar bootstrap completo:

- [ ] `.ai/INSTRUCTIONS.md` existe e tem 100-180 linhas
- [ ] Pelo menos 3 skills criadas, cada uma com SKILL.md ≤ 60 linhas
- [ ] Cada SKILL.md tem `description` com 2-4 linhas e termos-gatilho
- [ ] `.ai/CONVENTIONS.md` contém mapa de symlinks
- [ ] `.ai/docs/STATE.md` tem todas as 6 seções (mesmo que algumas estejam vazias)
- [ ] `.ai/docs/RFC/RFC-001-*.md` documenta a adoção
- [ ] Symlinks resolvem corretamente (`ls -la` mostra os targets)
- [ ] `settings.json` está versionado (`git status` confirma)
- [ ] Hooks executam (smoke test em arquivo dummy) — se software
- [ ] Setup script é idempotente (rodar 2x não quebra)
- [ ] Usuário recebeu lista de 3-5 próximos passos sugeridos

---

## Handoff ao Usuário

Mensagem final ao concluir:

```text
Bootstrap concluído. Resumo:

Estrutura criada:
- N arquivos em .ai/
- N symlinks distribuindo para [IDEs]
- N hooks configurados em settings.json
- N skills inicializadas

Próximos passos sugeridos:
1. Detalhar a primeira skill (popule references/GUIDE.md em <skill>)
2. Adicionar primeira RFC de domínio (decisão arquitetural pendente?)
3. Validar settings.json com seu time
4. Rodar `bash setup-ide-links.sh` em qualquer máquina nova do time
5. Configurar CI para verificar resolução de symlinks (opcional)

Para entender o framework: leia FRAMEWORK.md neste repo.
Para auditar o que foi gerado: invoque novamente este skill em modo "auditoria".
```
