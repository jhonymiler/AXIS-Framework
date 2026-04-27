# QUICKSTART — AXIS em 5 Minutos

> Para o bootstrap completo (5 fases, 30 min), use a skill `axis-bootstrap`. Este documento é o caminho rápido para quem quer algo funcional hoje e estrutura completa depois.

---

## O que você terá ao final

- `INSTRUCTIONS.md` contextual (não monolítico)
- `settings.json` com bloqueio de comandos destrutivos
- Symlinks multi-IDE ativos
- `STATE.md` com playbook inicial
- Base para expandir para bootstrap completo

**Tempo estimado:** 5-10 minutos de interação + 5 minutos de execução.

---

## Passo 1 — Identidade do projeto (2 min)

Responda mentalmente ou cole as respostas ao agente:

1. **O que o projeto faz?** (1 frase)
2. **Stack/ferramentas principais?** (ou "não-técnico" se for conteúdo/pesquisa)
3. **Qual(is) IDE(s) você usa?** (Claude Code / Cursor / Windsurf / Copilot — marque todas)
4. **Há algo que o agente NUNCA deve fazer?** (ex: push direto para main, deletar dados de produção)

---

## Passo 2 — `INSTRUCTIONS.md` mínimo (2 min)

Crie `.ai/INSTRUCTIONS.md` com esta estrutura mínima (adapte):

```markdown
# [Nome do Projeto]

[1-2 frases sobre o que o projeto faz]

## Stack
- [tecnologia principal]
- [outras relevantes]

## Como rodar
[comando de start]

## Regras críticas
- Nunca [restrição 1 do passo anterior]
- Sempre confirmar antes de [ação destrutiva]
```

> Limite: 50-80 linhas para quick start. Expandir para 100-180 no bootstrap completo.

---

## Passo 3 — `settings.json` mínimo (1 min)

Crie `.claude/settings.json` (ou equivalente para sua IDE):

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Bash(git status)",
      "Bash(git log *)",
      "Bash(git diff *)",
      "Edit(/.ai/**)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force*)",
      "Bash(DROP *)",
      "Bash(truncate *)"
    ],
    "ask": [
      "Bash(git push *)",
      "Edit(/.env*)"
    ]
  }
}
```

**Adicione ao git imediatamente:** `git add .claude/settings.json && git commit -m "chore: add axis harness settings"`

---

## Passo 4 — Symlinks multi-IDE (1 min)

Execute no terminal:

```bash
# Na raiz do projeto
ln -sf .ai/INSTRUCTIONS.md CLAUDE.md
ln -sf .ai/INSTRUCTIONS.md AGENTS.md
mkdir -p .claude && ln -sf ../.ai/skills .claude/skills
mkdir -p .cursor && ln -sf ../.ai/skills .cursor/skills
mkdir -p .agents && ln -sf ../.ai/skills .agents/skills
mkdir -p .github && ln -sf ../.ai/INSTRUCTIONS.md .github/copilot-instructions.md
mkdir -p .github && ln -sf ../.ai/skills .github/skills
```

Verifique: `ls -la CLAUDE.md AGENTS.md .claude/skills`

---

## Passo 5 — `STATE.md` inicial (1 min)

Crie `.ai/docs/STATE.md`:

```markdown
# Estado do Projeto

## Em Progresso
<!-- O que está sendo feito agora -->

## Blockers
<!-- Nada no momento -->

## Decisões Ativas
<!-- [data] Adotado AXIS Framework -->

## Lições Aprendidas
<!-- Vazio — a preencher ao longo do projeto -->

---

## Protocolo de Handoff

Ao final de sessões com mudanças relevantes, atualizar este arquivo.
Ao iniciar sessão, ler este arquivo antes de qualquer outro.
**Curar ativamente** — remover o que está resolvido.
```

---

## Próximos Passos

Quando tiver 30 minutos: execute o bootstrap completo para criar skills por domínio, hooks de automação, RFC-001 e CONVENTIONS.md.

```text
Use a skill axis-bootstrap para completar a estrutura deste projeto.
```

O agente vai detectar o INSTRUCTIONS.md existente, pular Fase 1 (discovery já feita), e completar as camadas que faltam.
