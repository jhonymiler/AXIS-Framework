# Phase 4 — Memory Layer Initialization

**Objetivo:** garantir que o projeto tenha continuidade entre sessões — decisões, estado e convenções persistem mesmo quando muda o dev, a IDE ou passa o tempo.

**Entrada:** Spec Layer (Fase 2) e Harness Layer (Fase 3) confirmadas.

**Output:** três artefatos de memória ativos no projeto.

---

## Fundamento: Princípio ACE (Agentic Context Engineering)

> Paper de referência: **ACE — Agentic Context Engineering** (arxiv 2510.04618), que demonstrou +10.6% em benchmarks de agentes e +8.6% em finanças com uma abordagem que trata contextos como **playbooks evolutivos**.

**O que muda em relação a um log de histórico:**

| Abordagem tradicional          | Abordagem ACE (AXIS)                       |
| ------------------------------ | ------------------------------------------ |
| Append-only: acumula tudo      | Curação ativa: remove obsoleto, eleva útil |
| Cresce indefinidamente → ruído | Tamanho controlado → foco                  |
| Contexto de histórico          | Contexto de estratégia                     |
| Sessão começa do zero          | Sessão começa informada                    |

**Implicação prática:** `STATE.md` não é um diário — é um playbook. A cada sessão o agente não apenas escreve: ele *refina*. Remove o que foi resolvido. Eleva o que se provou útil. O resultado é que o contexto *melhora com o tempo* em vez de degradar.

---

## Por que a Memory Layer Existe

Sem ela, projetos de longa duração regridem a cada sessão:

- "Por que decidimos X?" — perdido
- "O que estava em progresso?" — refeito do zero
- "Que lição aprendemos com aquele bug?" — repete-se
- Spec Kit issue #75: "great specs but every new chat starts from zero"

A Memory Layer é o que torna o sistema **antifrágil ao tempo**.

---

## Os Três Artefatos

| Artefato         | Tipo                   | Atualização                                |
| ---------------- | ---------------------- | ------------------------------------------ |
| `STATE.md`       | Playbook vivo (curado) | A cada sessão — curar, não apenas appendar |
| `RFC-NNN.md`     | Decisões frias         | A cada decisão arquitetural não-óbvia      |
| `CONVENTIONS.md` | Meta (estrutura)       | Quando a estrutura do `.ai/` muda          |

---

## Passo 1 — `STATE.md`

Criar `.ai/docs/STATE.md` com **seis seções obrigatórias**, mesmo que comecem vazias:

```markdown
# Estado do Projeto

## Decisões Ativas
<!-- [data] Decisão X tomada porque Y (link para RFC se existir) -->

## Em Progresso
<!-- Feature Z: implementação 70% completa, falta integração com API -->

## Blockers
<!-- API X retornando 429 em staging — aguardando resposta do fornecedor -->

## Ideias Adiadas (Deferred)
<!-- Migrar para gRPC — avaliar quando volume passar de 10k req/min -->

## Lições Aprendidas
<!-- Bulk insert: usar createQueryBuilder, não save() para >100 registros -->

## TODOs Pendentes
- [ ]
```

**Pergunte ao usuário antes de finalizar:**

> "Há decisões já tomadas, blockers atuais, lições do passado, ou ideias adiadas que devem entrar no `STATE.md` antes da primeira sessão real?"

Se houver, popular as seções com o que o usuário relatar. Se não, deixar com comentários-stub mostrando o formato esperado.

### Session Handoff Protocol

Documentar dentro do `STATE.md` (no rodapé, como instrução para o agente):

```markdown
---

## Protocolo de Handoff

Ao final de qualquer sessão com mudanças relevantes, o agente atualiza este arquivo com:
- O que foi feito
- O que falta
- Qualquer contexto que se perderia

Ao iniciar sessão, o agente lê este arquivo **antes** de qualquer outro.
```

---

## Passo 2 — `RFC-001`

Toda adoção do framework gera um RFC inicial. Cria `.ai/docs/RFC/RFC-001-spec-harness-adoption.md`:

