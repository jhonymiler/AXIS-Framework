# Phase 3 — Harness Layer Configuration

**Objetivo:** instalar a infraestrutura comportamental que torna o agente seguro, consistente e produtivo independente do que o modelo "decide" no momento.

**Entrada:** Spec Layer da Fase 2 validada + tipo de projeto.

**Output:** `settings.json` versionado, hooks configurados, sub-agents declarados, symlinks distribuídos.

---

## Por que o Harness Existe

A spec define o que o agente sabe. **Mas confiabilidade em produção depende mais do harness que do modelo.** Sem ele:

- Formatação inconsistente acumula em diffs sujos
- Comandos destrutivos passam (`rm -rf`, `DROP TABLE`)
- Testes não rodam ao final, regressões escapam
- Cada dev tem comportamento diferente da IA por máquina

O harness elimina cada um desses por construção, não por disciplina.

---

## Os Cinco Subsistemas

| Subsistema                | Função                               | Aplicabilidade            |
| ------------------------- | ------------------------------------ | ------------------------- |
| **Permission Harness**    | `settings.json` versionado           | Universal                 |
| **Execution Harness**     | Hooks (Pre/Post/Stop)                | Software (com adaptações) |
| **Orchestration Harness** | Sub-agents                           | Universal                 |
| **Context Harness**       | Token budget, Progressive Disclosure | Universal (já em Fase 2)  |
| **Verification Harness**  | Quality gates em skills              | Universal (já em Fase 2)  |

Esta fase implementa os três primeiros (os outros dois já estão no design da Fase 2).

---

## Passo 1 — `settings.json`

