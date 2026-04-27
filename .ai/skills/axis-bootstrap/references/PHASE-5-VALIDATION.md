# Phase 5 — Validation & Handoff

**Objetivo:** validar que o bootstrap entregou um sistema completo e funcional, e fazer handoff claro ao usuário.

**Entrada:** Fases 1-4 completas.

**Output:** relatório de validação + lista de próximos passos.

---

## Modo Auditoria

Esta fase também roda em modo standalone quando o usuário pede para **auditar um projeto existente**. Nesse caso:

- Pular Fases 1-4
- Aplicar todos os checklists abaixo
- Reportar o que está ausente ou fora dos padrões
- Não criar/modificar nada sem confirmação explícita

---

## Quality Gates — Estrutura

```text
[ ] Pasta .ai/ existe na raiz do projeto
[ ] .ai/INSTRUCTIONS.md existe e tem 100-180 linhas
[ ] Pelo menos 3 skills em .ai/skills/, cada uma com SKILL.md
[ ] Cada SKILL.md tem ≤ 60 linhas
[ ] Cada SKILL.md tem frontmatter com `name` e `description`
[ ] Cada `description` tem 2-4 linhas e menciona termos-gatilho
[ ] Para projetos software: pelo menos 3 rules em .ai/rules/ com `applyTo`
[ ] Pelo menos 1 stub em .ai/docs/ (architecture.md, glossary.md, ou equivalente)
[ ] .ai/CONVENTIONS.md existe e contém mapa de symlinks
[ ] .ai/docs/STATE.md existe com as 6 seções obrigatórias
[ ] .ai/docs/RFC/RFC-001-*.md existe documentando a adoção
```

---

## Quality Gates — Harness

```text
[ ] settings.json existe e está versionado (git ls-files o lista)
[ ] settings.json tem allow/deny/ask preenchidos coerentemente com a stack
[ ] Hook PreToolUse de bloqueio destrutivo configurado (universal)
[ ] Para software: hook PostToolUse com formatter configurado
[ ] Para software: hook Stop com testes configurado
[ ] Scripts em scripts/ são executáveis (chmod +x)
[ ] Scripts terminam com exit 0 (não bloqueiam o agente em caso de falha)
```

---

## Quality Gates — Symlinks

```text
[ ] CLAUDE.md → .ai/INSTRUCTIONS.md (resolve)
[ ] AGENTS.md → .ai/INSTRUCTIONS.md (resolve)
[ ] Para cada IDE declarada: pasta correspondente com symlinks corretos
[ ] setup-ide-links.sh existe e é idempotente
[ ] Rodar setup-ide-links.sh duas vezes não gera erro
[ ] ls -la mostra os targets esperados em todos os symlinks
```

**Smoke test concreto:**

```bash
# Confirmar que cada symlink resolve sem erro
for f in CLAUDE.md AGENTS.md .claude/CLAUDE.md .cursor/rules .cursor/skills; do
  if [ -e "$f" ]; then
    echo "OK: $f → $(readlink -f "$f")"
  else
    echo "FALTA: $f"
  fi
done
```

---

## Quality Gates — Memory

```text
[ ] STATE.md tem todas as 6 seções (Decisões Ativas, Em Progresso, Blockers,
    Ideias Adiadas, Lições, TODOs)
[ ] STATE.md menciona o protocolo de handoff
[ ] RFC-001 não tem campos vazios (Contexto, Decisão, Consequências, Alternativas)
[ ] CONVENTIONS.md descreve onde a IA pode/não pode criar arquivos
[ ] CONVENTIONS.md inclui Knowledge Verification Chain
```

---

## Métricas Quantitativas

Calcular e reportar:

