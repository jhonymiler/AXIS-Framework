# Patterns — Padrões Técnicos do Framework

Padrões reutilizáveis que o bootstrap aplica e que devem ser seguidos em qualquer evolução do projeto pós-bootstrap.

---

## 1. Progressive Disclosure (3 Camadas)

A spec carrega em três momentos distintos para minimizar tokens:

| Camada | Quando carrega | Conteúdo | Custo |
| ------ | -------------- | -------- | ----- |
| **1 — Discovery** | Sempre (startup) | `name` + `description` do frontmatter | ~3 linhas/skill |
| **2 — Index** | Quando relevante | `SKILL.md` completo | ~40-60 linhas |
| **3 — On-demand** | Quando necessário | `references/*.md` | sob demanda |

O agente sabe que uma skill existe (camada 1), decide se precisa (camada 2), só puxa detalhes profundos quando vai implementar (camada 3).

---

## 2. Token Budget

Progressive Disclosure só funciona com limites explícitos. Defina:

| Categoria | Budget | Regra |
| --------- | ------ | ----- |
| **Base fixa** (INSTRUCTIONS + frontmatters) | ~1.500-2.000 tokens | Sempre carregado |
| **Skills ativos** (SKILL.md completos) | ~3.000-5.000 tokens | Apenas relevantes para a task |
| **References on-demand** | ~5.000-10.000 tokens | Apenas quando necessário |
| **Total alvo** | <15.000 tokens | Reservar máximo para raciocínio |

**Regras de carregamento:**

- Nunca carregar múltiplos `SKILL.md` simultaneamente se não são para a mesma task
- Nunca carregar múltiplos docs de arquitetura ao mesmo tempo
- Ao atingir o limite, descarregar o conteúdo mais antigo
- Avisar quando o contexto de docs ultrapassar o budget (sinal de skills grandes demais)

---

## 3. Knowledge Verification Chain

**Antes de afirmar qualquer coisa**, o agente segue esta ordem **obrigatória**:

```text
Passo 1: Codebase  → verificar código existente, convenções e padrões
Passo 2: Docs do projeto → README, .ai/docs/, comentários inline, skills
Passo 3: Docs oficiais (MCP/Context7) → resolver lib ID, consultar API atual
Passo 4: Web search → docs oficiais, fontes confiáveis, padrões da comunidade
Passo 5: Marcar como incerto → "Não tenho certeza sobre X — verifique"
```

**Regras invioláveis:**

- Nunca pular para o Passo 5 se 1-4 estão disponíveis
- Passo 5 é **sempre** sinalizado como incerto — nunca apresentado como fato
- **Nunca assumir ou fabricar.** Se não encontrar, dizer "não encontrei documentação"
- Inventar APIs, padrões ou comportamentos causa falhas em cascata: design errado → tasks erradas → implementação errada
- Incerteza é sempre preferível a fabricação

Esta cadeia deve ser referenciada em `CONVENTIONS.md` e pode ser uma rule independente em `.ai/rules/knowledge-verification.md`.

---

## 4. Auto-Sizing por Complexidade

Nem toda tarefa precisa do mesmo nível de planejamento. Antes de iniciar, o agente avalia:

| Complexidade | Indicadores | Documentação | O que pular |
| ------------ | ----------- | ------------ | ----------- |
| **Small** | ≤3 arquivos, escopo em 1 frase | Descrever → Implementar → Verificar | Spec, design, task breakdown |
| **Medium** | Feature clara, <10 passos | Spec breve + design inline | Design formal |
| **Large** | Multi-componente, >10 passos | Spec completa + design + tasks | Nada |
| **Complex** | Ambiguidade, domínio novo | Spec + discussão + pesquisa | Nada + validação interativa |

**Regras:**

- **Specify** e **Execute** são sempre obrigatórios — sempre saber O QUÊ e FAZER
- **Design** é pulado se mudança é direta (sem decisões arquiteturais novas)
- **Task breakdown** é pulado se há ≤3 passos óbvios
- **Válvula de segurança:** mesmo quando tasks são pulados, o agente lista os passos inline. Se a listagem revelar >5 passos ou dependências complexas, **PARAR** e criar task breakdown formal

Evita dois extremos: over-engineering em tarefas simples (queima tokens com ceremony) e under-planning em complexas (gera retrabalho).

---

## 5. Granularidade de Skills

**Quando criar nova skill:**

- Domínio tem >5 conceitos específicos
- Existe fluxo de trabalho próprio
- Informações não deriváveis do código sem contexto externo
- Agente comete erros recorrentes sem a skill

**Quando expandir existente:**

- Informação é complementar
- `SKILL.md` ainda <60 linhas após adição
- Cenário de uso é o mesmo

