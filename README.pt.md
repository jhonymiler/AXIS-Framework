# AXIS Framework

> **Harness-first. Spec-driven. Memory-persistent.**

Um framework executável que bootstrapa qualquer projeto — técnico ou não — com a infraestrutura necessária para colaborar de forma **confiável e escalável** com agentes de IA.

> **Não é um artigo para ler. É uma spec para executar.** O framework usa o próprio padrão que prega: ele se entrega como um skill que a IA carrega e executa em fases com gates explícitos.

---

## O Modelo Central

```text
Projeto Aumentado por IA = Spec Layer + Harness Layer + Memory Layer
```

| Camada      | Responde                     | Artefatos                                  | Por que importa                        |
| ----------- | ---------------------------- | ------------------------------------------ | -------------------------------------- |
| **Spec**    | O QUÊ o projeto é e precisa  | INSTRUCTIONS.md, skills, rules, docs       | Contexto mínimo, sem ruído             |
| **Harness** | COMO o agente se comporta    | settings.json, hooks, sub-agents, symlinks | **Confiabilidade real — não o modelo** |
| **Memory**  | O QUE persiste entre sessões | STATE.md, CONVENTIONS.md                   | Antifragilidade ao tempo               |

> **Insight-chave:** LangChain moveu um agente do fora-do-top-30 para top-5 no Terminal Bench 2.0 mudando apenas o harness — **mesmo modelo**. A camada de maior alavancagem não é o prompt, é o harness.

Detalhes completos em [FRAMEWORK.md](FRAMEWORK.md).

---

## Quick Start — 5 Minutos

### Opção A — CLI (mais rápido)

```bash
# uso único, sem instalar — auto-detecta projeto novo vs existente, pergunta PT/EN
npx @axis-bootstrap/cli init

# ou instale globalmente
npm i -g @axis-bootstrap/cli
axis init        # bootstrap interativo (Spec + Harness + Memory)
axis doctor      # valida limites, symlinks, contrato de recursividade
```

O CLI detecta automaticamente:

| Detectado                                                  | Modo padrão                    | O que acontece                                                                                                                                          |
| ---------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Diretório vazio                                            | **Quick scaffold**             | Prompts interativos preenchem templates                                                                                                                 |
| Projeto existente (`package.json`, `pyproject.toml`, etc.) | **AI-driven**                  | Instala a skill `axis-bootstrap` → você pede ao agente "execute axis-bootstrap" → agente lê seu código e gera skills/rules/docs customizadas            |
| Já tem `.ai/`                                              | Pergunta antes de sobrescrever | —                                                                                                                                                       |

Por feature (depois do bootstrap):

```bash
axis spdd canvas pricing-quote   # cria Canvas REASONS
axis spdd story                  # → IA preenche seção R
axis spdd align                  # → IA preenche O + N + S₂
axis spdd design                 # → IA preenche E + A + S₁
# … gerar código no seu agente …
axis spdd review                 # IA verifica diff contra o Canvas
```

Referência completa do CLI em [cli/README.md](cli/README.md).

### Opção B — A partir de qualquer agente de IA (sem instalar CLI)

No Claude Code, Cursor, Windsurf ou Copilot:

```text
Use a skill axis-bootstrap para inicializar este projeto.
```

O agente conduz você por 5 fases com gates explícitos. Você confirma antes de cada fase avançar.

### O que o bootstrap entrega

Em ~30 minutos de interação:

- `INSTRUCTIONS.md` contextual (100-180 linhas, não monolítico)
- Skills por domínio com Progressive Disclosure
- `settings.json` versionado com permissões auditáveis
- Hooks de formatação, bloqueio destrutivo e testes automáticos
- Symlinks multi-IDE (Claude Code, Cursor, Windsurf, Copilot, etc.)
- `STATE.md` para continuidade entre sessões
- Após `axis cleanup`: projeto **autossuficiente**, sem dependência do CLI

---

## Por que AXIS e Não Outro Framework

| Framework               | Ângulo                      | Limitação                                                            |
| ----------------------- | --------------------------- | -------------------------------------------------------------------- |
| **Spec Kit (GitHub)**   | Spec-first                  | Sem harness, sem memória persistente; contexto perdido entre sessões |
| **BMAD-METHOD**         | Agile multi-agent           | Focado em software; pesado para projetos menores                     |
| **LangChain/LangGraph** | Runtime de agentes          | Runtime, não infra de projeto; lock-in de framework                  |
| **CrewAI**              | Orquestração role-based     | Sem gestão de contexto entre IDEs                                    |
| **AXIS**                | **Harness + Spec + Memory** | Stack-agnóstico, multi-IDE, 3 camadas integradas                     |

AXIS resolve o que os outros ignoram: **a divergência de contexto entre IDEs, a fragilidade entre sessões e a ausência de permissões versionadas**.

