# Conventions — Como o Framework se Mantém

Este documento descreve a estrutura interna deste repositório e o protocolo para evoluí-lo sem quebrar a recursividade.

---

## Princípio Central

**O framework segue o padrão que ensina.** Qualquer mudança aqui deve preservar:

- Single Source of Truth (sem duplicação de conteúdo)
- Progressive Disclosure (SKILL.md ≤ 60 linhas, references on-demand)
- Gates entre fases (no skill `spec-harness-bootstrap`)
- Universal mapping (cada conceito técnico tem equivalente não-técnico)

Se uma proposta de mudança quebra um desses, ela é rejeitada ou redesenhada.

---

## Mapa de Estrutura

```text
Spec-Harness/                                    ← raiz (humanos leem README/FRAMEWORK)
├── README.md                                    ← humanos: visão geral + quick start
├── FRAMEWORK.md                                 ← humanos: modelo conceitual
└── .ai/                                         ← IA: tudo aqui é fonte única
    ├── INSTRUCTIONS.md                          ← IA: entry point
    ├── CONVENTIONS.md                           ← este arquivo
    └── skills/
        └── spec-harness-bootstrap/              ← a spec executável
            ├── SKILL.md                         ← índice ≤ 60 linhas
            ├── PLANNER.md                       ← orquestração
            ├── PROMPT-TEMPLATE.md               ← contrato de output
            └── references/                      ← detalhes on-demand
                ├── PHASE-1-DISCOVERY.md
                ├── PHASE-2-SPEC.md
                ├── PHASE-3-HARNESS.md
                ├── PHASE-4-MEMORY.md
                ├── PHASE-5-VALIDATION.md
                ├── TEMPLATES.md
                ├── PATTERNS.md
                └── UNIVERSAL-MAP.md
```

---

## Quando Modificar Cada Arquivo

| Mudança                         | Onde                                                    | Não onde               |
| ------------------------------- | ------------------------------------------------------- | ---------------------- |
| Novo conceito conceitual        | `FRAMEWORK.md`                                          | `SKILL.md`             |
| Nova fase no bootstrap          | novo `PHASE-N.md` + atualizar `PLANNER.md` + `SKILL.md` | mover para outro skill |
| Novo template (artefato gerado) | `references/TEMPLATES.md`                               | inline em PHASE-N.md   |
| Novo padrão (PD, KVC, etc.)     | `references/PATTERNS.md`                                | espalhado em PHASEs    |
| Suporte a novo tipo de projeto  | `references/UNIVERSAL-MAP.md` + `TEMPLATES.md`          | criar skill paralela   |
| Quick start, instalação         | `README.md`                                             | `INSTRUCTIONS.md`      |
| Como a IA opera no framework    | `INSTRUCTIONS.md`                                       | `README.md`            |
| Mapa de manutenção              | este arquivo                                            | qualquer outro         |

---

## Symlinks (quando este repo for instalado em projeto-alvo)

Quando o framework é **usado em um projeto-alvo**, ele cria os seguintes symlinks no projeto:

```bash
# Raiz do projeto-alvo
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

# Windsurf / agentes genéricos
mkdir -p .agents
ln -sf ../.ai/rules .agents/rules
ln -sf ../.ai/skills .agents/skills

# GitHub Copilot
mkdir -p .github
ln -sf ../.ai/INSTRUCTIONS.md .github/copilot-instructions.md
ln -sf ../.ai/rules .github/instructions
ln -sf ../.ai/skills .github/skills
```

O script idempotente está em `references/TEMPLATES.md` sob o nome `setup-ide-links.sh`.

---

## Adicionando Suporte a uma Nova IDE

1. Identificar onde a IDE busca instruções e regras
2. Adicionar 3-4 linhas de symlink ao `setup-ide-links.sh` em `TEMPLATES.md`
3. Atualizar a tabela em `FRAMEWORK.md` (ou a equivalente em `PHASE-3-HARNESS.md`)
4. Documentar quirks da IDE (formato de frontmatter aceito, tamanho máximo, etc.)

Não criar um novo skill por IDE. O suporte multi-IDE é uma propriedade do harness, não um domínio.

---

## Regras para o Agente

Ao operar dentro deste repositório:

- **Não crie arquivos fora da estrutura mapeada acima** sem antes propor ao usuário
- **Não duplique conteúdo** entre `FRAMEWORK.md` e `SKILL.md` — referencie
- **Mantenha SKILL.md ≤ 60 linhas** — se passar, mova detalhes para `references/`
- **Ao adicionar uma fase**, atualize: `PLANNER.md`, `SKILL.md`, e crie o `PHASE-N.md` correspondente
- **Ao mudar um template**, mantenha consistência com exemplos em `PATTERNS.md`

---

## Knowledge Verification Chain (interna)

Antes de afirmar qualquer coisa sobre o framework:

1. **Codebase deste repo** — ler o arquivo relevante
2. **Documentação cruzada** — verificar consistência entre `FRAMEWORK.md`, `SKILL.md` e `PHASE-N.md`
3. **Web** — apenas se a pergunta for sobre conceito externo (Anthropic, GitHub Spec Kit, etc.)
4. **Marcar incerto** — se faltar informação, dizer "não está documentado" — nunca inventar

---

## Protocolo de Evolução

Mudanças não-triviais ao framework devem ser documentadas com uma nota em `STATE.md` descrevendo o que mudou e por quê.
