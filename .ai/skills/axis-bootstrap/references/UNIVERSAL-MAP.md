# Universal Map — Técnico ↔ Não-Técnico

O framework foi originalmente concebido para projetos de software, mas suas três camadas (Spec, Harness, Memory) são **agnósticas de domínio**. Este documento mapeia conceitos técnicos para equivalentes universais, permitindo aplicação a qualquer tipo de projeto.

---

## Princípio de Tradução

| Camada | Universalidade | O que muda |
| ------ | -------------- | ---------- |
| **Spec** | 100% universal | Apenas vocabulário (rules → protocolos) |
| **Harness** | ~70% universal | Hooks de lint/test não se aplicam; permissões e bloqueios sim |
| **Memory** | 100% universal | Idêntico — STATE, RFCs, CONVENTIONS funcionam igual |

A camada que mais varia é a **Harness**, e mesmo lá o núcleo (versionamento de comportamento, bloqueio destrutivo, sub-agents) se mantém.

---

## Mapeamento Conceito a Conceito

| Conceito Técnico | Equivalente Universal |
| ---------------- | --------------------- |
| Stack tecnológica | Ferramentas e plataformas |
| Linguagem de programação | Formato de output (markdown, planilha, deck) |
| Framework | Metodologia (PBL, BSC, OKR, ABNT) |
| Banco de dados | Repositório de dados (planilha, CMS, base de fontes) |
| API externa | Fonte oficial / stakeholder / fornecedor |
| Rules de código | Protocolos de qualidade |
| Code style | Tom de voz / formatting |
| Test suite | Critérios de validação |
| CI/CD | Pipeline de revisão / aprovação |
| Hook de lint | Checklist automático |
| Hook de bloqueio | Validação pré-publicação |
| Branches/commits | Versões / revisões |
| PR review | Revisão por pares |
| Bug | Inconsistência / erro factual |
| Refactoring | Reorganização / clarificação |
| Deploy | Publicação / entrega |
| Production | Ambiente final / cliente |

---

## Aplicação por Tipo de Projeto

### Pesquisa Acadêmica

```text
.ai/
├── INSTRUCTIONS.md         (pergunta de pesquisa, metodologia, prazo)
├── skills/
│   ├── metodologia/        (qual método, por quê)
│   ├── coleta-dados/       (fontes, como acessar, como tratar)
│   ├── analise/            (técnicas, fórmulas, software)
│   ├── redacao-academica/  (estrutura, citações, tom)
│   └── revisao/            (checklist de validação)
├── rules/  (renomeada protocols/)
│   ├── citacoes-abnt.md
│   ├── estrutura-paper.md
│   └── reproducibilidade.md
└── docs/
    ├── glossary.md         (termos técnicos do campo)
    ├── fontes.md           (bibliografia anotada)
    ├── STATE.md            (decisões metodológicas, dados coletados, lacunas)
    └── RFC/RFC-001-*.md    (decisão de método)
```

**Hooks aplicáveis:**
- ✅ Bloqueio destrutivo (universal)
- ✅ Validação de citações antes de exportar
- ❌ Lint de código (não aplica)

---

### Conteúdo / Marketing / Docs Técnicas

```text
.ai/
├── INSTRUCTIONS.md         (público, canais, calendário)
├── skills/
│   ├── tom-de-voz/         (exemplos, palavras-chave a evitar)
│   ├── estrutura-artigo/   (intro, dev, fechamento; tamanhos)
│   ├── seo/                (keywords, meta, structure)
│   ├── fact-checking/      (fontes confiáveis, processo)
│   └── editorial/          (revisão, aprovações)
├── rules/
│   ├── style-guide.md      (capitalização, formatação, listagens)
│   └── compliance.md       (LGPD, claims regulados, disclaimers)
└── docs/
    ├── glossary.md
    ├── personas.md
    ├── STATE.md            (calendário editorial, drafts, em revisão)
    └── RFC/                (decisões de tom, posicionamento)
```

**Hooks aplicáveis:**
- ✅ Bloqueio destrutivo
- ✅ Spell check / lint markdown
- ✅ Validação de links quebrados
- ❌ Test runner (não aplica)

---

### Business / Gestão

