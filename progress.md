# sens.legal — Progress

## 2026-03-03

### Issues resolvidas

#### SEN-374 — Corrigir números do KG no portal (bug, XS)
Os números do Knowledge Graph do Valter estavam desatualizados em todo o portal.

**Antes → Depois:**
- Decisões: 28.000 → **12.091**
- Nós: 28.000 → **53.870**
- Edges: 207.000+ → **194.496**

**Arquivos alterados (12):**
- `index.astro` (EN + PT-BR)
- `architecture.astro` (EN + PT-BR)
- `about.astro` (EN + PT-BR)
- `use-cases/argument.astro` (EN + PT-BR)
- `use-cases/search.astro` (EN + PT-BR)
- `projects/valter.astro` (EN + PT-BR)

---

#### SEN-377 — Corrigir stack do Leci em projects.ts (bug, XS)
O Leci estava com a stack da documentação ao invés da stack real do projeto.

**Antes:** `['Astro', 'Starlight', 'TypeScript']`
**Depois:** `['Next.js', 'PostgreSQL', 'pgvector', 'Railway', 'TypeScript']`

**Arquivo alterado:** `portal/src/data/projects.ts`

---

#### SEN-378 — Adicionar Douto ao Contributing (bug, XS)
O Douto estava ausente das páginas Contributing, gerando inconsistência com o resto do portal.

**Adicionado em:**
- Seção "Getting Started" / "Como Começar"
- Seção "Repositories" / "Repositórios"
- Seção "Areas Where We Need Help" / "Áreas Onde Precisamos de Ajuda"

A página PT-BR também ganhou a seção "Repositórios" que estava faltando, trazendo paridade com a versão EN.

**Arquivos alterados:** `contributing.astro` (EN + PT-BR)

---

### Issues pendentes

| Issue   | Tipo    | Esforço | Status                           |
| ------- | ------- | ------- | -------------------------------- |
| SEN-375 | feature | XS      | Aguardando confirmação do email  |
| SEN-376 | feature | XS      | Aguardando aprovação do texto    |
| SEN-379 | feature | M       | Aguardando decisão de CTA        |
| SEN-380 | bug     | M       | Aguardando decisão de arquitetura |
