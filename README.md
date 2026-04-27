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

### Opção A — Bootstrap novo projeto (caminho rápido)

Em qualquer agente (Claude Code, Cursor, Windsurf, Copilot):

```text
Use a skill axis-bootstrap para inicializar este projeto.
```

O agente conduz você por 5 fases com gates explícitos. Você confirma antes de cada fase avançar.

### Opção B — Instalar manualmente

```bash
# 1. Copie a estrutura .ai/ para seu projeto
cp -r /path/to/AXIS/.ai/ seu-projeto/.ai/

# 2. Execute o setup de symlinks
cd seu-projeto && bash setup-ide-links.sh
```

### O que o bootstrap entrega

Em ~30 minutos de interação:

- `INSTRUCTIONS.md` contextual (100-180 linhas, não monolítico)
- Skills por domínio com Progressive Disclosure
- `settings.json` versionado com permissões auditáveis
- Hooks de formatação, bloqueio destrutivo e testes automáticos
- Symlinks multi-IDE (Claude Code, Cursor, Windsurf, Copilot, etc.)
- `STATE.md` para continuidade entre sessões

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
├── README.md                                    ← você está aqui
├── FRAMEWORK.md                                 ← modelo conceitual (humanos)
└── .ai/                                         ← o framework executável (fonte única)
    ├── INSTRUCTIONS.md                          ← entry point para IA
    ├── CONVENTIONS.md                           ← como o framework se mantém
    └── skills/
        └── axis-bootstrap/                      ← a spec executável
            ├── SKILL.md                         ← índice do skill
            ├── PLANNER.md                       ← fases + gates
            ├── PROMPT-TEMPLATE.md               ← contrato do output
            └── references/                      ← detalhes on-demand
                ├── QUICKSTART.md                ← caminho de 5 minutos
                ├── PHASE-1-DISCOVERY.md
                ├── PHASE-2-SPEC.md
                ├── PHASE-3-HARNESS.md           ← inclui failure attribution
                ├── PHASE-4-MEMORY.md            ← inclui princípios ACE
                ├── PHASE-5-VALIDATION.md
                ├── TEMPLATES.md
                ├── PATTERNS.md                  ← PD, KVC, ACE, k-trial
                └── UNIVERSAL-MAP.md
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

Para configurar em um projeto novo: `bash setup-ide-links.sh`
