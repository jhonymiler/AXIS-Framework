# Templates

Todos os templates copy-paste usados pelo bootstrap. Cada um tem âncora linkável (ex: `#skillmd-índice`) referenciada das outras phases.

---

## INSTRUCTIONS.md

```markdown
# <Nome do Projeto>

## Propósito

<1-2 frases descrevendo o que o projeto faz, para quem, e por quê.>

## Stack / Ferramentas

- **Linguagem:** <ex: TypeScript 5.4>
- **Framework:** <ex: NestJS 10>
- **Banco:** <ex: PostgreSQL 16 + TypeORM>
- **Infra:** <ex: Docker, AWS ECS>
- **Test:** <ex: Jest, Supertest>

## Como Rodar

```bash
<comando exato para subir ambiente local>
<comando exato para rodar testes>
<comando exato para build>
```

## Arquitetura

| Componente | Responsabilidade | Tecnologia   | Localização   |
| ---------- | ---------------- | ------------ | ------------- |
| <ex: API>  | <ex: HTTP REST>  | <ex: NestJS> | <ex: src/api> |

Detalhes: [docs/architecture.md](docs/architecture.md)

## Princípios de Design

- **<Princípio 1>:** <rationale curto>
- **<Princípio 2>:** <rationale curto>

## Convenções

Resumo aqui; detalhes em [.ai/rules/](rules/):

- Naming: <regra>
- Error handling: <regra>
- Tests: <regra>

## Skills Disponíveis

| Skill                                  | Quando usar   |
| -------------------------------------- | ------------- |
| [<skill-1>](skills/<skill-1>/SKILL.md) | <quando usar> |
| [<skill-2>](skills/<skill-2>/SKILL.md) | <quando usar> |

## Links

- [Architecture](docs/architecture.md)
- [Database Schema](docs/database-schema.md)
- [State](docs/STATE.md)
- [Conventions](CONVENTIONS.md)
```

**Tamanho-alvo:** 100-180 linhas após preenchimento real.

---

## SKILL.md (índice)

```markdown
---
name: nome-da-skill
description: <2-4 linhas>. Use when implementando X, debugando Y,
  ou entendendo Z do domínio. Mention specific domain terms that act
  as triggers: term1, term2, term3.
---

# Título da Skill

<Propósito em 1-2 frases.>

## Quando Usar

- <Cenário específico 1>
- <Cenário específico 2>
- <Cenário específico 3>

## Resumo Rápido

| Item | Valor | Observação |
| ---- | ----- | ---------- |
| ...  | ...   | ...        |

## Referências

- [GUIDE.md](references/GUIDE.md) — guia operacional passo a passo
- [REFERENCE.md](references/REFERENCE.md) — tabelas e dados de referência
- [PROMPT-TEMPLATE.md](references/PROMPT-TEMPLATE.md) — contrato de output (se gera artefatos)
- [TROUBLESHOOTING.md](references/TROUBLESHOOTING.md) — erros comuns (opcional)

## Validação Final

Antes de finalizar trabalho que use esta skill:

- [ ] <gate específico do domínio 1>
- [ ] <gate específico do domínio 2>
```

**Tamanho-alvo:** 40-60 linhas.

---

## Rule de Código

```markdown
---
applyTo: "**/*.{ext}"
paths:
  - "src/**"
---

# <Nome da Regra>

## <Seção 1>

- <Diretriz concisa com contexto (por que fazer assim)>
- <Diretriz concisa com contexto>

## <Seção 2>

- <Diretriz concisa>
```

---

## STATE.md

```markdown
# Estado do Projeto

## Decisões Ativas
<!-- [YYYY-MM-DD] Decisão X tomada porque Y -->

## Em Progresso
<!-- Feature Z: 70% completa, falta integração com API X -->

## Blockers
<!-- API X retornando 429 em staging — aguardando resposta do fornecedor -->

## Ideias Adiadas (Deferred)
<!-- Migrar para gRPC — avaliar quando volume passar de 10k req/min -->

## Lições Aprendidas
<!-- Bulk insert com TypeORM: usar createQueryBuilder em vez de save() para >100 registros -->

## TODOs Pendentes
- [ ]

---

## Protocolo de Handoff

Ao final de qualquer sessão com mudanças relevantes, atualizar este arquivo com:
- O que foi feito
- O que falta
- Qualquer contexto que se perderia

Ao iniciar sessão, ler este arquivo **antes** de qualquer outro.
```

