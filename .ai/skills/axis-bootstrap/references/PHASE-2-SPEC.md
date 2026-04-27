# Phase 2 — Spec Layer Generation

**Objetivo:** gerar a fonte única de conhecimento do projeto (`.ai/`).

**Entrada:** Project Profile validado na Fase 1.

**Output:** estrutura `.ai/` populada com `INSTRUCTIONS.md`, esqueletos de skills, rules iniciais e stubs de docs.

---

## Ordem de Geração (não inverta)

```text
1. Criar estrutura de pastas
2. Gerar INSTRUCTIONS.md
3. Gerar esqueletos de skills (uma por domínio identificado)
4. Gerar rules iniciais
5. Gerar stubs de docs
6. Apresentar ao usuário e validar
```

---

## Passo 1 — Estrutura de Pastas

```bash
mkdir -p .ai/{skills,rules,docs,docs/stories}
```

Para projetos não-técnicos, ainda criar a estrutura — `rules/` pode ser usada para "protocolos", `docs/` para referências de domínio. A homogeneidade simplifica a manutenção.

---

## Passo 2 — INSTRUCTIONS.md

Use o template de [TEMPLATES.md → INSTRUCTIONS.md](TEMPLATES.md#instructionsmd).

**Ordem das seções (frequência de consulta, não importância lógica):**

1. **Propósito** (1-2 frases — o que faz, para quem, por quê)
2. **Stack ou Ferramentas** (com versões relevantes)
3. **Como Rodar / Como Começar** (comandos exatos ou primeiros passos)
4. **Arquitetura** (tabela: componente → responsabilidade → tecnologia → localização)
5. **Princípios de Design** (3-7 bullets com rationale curto)
6. **Convenções** (resumo — detalhes em rules)
7. **Skills Disponíveis** (tabela: skill → quando usar)
8. **Links** (para docs detalhados)

**Tamanho-alvo:** 100-180 linhas. Abaixo de 100 é superficial; acima de 200 perde foco.

**Insight crítico — descreva decisões, não apenas fatos:**

```markdown
# Ruim
- ORM: TypeORM

# Bom
- ORM: TypeORM com Repository pattern — nunca acessar `Repository<T>` direto nos services,
  encapsular em classes `*Repository` para facilitar mock nos testes
```

A segunda forma economiza uma pergunta ao dev e evita código fora do padrão.

**Para projetos não-técnicos**, substituir:

- "Stack" → "Ferramentas e plataformas"
- "Como rodar" → "Como começar / fluxo de trabalho"
- "Arquitetura" → "Componentes do projeto"
- "Convenções de código" → "Padrões de qualidade"

---

## Passo 3 — Esqueletos de Skills

Para cada domínio identificado na Fase 1, criar:

```text
.ai/skills/<nome>/
└── SKILL.md         (40-60 linhas, sem references/ ainda)
```

Use o template [SKILL.md em TEMPLATES.md](TEMPLATES.md#skillmd-índice).

**O frontmatter `description` é o elemento mais crítico** — determina se a skill será carregada. Checklist:

- [ ] 2-4 linhas (1 linha é vago, 5+ é excessivo)
- [ ] Em terceira pessoa ("Use when implementando...")
- [ ] Menciona termos de domínio que agem como gatilhos
- [ ] Lista 3-5 cenários de uso
- [ ] Um dev novo entenderia quando usar a skill só lendo a description

```yaml
# Fraco
description: Reference for the payments API integration.

# Forte
description: Complete reference for the Payments API integration.
  Use when implementing API calls (endpoints, auth, payload format),
  debugging API responses (error codes, rate limits),
  or understanding the retry strategy and idempotency rules.
```

**Não popule references/ ainda.** Esta fase entrega o índice. References são preenchidos em sessões subsequentes conforme o conhecimento se acumula.

### Granularidade — quando criar nova skill vs expandir existente

**Criar nova quando:**
- Domínio tem >5 conceitos específicos
- Existe fluxo de trabalho próprio
- Cenário de uso é distinto

**Expandir existente quando:**
- Informação é complementar
- SKILL.md ainda <60 linhas após adição
- Mesmo cenário de uso

**Usar `docs/` em vez de skill quando:**
- É documentação de referência pura (schema, contratos)
- Não envolve fluxo de trabalho
- Será referenciado por múltiplas skills

---

## Passo 4 — Rules Iniciais

Para projetos de software, criar 3-7 rules em `.ai/rules/`. Use template [Rule em TEMPLATES.md](TEMPLATES.md#rule-de-código).

**Estrutura padrão recomendada:**

```text
.ai/rules/
├── code-style.md            (naming, formatting, imports)
├── architecture-patterns.md (DI, módulos, padrões do framework)
├── database.md              (ORM, migrations, queries)
├── testing.md               (estrutura de testes, mocks)
└── cli.md                   (comandos e scripts)
```

**Frontmatter para escopo:**

```yaml
---
applyTo: "**/*.{ext}"
paths:
  - "src/**"
---
```

**Como escrever rule eficaz:**

```markdown
# Ruim — genérico demais
- Use meaningful variable names
- Keep functions small

# Bom — específico e acionável
- Use constantes ou enums para todos os valores fixos de domínio (ex: `Status`, `Origin`)
  — nunca usar string literals como `'pending'` espalhados no código
- Operações em lote: prefira bulk inserts/updates nativos do ORM/DB — nunca loops
  (impacto de N+1 queries em tabelas grandes é exponencial)
```

**Três elementos de rule eficaz:** o quê fazer, como fazer, e por quê (quando não é óbvio).

**Para projetos não-técnicos**, substituir rules por **protocolos** (mesma estrutura, sem `applyTo`):

```text
.ai/rules/  (ou .ai/protocols/)
├── tom-de-voz.md
├── estrutura-de-artigo.md
├── checklist-de-revisao.md
└── padroes-de-citacao.md
```

---

## Passo 5 — Stubs de Docs

Criar arquivos com cabeçalho e seções vazias, prontos para preenchimento futuro.

### Para software

```text
.ai/docs/
├── architecture.md          (visão geral do sistema + decisões)
├── database-schema.md       (tabelas + regras de negócio + índices)
├── api-contracts.md         (contratos internos e externos)
├── data-flows.md            (opcional — para fluxos não-óbvios)
└── monitoring.md            (opcional — observabilidade)
```

`architecture.md` deve incluir seção **Decisões Arquiteturais Chave** com formato:

```markdown
- **Por que <decisão>:** <rationale curto>
```

`database-schema.md` deve incluir **regras de negócio** junto ao schema (não em outro lugar):

```markdown
**Regras de negócio:**
- `deleted_at IS NULL` em todas as queries (soft delete)
- `retry_count` incrementado a cada tentativa falha, máx 3
```

### Para domínios especializados (não-software)

```text
.ai/docs/
├── glossary.md              (termos do domínio com significado específico)
├── workflows.md             (fluxos de trabalho)
└── references.md            (links externos, fontes oficiais)
```

---

## Passo 6 — Validação e Gate

Apresente ao usuário:

```markdown
## Spec Layer Gerada

### Estrutura
.ai/INSTRUCTIONS.md (N linhas)
.ai/skills/<skill1>/SKILL.md (N linhas)
.ai/skills/<skill2>/SKILL.md (N linhas)
...
.ai/rules/<rule1>.md
.ai/docs/architecture.md (stub)
...

### Total
- N skills inicializadas
- N rules criadas
- N stubs de docs

### Pergunta
Algum domínio crítico que esqueci? Algum arquivo que não faz sentido neste projeto?
Algum nome a ajustar?
```

**Espere confirmação antes da Fase 3.**

---

## Princípios de Qualidade

- **Densidade > comprimento** — cada linha precisa carregar informação útil
- **Decisões > fatos** — explique o "porquê", não apenas o "quê"
- **Específico > genérico** — "use Repository pattern porque X" > "use boas práticas"
- **Composabilidade** — skills devem se referenciar, não duplicar conteúdo
- **Documente fluxos em skills, estado em docs** — distinção crítica:

| Tipo              | Onde                                | Exemplo                     |
| ----------------- | ----------------------------------- | --------------------------- |
| Fluxo de trabalho | `skills/<nome>/SKILL.md`            | "Como coletar dados da API" |
| Algoritmo/lógica  | `skills/<nome>/references/GUIDE.md` | "Lógica de deduplicação"    |
| Schema/contrato   | `docs/database-schema.md`           | "Tabela transactions"       |
| Estado atual      | `docs/STATE.md`                     | "Feature X em progresso"    |

Padrões adicionais (Progressive Disclosure budget, KVC, auto-sizing) em [PATTERNS.md](PATTERNS.md).