---

## Quando Usar AXIS

- Iniciando um projeto novo (técnico ou não-técnico)
- Adotando workflow de IA em projeto existente
- Migrando de um `CLAUDE.md` monolítico para estrutura modular
- Auditando um projeto para identificar lacunas na infra de IA
- Padronizando múltiplos projetos do time

## Quando NÃO Usar

- Script descartável de 1 hora
- Projeto solo de fim de semana sem perspectiva de continuidade
- Quando o overhead da estrutura excede o ganho

Ver [FRAMEWORK.md](FRAMEWORK.md#trade-offs) para o trade-off completo.

---

## Estrutura deste Repositório

```text
AXIS/
├── README.md                                    ← inglês
├── README.pt.md                                 ← você está aqui
├── FRAMEWORK.md                                 ← modelo conceitual (humanos)
├── cli/                                         ← @axis-bootstrap/cli (Node + Clack)
│   ├── package.json                             ← bin: axis
│   ├── src/                                     ← dispatcher + comandos
│   │   ├── index.js
│   │   ├── lib/{i18n,detect,paths,copy,ui}.js
│   │   └── commands/{init,audit,doctor,link,state,spdd,cleanup}.js
│   └── templates/                               ← bundles distribuídos pelo CLI
│       ├── INSTRUCTIONS.md, CONVENTIONS.md, STATE.md, CANVAS.md
│       ├── settings.json, setup-ide-links.sh
│       ├── skills/                              ← 4 skills SPDD prontas
│       └── bootstrap-skill/                     ← bundle do axis-bootstrap (modo AI)
└── .ai/                                         ← o framework executável (fonte única)
    ├── INSTRUCTIONS.md                          ← entry point para IA
    ├── CONVENTIONS.md                           ← como o framework se mantém
    ├── docs/STATE.md                            ← memory layer
    └── skills/
        ├── axis-bootstrap/                      ← a spec executável
        │   ├── SKILL.md, PLANNER.md, PROMPT-TEMPLATE.md
        │   └── references/                      ← detalhes on-demand
        │       ├── QUICKSTART.md
        │       ├── PHASE-1-DISCOVERY.md … PHASE-5-VALIDATION.md
        │       ├── TEMPLATES.md, PATTERNS.md, UNIVERSAL-MAP.md
        │       └── CANVAS-REASONS.md            ← artefato SPDD
        ├── story-decompose/                     ← SPDD: requisito → INVEST stories
        ├── alignment/                           ← SPDD: trava intent + DoD
        ├── abstraction-first/                   ← SPDD: design objetos + camadas
        └── iterative-review/                    ← SPDD: loop de revisão 2 trilhas
```

O framework é **self-hosting** — sua própria estrutura segue o padrão que ensina.

---

## Princípios Operacionais

1. **Harness-first** — confiabilidade vem do ambiente, não do modelo
2. **Single Source of Truth** — conteúdo vive em `.ai/`; symlinks resolvem distribuição multi-IDE
3. **Progressive Disclosure** — carregue apenas o necessário (~1.500 tokens base)
4. **Gates entre fases** — nenhum artefato gerado sem confirmação do usuário
5. **Memória como playbook** — STATE.md não é log; é contexto curado que se auto-melhora (princípio ACE)
6. **Stack-agnóstico** — funciona para software, conteúdo, pesquisa, legal, qualquer domínio

---

## Symlinks Multi-IDE

AXIS usa **Single Source of Truth**: todo conteúdo vive em `.ai/`. As pastas IDE-específicas contêm apenas symlinks — é **fisicamente impossível** ter divergência.

```text
CLAUDE.md                        → .ai/INSTRUCTIONS.md
AGENTS.md                        → .ai/INSTRUCTIONS.md
.claude/skills                   → .ai/skills
.cursor/skills                   → .ai/skills
.agents/skills                   → .ai/skills
.github/skills                   → .ai/skills
.github/copilot-instructions.md  → .ai/INSTRUCTIONS.md
```

Para configurar em um projeto novo: `bash setup-ide-links.sh` (gerado automaticamente pelo `axis init`).

---

## Remoção Limpa

AXIS é um **bootstrap one-shot**. Depois que o agente termina seu trabalho, o projeto é autossuficiente:

```bash
# 1. Remover apenas a meta-skill bootstrap (mantém tudo gerado)
axis cleanup

# 2. (Opcional) Desinstalar o CLI globalmente
npm uninstall -g @axis-bootstrap/cli

# 3. Remoção total — apaga toda a infraestrutura AXIS gerada
rm -rf .ai .claude .cursor .agents AGENTS.md CLAUDE.md setup-ide-links.sh
```

Sem `node_modules` poluindo seu projeto, sem entradas no `package.json`, sem dependência runtime. O CLI vive **fora** do seu projeto (instalado globalmente ou via `npx`).