---

## CONVENTIONS.md

```markdown
# Convenções

## Single Source of Truth

Todo conteúdo vive em `.ai/`. Pastas IDE-específicas contêm apenas symlinks.

## Mapa de Symlinks

```text
CLAUDE.md     → .ai/INSTRUCTIONS.md
AGENTS.md     → .ai/INSTRUCTIONS.md
.claude/      → ../.ai/{rules,skills,INSTRUCTIONS.md}
.cursor/      → ../.ai/{rules,skills}
.agents/      → ../.ai/{rules,skills}
.github/      → ../.ai/{rules,skills,INSTRUCTIONS.md}
```

Para adicionar nova IDE: editar `setup-ide-links.sh` (3-4 linhas) e rodar.

## Templates

- **Nova skill:** copiar `<skill>/SKILL.md` de qualquer skill existente como base
- **Nova rule:** copiar formato de `code-style.md`

## Regras para o Agente

- Nunca duplicar conteúdo entre IDEs
- Sempre criar arquivos dentro de `.ai/`
- Manter `SKILL.md` ≤ 60 linhas
- Manter `INSTRUCTIONS.md` entre 100-180 linhas
- Atualizar `STATE.md` ao final de sessões com mudanças

## Knowledge Verification Chain

Antes de afirmar:
1. Codebase
2. Docs do projeto
3. MCP/Context7 (docs oficiais)
4. Web search
5. Marcar incerto — nunca fabricar

## Manutenção

| Evento                     | Ação                           |
| -------------------------- | ------------------------------ |
| Mudança de fluxo no código | Atualizar skill correspondente |
| Sessão pausada             | Atualizar STATE.md             |
| Nova integração            | Avaliar nova skill             |
```

---

## settings.json

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Bash(git *)",
      "Bash(<build-tool> *)",
      "Edit(/src/**)",
      "Edit(/test/**)",
      "Edit(/.ai/**)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force*)"
    ],
    "ask": [
      "Bash(git push *)",
      "Edit(/.env*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash scripts/format-file.sh \"$CLAUDE_TOOL_INPUT_FILE_PATH\""
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash scripts/validate-bash.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash scripts/run-tests-if-changed.sh"
          }
        ]
      }
    ]
  }
}
```

Substituir `<build-tool>` por:

| Stack       | Comando                                           |
| ----------- | ------------------------------------------------- |
| Node.js     | `Bash(npm *)`, `Bash(npx *)`                      |
| Python      | `Bash(pip *)`, `Bash(pytest *)`, `Bash(poetry *)` |
| Go          | `Bash(go *)`                                      |
| Java/Maven  | `Bash(mvn *)`                                     |
| Java/Gradle | `Bash(gradle *)`, `Bash(./gradlew *)`             |
| Ruby        | `Bash(bundle *)`, `Bash(rake *)`                  |
| PHP         | `Bash(composer *)`                                |
| Rust        | `Bash(cargo *)`                                   |
| .NET        | `Bash(dotnet *)`                                  |

---

## format-file.sh

```bash
#!/bin/bash
# scripts/format-file.sh
# Formata o arquivo passado como argumento. Stack-aware via case.
# Nunca falha — formatter ausente não bloqueia o agente.

FILE="$1"
[ -z "$FILE" ] && exit 0

case "$FILE" in
  *.ts|*.js|*.json|*.css)  npx prettier --write "$FILE" 2>/dev/null ;;
  *.py)                     black "$FILE" 2>/dev/null ;;
  *.go)                     gofmt -w "$FILE" 2>/dev/null ;;
  *.java)                   google-java-format --replace "$FILE" 2>/dev/null ;;
  *.rb)                     rubocop --auto-correct "$FILE" 2>/dev/null ;;
  *.php)                    php-cs-fixer fix "$FILE" 2>/dev/null ;;
  *.rs)                     rustfmt "$FILE" 2>/dev/null ;;
