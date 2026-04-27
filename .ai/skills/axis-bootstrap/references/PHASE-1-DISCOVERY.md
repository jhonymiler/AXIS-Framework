# Phase 1 — Discovery

**Objetivo:** entender o projeto profundamente o suficiente para gerar uma spec correta na Fase 2 sem precisar voltar.

**Duração típica:** 5-15 minutos de entrevista.

**Output desta fase:** um *Project Profile* mental (ou rascunho em texto) cobrindo tipo, ferramentas, domínios, restrições, qualidade-alvo e IDEs.

---

## Princípio: Ler antes de Perguntar

Antes da primeira pergunta, o agente:

1. Lista os arquivos do projeto-alvo (até 2 níveis de profundidade)
2. Lê `README.md`, `package.json`/`pyproject.toml`/equivalente, e qualquer arquivo de IA pré-existente (`CLAUDE.md`, `AGENTS.md`)
3. Identifica a stack se possível
4. **Só então pergunta** — e nunca pergunta o que já consta nos arquivos

Isso reduz fricção e demonstra atenção ao contexto.

---

## Bloco 1 — Perguntas Universais (sempre fazer)

```text
1. Em uma frase: o que esse projeto faz e para quem?
2. É um projeto de software, ou de outro tipo (conteúdo, pesquisa, business, legal, educacional)?
3. Quantas pessoas vão trabalhar nele e por quanto tempo?
4. Quais agentes/IDEs estarão em uso? (Claude Code, Cursor, Windsurf, Copilot, outros)
5. Existem restrições críticas? (compliance, deadline, budget, segurança)
```

Confirme as respostas em um resumo antes de avançar para o Bloco 2.

---

## Bloco 2 — Ramificação por Tipo

Use a resposta da pergunta 2 para escolher o sub-bloco abaixo. Pode aplicar mais de um se o projeto é híbrido (ex: research + content).

### Se SOFTWARE

```text
6a. Qual a stack principal? (linguagem, framework, runtime)
7a. Como o projeto roda? (comando exato — npm run dev, python main.py, go run, etc.)
8a. Há banco de dados, fila, cache, ou serviços externos?
9a. Há padrão de arquitetura adotado? (DI, hexagonal, monolito, microservices, MVC, etc.)
10a. Existem testes? Que framework? Cobertura de quê?
11a. Existe CI/CD? Onde? (GitHub Actions, GitLab CI, etc.)
12a. Quais 3-5 áreas/módulos do código têm regras específicas que merecem virar skill?
```

### Se CONTEÚDO (artigos, marketing, docs técnicas)

```text
6b. Qual o formato e canal de distribuição? (blog, LinkedIn, newsletter, livro, video script)
7b. Tom de voz e público-alvo?
8b. Há guideline de SEO, branding ou estilo já estabelecido?
9b. Como é o fluxo? (briefing → rascunho → revisão → publicação)
10b. Quais skills ajudariam? (ex: "tom de voz", "estrutura de artigo", "SEO checklist", "fact-checking")
```

### Se PESQUISA / ACADÊMICO

```text
6c. Qual a disciplina e a pergunta de pesquisa central?
7c. Que metodologia? (qualitativa, quantitativa, experimental, revisão)
8c. Que artefatos serão produzidos? (paper, dataset, código de análise, slides)
9c. Quais normas/convenções? (ABNT, APA, MLA; formato de citação)
10c. Quais skills? (ex: "metodologia", "coleta de dados", "análise estatística", "redação acadêmica")
```

### Se BUSINESS / GESTÃO

```text
6d. Qual o objetivo? (planejamento estratégico, OKRs, relatórios, análise de mercado)
7d. Quais são os artefatos esperados? (deck, relatório, planilha, BSC)
8d. Quem são os stakeholders e qual nível técnico?
9d. Há frameworks adotados? (OKR, BSC, lean canvas, SWOT)
10d. Quais skills? (ex: "estrutura de relatório executivo", "análise SWOT", "tom de voz para diretoria")
```

### Se LEGAL / COMPLIANCE

```text
6e. Qual jurisdição e área? (trabalhista, tributário, LGPD, contratual)
7e. Quais artefatos? (contratos, pareceres, DPIA, políticas)
8e. Há templates oficiais a seguir?
9e. Quais riscos críticos a evitar?
10e. Quais skills? (ex: "redação contratual", "análise de cláusulas", "checklist de compliance")
```

### Se EDUCACIONAL

```text
6f. Qual o público-alvo e nível?
7f. Quais artefatos? (curso, plano de aula, material didático, avaliação)
8f. Há metodologia pedagógica? (PBL, BNCC, Bloom, sala invertida)
9f. Quais skills? (ex: "design instrucional", "elaboração de avaliação", "linguagem para nível X")
```

### Se OUTRO

Aplique princípios de [UNIVERSAL-MAP.md](UNIVERSAL-MAP.md) e adapte. Em última análise, toda atividade tem:

- Domínios de conhecimento (→ skills)
- Padrões de qualidade (→ rules)
- Artefatos finais (→ templates)
- Continuidade entre sessões (→ memory)

---

## Bloco 3 — Calibração de Qualidade

```text
13. Este é um proof-of-concept, MVP, ou produção?
14. Que nível de validação é aceitável? (vibe-check, revisão humana, gates automatizados, todos)
15. Há histórico de problemas que o framework deveria prevenir? (ex: "perdemos contexto sempre que muda o dev", "respostas da IA divergem entre IDEs")
```

A resposta calibra:

- Quantidade de hooks (mais validação = mais hooks)
- Rigor das rules (PoC tolera mais; produção exige específicas)
- Granularidade de skills (mais detalhe se domínio é regulado)

---

## Bloco 4 — Coleta de Regras de Negócio (crítico)

Para projetos com regras de negócio implícitas no código ou na cabeça do dev:

```text
16. Que decisões o agente provavelmente vai errar se não souber? (regras de negócio não-óbvias)
17. Há "pegadinhas" — comportamentos que parecem genéricos mas têm exceções específicas neste projeto?
18. Há algum termo de domínio que tem significado específico aqui (e o agente pode interpretar errado se assumir o sentido geral)?
```

**Estas três perguntas extraem o conhecimento mais valioso e mais difícil de obter posteriormente.** Não pule.

---

## Resumo e Gate

Apresente ao usuário um resumo no formato:

```markdown
## Project Profile

- **Tipo:** <um ou mais>
- **Stack/Ferramentas:** <lista>
- **Time:** <N pessoas, duração estimada>
- **IDEs:** <lista>
- **Restrições críticas:** <lista>
- **Qualidade-alvo:** <PoC/MVP/Produção>
- **Skills candidatas (3-7):** <lista com 1-linha de propósito cada>
- **Rules candidatas (3-7):** <lista com escopo>
- **Regras de negócio críticas a documentar:** <lista>

Está correto e completo? Algo a adicionar antes de prosseguir para a Fase 2?
```

**Não avance sem confirmação literal do usuário.**

---

## Antipadrões

- Perguntar tudo de uma vez (sobrecarrega o usuário)
- Aceitar respostas vagas ("é um projeto Node") sem aprofundar
- Pular o Bloco 4 (perde conhecimento crítico)
- Inferir tipo sem perguntar (ex: assumir software só porque há código)
- Avançar sem confirmação no gate