| Métrica | Alvo | Como medir |
| ------- | ---- | ---------- |
| Linhas em `INSTRUCTIONS.md` | 100-180 | `wc -l` |
| Linhas médias por `SKILL.md` | 40-60 | `wc -l skills/*/SKILL.md \| awk` |
| Skills totais | 3-10 | `ls -d skills/*/ \| wc -l` |
| Rules totais | 3-7 (se software) | `ls rules/*.md \| wc -l` |
| Symlinks ativos | igual ao número de IDEs declaradas + 2 (raiz) | `find . -type l \| wc -l` |
| Hooks instalados | 1-3 | contagem em settings.json |

**Sinais de problema:**

- `INSTRUCTIONS.md` >200 linhas → mover detalhes para skills/docs
- Algum `SKILL.md` >80 linhas → mover conteúdo para `references/`
- >12 skills → fragmentação excessiva, considerar consolidação
- Nenhuma rule criada em projeto software → provável lacuna

---

## Auto-Validação Cruzada

```text
[ ] As skills mencionadas em INSTRUCTIONS.md (tabela) existem em .ai/skills/
[ ] As rules mencionadas em INSTRUCTIONS.md existem em .ai/rules/
[ ] O mapa de symlinks em CONVENTIONS.md bate com os symlinks reais
[ ] As IDEs declaradas na Fase 1 têm pastas correspondentes
[ ] As decisões em RFC-001 batem com a estrutura real gerada
```

**Se algum cruzamento falha**, corrigir antes do handoff.

---

## Handoff ao Usuário

Mensagem final segue o template em [PROMPT-TEMPLATE.md](../PROMPT-TEMPLATE.md#handoff-ao-usuário). Estrutura:

```markdown
## Bootstrap Concluído

### O que foi criado
- N arquivos em .ai/
- N skills inicializadas: <lista>
- N rules: <lista>
- N stubs em docs/
- Memory layer com STATE, RFC-001, CONVENTIONS
- N symlinks distribuindo para <IDEs>
- N hooks no settings.json

### Métricas
- INSTRUCTIONS.md: N linhas (alvo 100-180) ✓
- SKILL.md média: N linhas (alvo 40-60) ✓
- Symlinks: todos resolvem ✓
- Smoke tests: pass ✓

### Próximos passos sugeridos (3-5)
1. Detalhar a primeira skill prioritária — popule references/GUIDE.md em <skill>
2. Adicionar primeira RFC de domínio se há decisão arquitetural pendente
3. Validar settings.json com o time
4. Configurar CI para verificar resolução de symlinks
5. Testar invocação por outra IDE (smoke test multi-tool)

### Como retomar
- Próxima sessão: agente lê STATE.md primeiro
- Auditoria futura: invoque novamente este skill em modo "auditoria"
- Adicionar nova IDE: editar setup-ide-links.sh + rodar
```

---

## Lacunas Aceitáveis vs Bloqueantes

**Aceitáveis** (apenas reportar, não bloquear):

- references/ ainda vazios em skills (esperado — preenchem com uso)
- Rules específicas do domínio ainda não escritas
- docs/ stubs sem conteúdo
- TODOs vazios no STATE.md

**Bloqueantes** (corrigir antes do handoff):

- INSTRUCTIONS.md ausente ou <50 linhas
- Skills sem `description` no frontmatter
- Symlinks quebrados
- `settings.json` não versionado
- RFC-001 com campos em branco

---

## Auditoria Pós-Adoção (uso futuro)

O usuário pode reinvocar este skill semanas depois para auditar:

```text
"Use axis-bootstrap em modo auditoria neste projeto."
```

O agente:

1. Pula Fases 1-4
2. Aplica todos os gates desta fase
3. Identifica drift (ex: INSTRUCTIONS.md cresceu para 250 linhas; alguma skill perdeu description)
4. Propõe correções uma por uma
5. **Não corrige sem confirmação**

---

## Antipadrões

- Declarar bootstrap concluído sem rodar smoke tests
- Aceitar `description` genérica em skill ("Reference for X") — sempre exigir termos-gatilho
- Pular auto-validação cruzada (gera inconsistência silenciosa)
- Entregar handoff sem próximos passos concretos (deixa o usuário sem direção)