```markdown
# RFC-001: Adoção do Spec-Harness Framework

**Status:** Aceito
**Data:** YYYY-MM-DD

## Contexto

<Por que este projeto adotou o framework. Use o Project Profile da Fase 1
para preencher: problema que motivou (ex: divergência entre IDEs, falta de
contexto compartilhado, perda de continuidade entre sessões).>

## Decisão

Adotar Spec-Harness com as seguintes camadas:

- **Spec:** `.ai/INSTRUCTIONS.md`, N skills (<lista>), N rules (<lista>)
- **Harness:** `settings.json` versionado, hooks (<quais>), sub-agents (<quais>),
  symlinks para IDEs (<quais>)
- **Memory:** `STATE.md`, `CONVENTIONS.md`, RFCs versionados

## Consequências

**Positivas:**
- Single Source of Truth — zero divergência entre IDEs
- Progressive Disclosure — economia significativa de tokens
- Continuidade entre sessões via STATE.md
- Comportamento idêntico em todas as máquinas (settings versionado)

**Negativas / Trade-offs aceitos:**
- Setup inicial requer discovery de 5-15 min
- Symlinks no Windows precisam Developer Mode
- Manutenção contínua do STATE.md depende de disciplina

## Alternativas Consideradas

- **CLAUDE.md monolítico** — rejeitado por não escalar e divergir entre IDEs
- **Sem framework (ad-hoc)** — rejeitado por inconsistência entre devs
- **<Outra que veio na Fase 1>** — rejeitada porque <motivo>
```

**Não inventar conteúdo** — preencher com base nas respostas reais da Fase 1. Se faltar info, perguntar.

---

## Passo 3 — `CONVENTIONS.md`

Criar `.ai/CONVENTIONS.md`. Use template em [TEMPLATES.md → CONVENTIONS.md](TEMPLATES.md#conventionsmd). Conteúdo mínimo:

1. **Princípio Single Source of Truth** + mapa de symlinks
2. **Templates** para criar novas skills e rules (referência ao TEMPLATES.md ou cópia local)
3. **Regras para o agente:**
   - Onde criar arquivos
   - O que nunca fazer (duplicar entre IDEs, criar fora de `.ai/`)
4. **Knowledge Verification Chain** (codebase → docs → MCP/Context7 → web → marcar incerto)
5. **Como adicionar suporte a nova IDE** (3 comandos `ln -s`)
6. **Protocolo de manutenção** — gatilhos para atualizar docs

---

## Passo 4 — Validação e Gate

Apresente ao usuário:

```markdown
## Memory Layer Inicializada

### Arquivos criados
- .ai/docs/STATE.md (com 6 seções estruturadas)
- .ai/docs/RFC/RFC-001-spec-harness-adoption.md
- .ai/CONVENTIONS.md

### STATE.md preenchido com
- N decisões ativas
- N itens em progresso
- N blockers
- N ideias adiadas
- N lições
- N TODOs

### Próximo passo
Validação final na Fase 5.
```

**Espere confirmação antes da Fase 5.**

---

## Loop de Manutenção (documentar para o futuro)

Esta seção fica registrada em `CONVENTIONS.md` para referência futura:

**Gatilhos para atualização de documentação:**

| Evento                                   | Ação esperada do agente                        |
| ---------------------------------------- | ---------------------------------------------- |
| Código muda fluxo de skill               | Propor atualização da skill antes de encerrar  |
| Decisão arquitetural na sessão           | Propor RFC ou atualização de `architecture.md` |
| Regra de negócio surge                   | Perguntar se documenta na skill/docs           |
| Bug revela comportamento não-documentado | Propor documentar                              |
| Nova integração/dependência              | Avaliar nova skill ou expansão                 |
| Sessão pausada com trabalho em andamento | Atualizar `STATE.md`                           |

**Princípio:** o agente não atualiza automaticamente sem confirmação, mas tampouco deixa passar sem avisar. Vira **guardião da documentação**.

---

## Antipadrões

- Deixar `STATE.md` apenas com comentários-stub sem perguntar ao usuário (perde a chance de capturar contexto fresco)
- Inventar contexto no RFC-001 (use só o que a Fase 1 capturou)
- Pular `CONVENTIONS.md` por parecer "óbvio" — é o que mantém a estrutura viva
- Criar RFCs para decisões triviais (RFC é para decisões não-óbvias com alternativas reais)
- **Appendar sem curar**: STATE.md com 500+ linhas é um sinal de falha — contexto cresce, foco diminui

---

## Protocolo de Curação ACE

Ao final de **cada** sessão com mudanças, executar em sequência:

```markdown
## Curação do STATE.md

1. Mover para "Decisões Ativas" o que foi decidido nesta sessão
2. Remover de "Em Progresso" o que foi concluído
3. Remover de "Blockers" o que foi resolvido
4. Adicionar em "Lições Aprendidas" qualquer insight não-óbvio
5. Mover para "Deferred" ideias que não serão executadas agora
```

**Tamanho-alvo do STATE.md:** ≤ 80 linhas. Se ultrapassar, é sinal de que itens resolvidos não foram removidos.

**Ao iniciar sessão:**
1. Ler STATE.md *antes* de qualquer outra coisa
2. Verificar se "Em Progresso" reflete a realidade atual
3. Atualizar data no cabeçalho do STATE.md
