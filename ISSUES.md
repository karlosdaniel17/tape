# Backlog de Issues — Tape

Issues redigidas e prontas pra criar no GitHub (colar manualmente, ou usar os comandos
`gh` no final do arquivo se você tiver a CLI instalada). Atualize esse arquivo conforme
as Issues forem sendo criadas/fechadas.

---

## Issue #1 — [melhoria] Novo logo com identidade indígena

**Label:** `melhoria`

**Descrição:**
O logo atual (montanha estilizada + sol, cores terrosas) deve ser substituído por uma
versão mais elaborada, mantendo a essência indígena — sem cair em estereótipo genérico
(sem cocar/pena de forma decorativa vazia). Referências propostas, ligadas à identidade
real do autor (povo Xukuru do Ororubá, Pesqueira-PE):

- Opção A — Montanha + sol nascente, referenciando a Serra do Ororubá
- Opção B — Mandala geométrica de chevrons/trama trançada (padrão de cestaria/pintura
  corporal)
- Opção C — Versão refinada do logo atual, com a paleta atualizada pro estilo "Caderno
  de Engenharia"

**Critério de pronto:** 3 opções em SVG apresentadas, uma escolhida, aplicada nas 15
páginas (função `renderNav`/brand, compartilhada).

---

## Issue #2 — [melhoria] Motion design nas páginas restantes

**Label:** `melhoria`

**Descrição:**
O sistema de motion (tokens de duração/curva, `prefers-reduced-motion`, fade-in de
página, feedback de toque em botões, toast com entrada/saída suaves) já está em
`auth.js` e vale pra todas as páginas. As páginas **Exercícios**, **Trilhas** e
**Programação** já receberam tratamento fino (listas em cascata, revelações suaves,
skeleton/loading da matemática). As outras 12 páginas (Semana, Disciplinas, Anotações,
Estudos extras, Aulas, Fórmulas, Foco, Calculadora, Perfil, Ajuda, Sugestões, Créditos)
só têm a base compartilhada.

**Critério de pronto:** aplicar o mesmo nível de detalhe (listas em cascata onde fizer
sentido, revelações suaves em vez de show/hide instantâneo, estados de carregamento)
nas 12 páginas restantes.

---

## Como criar essas Issues via `gh` CLI

Se você tiver a [GitHub CLI](https://cli.github.com/) instalada e autenticada
(`gh auth login`), rodando dentro da pasta do repositório:

```bash
gh issue create \
  --title "[melhoria] Novo logo com identidade indígena" \
  --label "melhoria" \
  --body "Ver ISSUES.md — Issue #1 para descrição completa."

gh issue create \
  --title "[melhoria] Motion design nas páginas restantes" \
  --label "melhoria" \
  --body "Ver ISSUES.md — Issue #2 para descrição completa."
```

Se as labels `correção`, `melhoria` e `nova função` ainda não existirem no repositório,
crie primeiro:

```bash
gh label create "correção" --color "D73A4A" --description "Algo quebrado ou com bug"
gh label create "melhoria" --color "A2EEEF" --description "Algo existente que pode ficar melhor"
gh label create "nova função" --color "0E8A16" --description "Funcionalidade que ainda não existe"
```