esac
exit 0
```

---

## validate-bash.sh

```bash
#!/bin/bash
# scripts/validate-bash.sh
# Bloqueia padrões destrutivos. Universal — instalar em qualquer projeto.

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null)

# Padrões nunca permitidos sem confirmação explícita
if echo "$CMD" | grep -qE '(rm -rf /|DROP TABLE|TRUNCATE |DELETE FROM [^W])'; then
  echo '{"action": "deny", "reason": "Comando potencialmente destrutivo. Execute manualmente se intencional."}'
  exit 0
fi

echo '{"action": "allow"}'
```

---

## run-tests-if-changed.sh

```bash
#!/bin/bash
# scripts/run-tests-if-changed.sh
# Detecta extensões de código alteradas e roda os testes correspondentes.

CHANGED=$(git diff --name-only HEAD 2>/dev/null)
[ -z "$CHANGED" ] && exit 0

if echo "$CHANGED" | grep -qE '\.(ts|js)$';      then npm test -- --passWithNoTests 2>&1 | tail -10; fi
if echo "$CHANGED" | grep -qE '\.py$';            then pytest --tb=short -q 2>&1 | tail -10; fi
if echo "$CHANGED" | grep -qE '\.go$';            then go test ./... 2>&1 | tail -10; fi
if echo "$CHANGED" | grep -qE '\.java$';          then mvn test -q 2>&1 | tail -10; fi
if echo "$CHANGED" | grep -qE '\.rb$';            then bundle exec rspec --format progress 2>&1 | tail -10; fi
if echo "$CHANGED" | grep -qE '\.(cs|csproj)$';   then dotnet test --nologo 2>&1 | tail -10; fi
exit 0
```

---

## setup-ide-links.sh

```bash
#!/bin/bash
# Idempotente — pode rodar quantas vezes quiser sem erro.
set -e

# Raiz
ln -sf .ai/INSTRUCTIONS.md CLAUDE.md
ln -sf .ai/INSTRUCTIONS.md AGENTS.md

# Claude Code
mkdir -p .claude
ln -sf ../.ai/INSTRUCTIONS.md .claude/CLAUDE.md
ln -sf ../.ai/rules .claude/rules
ln -sf ../.ai/skills .claude/skills

# Cursor
mkdir -p .cursor
ln -sf ../.ai/rules .cursor/rules
ln -sf ../.ai/skills .cursor/skills

# Windsurf / Agents genéricos
mkdir -p .agents
ln -sf ../.ai/rules .agents/rules
ln -sf ../.ai/skills .agents/skills

# GitHub Copilot
mkdir -p .github
ln -sf ../.ai/INSTRUCTIONS.md .github/copilot-instructions.md
ln -sf ../.ai/rules .github/instructions
ln -sf ../.ai/skills .github/skills

echo "Symlinks criados/atualizados com sucesso."
```

**Comentar/remover** as seções de IDEs não usadas pelo time, para reduzir ruído em `git status`.

---

## architecture.md (stub)

```markdown
# Arquitetura do Sistema

## Visão Geral

<Diagrama ASCII ou Mermaid mostrando componentes e conexões.>

## Componentes

| Componente | Responsabilidade | Tecnologia | Localização |
| ---------- | ---------------- | ---------- | ----------- |
| ...        | ...              | ...        | ...         |

## Decisões Arquiteturais Chave

- **Por que <tecnologia>:** <rationale>
- **Por que <padrão>:** <rationale>

## Restrições e Trade-offs

- **<Restrição>:** <consequência e mitigação>
```

---

## database-schema.md (stub)

```markdown
# Database Schema

## Tabela: <nome>

| Coluna | Tipo | Nullable | Descrição |
| ------ | ---- | -------- | --------- |
| id     | UUID | N        | PK gerado |
| ...    | ...  | ...      | ...       |

**Índices:** `idx_xxx` (col1, col2) — usado em <query>
**Constraints:** `uq_xxx` (col) — garante <invariante>

**Regras de negócio:**
- <regra 1>
- <regra 2>
```