Use o template em [TEMPLATES.md → settings.json](TEMPLATES.md#settingsjson). Adapte ao stack via tabela:

| Stack       | Substituir `<build-tool>` por                     |
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

**Estrutura mínima:**

```json
{
  "permissions": {
    "allow": ["Read", "Bash(git *)", "<stack>", "Edit(/src/**)", "Edit(/.ai/**)"],
    "deny": ["Bash(rm -rf *)", "Bash(git push --force*)"],
    "ask": ["Bash(git push *)", "Edit(/.env*)"]
  }
}
```

**Universal (não-software):** mantenha `Read`, `Bash(git *)`, `Edit(/.ai/**)`, e adapte `Edit` ao layout do projeto. Pule entradas de stack.

**Versionar no git** é obrigatório. Sem isso, comportamento varia por máquina e bugs ficam difíceis de reproduzir.

---

## Passo 2 — Hooks

Hooks executam comandos shell em resposta a eventos do agente. **Três são indispensáveis** quando aplicáveis:

### Hook A — `PostToolUse` (formatação automática)

**Aplicável a:** software com formatter.

```json
{
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
    ]
  }
}
```

Script `format-file.sh` em [TEMPLATES.md → format-file.sh](TEMPLATES.md#format-filesh). É stack-aware via `case` e nunca falha (`exit 0`) — formatter ausente não bloqueia o agente.

**Por que indispensável:** sem isso, diffs ficam poluídos com mudanças de estilo, aumentando custo de code review.

### Hook B — `PreToolUse` (bloqueio destrutivo)

**Aplicável a:** universal. Sempre instalar.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "bash scripts/validate-bash.sh" }]
      }
    ]
  }
}
```

Script `validate-bash.sh` em [TEMPLATES.md → validate-bash.sh](TEMPLATES.md#validate-bashsh). Bloqueia padrões: `rm -rf /`, `DROP TABLE`, `TRUNCATE`, `DELETE FROM` sem WHERE.

**Por que indispensável:** o agente ocasionalmente infere que precisa "limpar" arquivos. Sem proteção, um erro de contexto é irreversível. Não bloqueia trabalho normal — só os casos perigosos.

### Hook C — `Stop` (testes ao finalizar)

**Aplicável a:** software com test runner.

```json
{
  "hooks": {
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

Script `run-tests-if-changed.sh` em [TEMPLATES.md → run-tests-if-changed.sh](TEMPLATES.md#run-tests-if-changedsh). Detecta extensões alteradas no diff e roda apenas o test runner aplicável.

**Por que indispensável:** fecha o loop de feedback. O agente não apenas "faz" — valida o que fez. Regressões são capturadas na mesma sessão.

### Para projetos não-técnicos

- **Hook A:** pular (sem formatter)
- **Hook B:** **manter** (proteção universal)
- **Hook C:** pular ou substituir por validação de output (ex: spell check, lint markdown)

---

## Passo 3 — Sub-agents

Sub-agents permitem delegação inteligente. O agente principal **orquestra**, sub-agents **executam**.

### `Explore` (built-in, sempre habilitar)

- Acesso somente-leitura: `Glob`, `Grep`, `Read`, `WebFetch`, `WebSearch`
- Impossível editar arquivos durante pesquisa
- Mais eficiente: não carrega ferramentas de escrita não usadas
- Para codebase grande, usar level `"very thorough"`

### Quando delegar vs executar

| Tarefa                            | Delegar? | Por quê                              |
| --------------------------------- | -------- | ------------------------------------ |
| Pesquisa / exploração             | **Sim**  | Output volumoso; só o resumo importa |
| Implementação de task             | **Sim**  | File reads/edits consomem contexto   |
| Tasks paralelas independentes     | **Sim**  | Única forma de paralelizar           |
| Tasks sequenciais sem dependência | **Sim**  | Mantém contexto principal limpo      |
| Planejamento e criação de tasks   | **Não**  | Requer contexto acumulado            |
| Validação e relatórios finais     | **Não**  | Precisa do histórico da sessão       |
| Quick fixes (≤3 arquivos)         | **Não**  | Overhead > task                      |

### Contrato de cada sub-agent

**Recebe:**
- Definição da task (o quê fazer, onde, critério de conclusão)
- Rules e conventions relevantes
- Spec/design que a task referencia

**Não recebe:**
- Definições de outras tasks
- Histórico de chat acumulado
- `STATE.md` (a menos que registre uma decisão/blocker específica)

**Retorna:**
- Status: Completo | Bloqueado | Parcial
- Arquivos alterados
- Resultado de testes/validação
- Issues encontrados

---

## Passo 4 — Symlinks por IDE

Para cada IDE declarada na Fase 1, criar symlinks. Use o script [setup-ide-links.sh em TEMPLATES.md](TEMPLATES.md#setup-ide-linkssh).

**Princípio:** o script é **idempotente** (`ln -sf` substitui sem erro). Pode rodar quantas vezes quiser.

**Pasta-alvo por IDE:**

| IDE            | Onde busca contexto                                        |
| -------------- | ---------------------------------------------------------- |
| Claude Code    | `.claude/`, `CLAUDE.md`                                    |
| Cursor         | `.cursor/rules/`, `.cursor/skills/`, `AGENTS.md`           |
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/instructions/` |
| Windsurf       | `AGENTS.md`, `.agents/`                                    |

**Pular** symlinks de IDEs que o usuário declarou não usar — reduz ruído em `git status`.

**Smoke test após criar:**

```bash
ls -la CLAUDE.md AGENTS.md .claude/ .cursor/ .agents/ .github/
```

Cada symlink deve mostrar `→ ../.ai/...` ou similar.

### Windows

Symlinks no Windows exigem permissão de administrador ou Developer Mode ativado. Se o time usa Windows:

- Documentar no `INSTRUCTIONS.md` ou `CONVENTIONS.md`
- Recomendar `core.symlinks = true` no Git for Windows
- Alternativa: usar `mklink /D` em terminal elevado

---

## Passo 5 — Smoke Test e Gate

```bash
# 1. Verificar settings.json
cat .claude/settings.json | jq .   # ou cat se sem jq

# 2. Verificar symlinks resolvem
ls -la CLAUDE.md AGENTS.md

# 3. Verificar hooks executam (criar arquivo dummy e ver lint rodar)
echo "test" > /tmp/test.ts && bash scripts/format-file.sh /tmp/test.ts
```

Apresente ao usuário:

```markdown
## Harness Layer Configurada

### Permissões
- N entries em allow, N em deny, N em ask

### Hooks instalados
- PostToolUse: format-file.sh (Node/Python/Go conforme stack)
- PreToolUse: validate-bash.sh (proteção destrutiva — universal)
- Stop: run-tests-if-changed.sh

### Symlinks criados
[árvore visual]

### Smoke test
[saída dos 3 comandos acima]

### Pergunta
Algum padrão destrutivo adicional a bloquear? Alguma IDE faltando?
```

**Espere confirmação antes da Fase 4.**

---

## Passo 6 — Failure Attribution (Localização de Falhas)

> **Contexto:** ReliabilityBench (arxiv 2601.06112) demonstrou que pass@1 superestima confiabilidade em 20-40%. AgentProp-Bench (arxiv 2604.16706) mostrou que a maioria dos benchmarks relata só pass/fail, sem localizar onde no pipeline a falha ocorreu. AXIS instrumenta o harness para atribuição.

**Configurar logging estruturado no `settings.json`:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"{\\\"event\\\":\\\"pre\\\",\\\"tool\\\":\\\"$CLAUDE_TOOL_NAME\\\",\\\"ts\\\":\\\"$(date -Iseconds)\\\"}\" >> .ai/logs/harness.jsonl 2>/dev/null || true"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"{\\\"event\\\":\\\"post\\\",\\\"tool\\\":\\\"$CLAUDE_TOOL_NAME\\\",\\\"exit\\\":\\\"$CLAUDE_TOOL_EXIT_CODE\\\",\\\"ts\\\":\\\"$(date -Iseconds)\\\"}\" >> .ai/logs/harness.jsonl 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

Adicione `.ai/logs/` ao `.gitignore` (são logs de runtime, não versionados).

**Tabela de atribuição de falhas:**

| Categoria     | Sintoma                                  | Sinal no log                            | Ação                                                             |
| ------------- | ---------------------------------------- | --------------------------------------- | ---------------------------------------------------------------- |
| **Planning**  | Agente tenta executar sem critério claro | PreToolUse sem spec task correspondente | Revisar `INSTRUCTIONS.md`; adicionar acceptance criteria à skill |
| **Execution** | Tool call falha repetidamente            | PostToolUse com `exit != 0` em loop     | Revisar `settings.json`; ajustar allow/deny                      |
| **Response**  | Output gerado mas formato errado         | Gate da Fase 5 rejeita                  | Adicionar exemplo de output ao template da skill                 |

**Adicionar ao checklist da Fase 5:**
- [ ] `harness.jsonl` existe e registra eventos após smoke test
- [ ] Nenhum loop de tool call com exit != 0 detectado

---

## Princípio Unificador

O ganho dos hooks: **removem dependência de disciplina manual.** O formatter roda porque o hook existe, não porque o dev lembrou. Os testes rodam porque `Stop` foi configurado, não porque o agente decidiu. Comandos destrutivos são bloqueados porque a regra existe, não porque o agente "tomou cuidado".

**Falhas em produção não são opacas** — o harness instrumentado localiza se o problema está em planning (spec vaga), execution (tool call inválida) ou response (formato errado). Isso elimina debug por tentativa-e-erro.

Spec define o que o agente sabe. Harness garante que ele age de forma consistente, segura e rastreável — independente do contexto da conversa.