**Quando usar `docs/` em vez de skill:**

- É documentação de referência pura (schema, contratos)
- Não envolve fluxo de trabalho
- Será referenciado por múltiplas skills

---

## 6. Description Quality

A `description` no frontmatter é a **única informação** que o agente lê em 100% das sessões. Determina se a skill é usada ou ignorada.

**Checklist:**

- [ ] Contém termos de domínio exatos que aparecem nas perguntas dos devs
- [ ] Lista cenários com verbos de ação ("implementando", "debugando", "entendendo")
- [ ] Tem 2-4 linhas (1 vago, 5+ excessivo)
- [ ] Um dev novo entende quando usar só lendo a description

**Exemplo:**

```yaml
# Fraco
description: Reference for the payments API integration.

# Forte
description: Complete reference for the Payments API integration.
  Use when implementing API calls (endpoints, auth, payload format),
  debugging API responses (error codes, rate limits),
  or understanding the retry strategy and idempotency rules.
```

---

## 7. Fluxos vs Estado

| Tipo | Onde | Exemplo |
| ---- | ---- | ------- |
| Fluxo de trabalho | `skills/<nome>/SKILL.md` | "Como coletar dados da API" |
| Algoritmo/lógica | `skills/<nome>/references/GUIDE.md` | "Lógica de deduplicação" |
| Schema/contrato | `docs/database-schema.md` | "Tabela transactions" |
| Decisão arquitetural | `docs/RFC/RFC-NNN.md` | "Por que PostgreSQL" |
| Estado atual | `docs/STATE.md` | "Feature X em progresso" |

**Regra:** skills documentam **fluxos**; docs documentam **estado**.

---

## 8. Composabilidade entre Skills

Skills frequentemente precisam umas das outras. Protocolo:

1. **Verificar disponibilidade** — antes de usar funcionalidade de outra skill, verificar se existe
2. **Delegar se disponível** — usar a skill complementar, não reimplementar
3. **Fallback gracioso** — se não disponível, usar abordagem padrão
4. **Recomendar uma vez** — sugerir instalação no máximo uma vez por sessão

**Como documentar no SKILL.md:**

```markdown
## Integrações

- **Diagramas:** Se `mermaid-studio` disponível, delegar criação de diagramas.
  Fallback: blocos de código Mermaid inline.
- **Exploração:** Se `codenavi` disponível, delegar navegação.
  Fallback: ferramentas built-in de busca.
```

Cria ecossistema modular sem dependências rígidas.

---

## 9. Loop de Manutenção

Documentação não-mantida vira desinformação — pior que ausente, porque o agente age com confiança em info errada.

**Regra fundamental:** toda mudança relevante de comportamento no código deve ser refletida nas skills/docs **na mesma sessão**.

**Gatilhos:**

| Evento | Ação esperada |
| ------ | ------------- |
| Código muda fluxo de skill | Propor atualização da skill antes de encerrar |
| Decisão arquitetural na sessão | Propor RFC ou atualizar `architecture.md` |
| Regra de negócio surge | Perguntar se documenta na skill/docs |
| Bug revela comportamento não-documentado | Propor documentar |
| Nova integração | Avaliar nova skill ou expansão |
| Sessão pausada com trabalho | Atualizar `STATE.md` |

**Protocolo de encerramento:**

Ao final de sessão com mudanças, o agente:

1. Lista mudanças de comportamento no código
2. Identifica skills/docs afetadas
3. Pergunta: *"As seguintes documentações precisam atualização: [lista]. Atualizo agora?"*

Cria hábito sem ser intrusivo — não atualiza automaticamente, mas tampouco passa sem avisar.

**O agente como guardião da documentação:** com `CONVENTIONS.md` no contexto, identifica ativamente quando código contradiz docs e reporta — mesmo sem ser pedido.

---

## 10. Padrão Anthropic dos Três Agentes

Para tarefas longas, separar em sub-agents:

- **Planner** decompõe spec em tasks (não executa)
- **Generator** implementa tasks (não decide)
- **Evaluator** valida output contra spec (não consulta histórico de implementação)

Aplicação no framework:

- `PLANNER.md` orquestra fases (não cria artefatos)
- Cada `PHASE-N.md` gera artefatos (não decide a próxima fase)
- `PHASE-5-VALIDATION.md` valida (não corrige sem confirmação)

Esta separação evita o problema clássico onde o agente começa a "ajustar" decisões enquanto implementa, perdendo o caminho original.

---

## 11. Cenários de Uso (exemplos)

### Cenário 1 — Implementar integração