```text
.ai/
├── INSTRUCTIONS.md         (objetivo, stakeholders, frameworks adotados)
├── skills/
│   ├── relatorio-executivo/  (estrutura, audiência, nível)
│   ├── analise-swot/         (template, perguntas-guia)
│   ├── okrs/                 (definição, tracking, review)
│   ├── apresentacao-deck/    (princípios visuais, narrativa)
│   └── analise-financeira/   (DRE, indicadores, projeções)
├── rules/
│   ├── tom-para-diretoria.md
│   └── confidencialidade.md
└── docs/
    ├── glossary.md           (termos do negócio)
    ├── stakeholders.md       (mapa, expectativas)
    ├── STATE.md              (deals em andamento, OKRs do trimestre)
    └── RFC/                  (decisões estratégicas)
```

---

### Legal / Compliance

```text
.ai/
├── INSTRUCTIONS.md         (jurisdição, áreas, riscos críticos)
├── skills/
│   ├── redacao-contratual/  (cláusulas, padrões)
│   ├── analise-clausulas/   (riscos, ambiguidades)
│   ├── compliance-lgpd/     (DPIA, base legal, direitos)
│   └── pareceres/           (estrutura, fundamentação)
├── rules/
│   ├── linguagem-juridica.md
│   ├── citacao-jurisprudencia.md
│   └── confidencialidade.md  (rule crítica para LLMs)
└── docs/
    ├── glossary.md
    ├── jurisprudencias.md    (precedentes relevantes)
    ├── STATE.md              (casos ativos, prazos)
    └── RFC/                  (decisões de tese, estratégia)
```

**Hooks especialmente relevantes:**
- ✅ Bloqueio de envio acidental de informação confidencial
- ✅ Validação de citações legais antes de exportar

---

### Educacional

```text
.ai/
├── INSTRUCTIONS.md         (público, nível, metodologia, BNCC se K-12)
├── skills/
│   ├── design-instrucional/ (Bloom, ADDIE, modelos)
│   ├── plano-aula/          (estrutura, objetivos, atividades)
│   ├── avaliacao/           (questões, rubricas, validação)
│   └── linguagem-nivel/     (adaptar para idade/conhecimento)
├── rules/
│   ├── inclusao-acessibilidade.md
│   └── padrao-pedagogico.md
└── docs/
    ├── personas-aluno.md
    ├── STATE.md
    └── RFC/                  (decisões metodológicas)
```

---

## Quando NÃO Usar o Framework

Independente do tipo:

- **Trabalho descartável** (1 dia, sem continuidade) — overhead > ganho
- **Solo + 1 ferramenta + 1 sessão** — `CLAUDE.md` monolítico resolve
- **Sem expectativa de evolução** — memória e specs perdem sentido
- **Domínio puramente criativo sem padrões** (ex: arte livre) — restrições atrapalham

**Use quando:**
- 3+ pessoas (humanos ou agentes) compartilham o trabalho
- Mais de uma IDE/ferramenta envolvida
- Domínio tem regras, normas, ou padrões que devem ser respeitados
- Continuidade entre sessões é importante (semanas ou meses)
- Há custo real de inconsistência (compliance, marca, qualidade)

---

## Adaptações Comuns

### Substituições de pasta

| Tradicional | Alternativa universal |
| ----------- | --------------------- |
| `.ai/rules/` | `.ai/protocols/` |
| `.ai/docs/architecture.md` | `.ai/docs/components.md` |
| `.ai/docs/database-schema.md` | `.ai/docs/data-model.md` ou `.ai/docs/sources.md` |
| `setup-ide-links.sh` | mantém o nome — ainda relevante |

### Hooks que sempre valem

- **Bloqueio de comandos destrutivos** — universal
- **Versionamento de `settings.json`** no git — universal

### Hooks que dependem do domínio

- Lint/format → existe para markdown, planilhas (validators), CSS, JSON, YAML — adaptar conforme o output
- Test runner → existe como "validador de output" para qualquer artefato (link checker, schema validator, fact-checker)

---

## Princípio Final

A camada **Spec** descreve **o que o domínio é**.
A camada **Harness** garante **comportamento consistente** independente do domínio.
A camada **Memory** preserva **continuidade** independente do domínio.

Os três conceitos não dependem de programação — dependem de qualquer atividade humana com **conhecimento estruturado**, **padrões repetíveis** e **continuidade no tempo**. O framework é universal porque essas três propriedades são universais.