```text
Dev: "Implemente o envio de dados para a API X"

Startup: Agente lê INSTRUCTIONS.md, identifica via frontmatter
         que skills api-integration e field-mapping são relevantes.

Trigger: Lê os 2 SKILL.md (~80 linhas total). Sabe endpoints,
         fluxo de normalização, padrão de retry.

On-demand: Precisa do payload completo → lê API-REFERENCE.md.
           Precisa da tabela de mapeamento → lê MAPPING-TABLE.md.

Total: ~400 linhas, vs ~2.000+ se tudo estivesse em arquivo monolítico.
```

### Cenário 2 — Nova feature

```text
Dev: "Adicione suporte para processar dados de marketplace"

1. Agente lê skill de coleta → entende padrão existente
2. Lê architecture-patterns.md → sabe como criar strategies
3. Lê code-style.md → segue convenções de naming
4. Lê guia detalhado → entende paginação, dedup, enriquecimento

Resultado: implementa seguindo padrões sem perguntar.
```

### Cenário 3 — Multi-IDE

Dev novo usa Windsurf enquanto time usa Cursor. Sem configuração adicional, Windsurf lê `AGENTS.md` (symlink para `.ai/INSTRUCTIONS.md`) e skills em `.agents/skills/` (symlink para `.ai/skills/`). Recebe exatamente o mesmo contexto.


---

## 5. ACE — Memory as Evolving Playbook

> Baseado em: **Agentic Context Engineering** (arxiv 2510.04618). +10.6% em benchmarks de agentes, +8.6% em finanças.

A abordagem ACE trata `STATE.md` como um **playbook que se auto-curada** — não como log de histórico. Três operações por sessão:

| Operação | O que faz | Frequência |
| --------- | --------- | ---------- |
| **Generation** | Adiciona novo aprendizado, decisão, blocker | A cada sessão com mudança |
| **Reflection** | Identifica o que está resolvido ou obsoleto | A cada sessão |
| **Curation** | Remove o obsoleto, eleva o útil | A cada sessão |

**Regras de curação:**

- STATE.md ≤ 80 linhas → se maior, algo não foi removido
- Uma entrada em "Lições Aprendidas" só entra se é *não-óbvia* — insights que um dev novo não saberia
- "Deferred" é a lixeira organizada — ideia que não morre, mas não bloqueia

**Por que funciona:** impede o problema documentado no Spec Kit issue #75 — specs que crescem indefinidamente geram ruído, não contexto. Contexto curado > contexto volumoso.

---

## 6. K-Trial Reliability

> Baseado em: **ReliabilityBench** (arxiv 2601.06112). pass@1 superestima confiabilidade em 20-40%.

Em vez de medir apenas "o agente passou nesta task?", o AXIS recomenda medir consistência:

| Métrica | O que mede | Como aplicar |
| ------- | ---------- | ------------ |
| **pass@1** | Passou na primeira tentativa | Baseline — não usar sozinho |
| **pass@k** | Passou em k execuções independentes | Smoke test 3x o mesmo fluxo |
| **ε-robustness** | Passou com variação no input | Testar com ligeira reformulação do pedido |

**Protocolo mínimo para smoke test na Fase 5:**

```bash
# Rodar 3x o mesmo comando de bootstrap em projeto de teste
# Se o resultado for idêntico nas 3 runs: confiável
# Se variar: documentar o ponto de variação em STATE.md como blocker
```

**Sinal de alerta:** se a estrutura gerada varia entre sessões, o harness está sub-configurado — provavelmente falta template explícito ou acceptance criteria na skill.

---

## 7. Spec Testável (Anti-Verbosity)

> Baseado em: GitHub Spec Kit issue #75 ("creates illusion of work") e ReliabilityBench findings.

Specs longas não são melhores specs. AXIS impõe:

| Artefato | Limite | Consequência de exceder |
| -------- | ------ | ----------------------- |
| `INSTRUCTIONS.md` | 100-180 linhas | Contexto carregado sempre — ruído direto |
| `SKILL.md` | ≤ 60 linhas | Indexado sempre — cada linha custa token |
| `STATE.md` | ≤ 80 linhas | Lido no início de cada sessão — deve ser focado |

**Critério de testabilidade de uma spec:** um item de spec é testável se você pode responder "como eu saberia que o agente seguiu isso?". Se não consegue responder, o item é muito vago.

Exemplos:

| Vago (ruído) | Testável (sinal) |
| ----------- | ---------------- |
| "Siga boas práticas" | "Use `createQueryBuilder` para bulk insert >100 registros" |
| "Documente decisões importantes" | "Crie RFC para qualquer decisão que altere arquitetura" |
| "Seja cuidadoso com dados" | "Nunca executar `DROP` ou `TRUNCATE` sem confirmação explícita" |
