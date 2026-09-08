# AGENTS.md — Tape (caderno acadêmico)

Este arquivo define como qualquer agente (humano ou IA, de qualquer modelo — Claude,
GPT, Copilot, etc.) deve trabalhar neste repositório. **Leia isto antes de implementar
qualquer mudança.**

## Sobre o projeto

Site estático (HTML + CSS + JS puro, sem build step), hospedado no GitHub Pages em
`karlosdaniel17.github.io/tape`. Sincronização de dados via Firebase (Auth + Firestore).
Não há framework — cada página é um `.html` autocontido, com CSS e JS inline no próprio
arquivo. `auth.js` é compartilhado por todas as páginas (autenticação, tema claro/escuro,
gamificação/XP, animações globais).

## Fluxo de trabalho obrigatório

### 1. Toda tarefa começa como uma Issue

Antes de implementar qualquer coisa, abra uma Issue descrevendo a tarefa. Toda Issue
recebe **exatamente uma** das três labels abaixo:

| Label | Quando usar |
|---|---|
| `correção` | Algo está quebrado, com bug, ou não funciona como deveria |
| `melhoria` | Algo já existe e funciona, mas pode ficar melhor (visual, performance, UX) |
| `nova função` | Uma funcionalidade que ainda não existe no site |

Título da Issue: `[categoria] descrição curta` — ex.: `[melhoria] Logo com identidade
indígena mais elaborada`.

### 2. Entregas via Pull Request

Nenhuma mudança vai direto pra branch principal. Toda entrega é um Pull Request que:

- **Referencia a Issue relacionada** (ex.: `Closes #12` ou `Relacionado à #12`)
- **Explica o que mudou** — lista objetiva dos arquivos/comportamentos alterados
- **Descreve como foi validado** — o que foi testado e como (ex.: "sintaxe JS validada
  com `node --check` em todas as páginas afetadas; testado manualmente no Chrome
  desktop nos temas claro e escuro")
- **Registra riscos, limitações e próximos passos** — o que pode quebrar, o que ficou
  de fora do escopo, o que ainda precisa ser feito depois

Modelo de descrição de PR:

```markdown
Relacionado à #<número da issue>

## O que mudou
- ...

## Como foi validado
- ...

## Riscos e limitações
- ...

## Próximos passos
- ...
```

### 3. Sem ferramentas de CI/build

Não há testes automatizados nem pipeline de build. "Validação" aqui significa, no
mínimo:
- Sintaxe JS de cada `<script>` verificada (ex.: `node --check`)
- Chaves `{}` de cada `<style>` balanceadas
- Navegação entre as páginas conferida (todo `.html` deve linkar pra todos os outros)
- Teste visual manual nos temas claro e escuro antes de considerar pronto

## Convenções do código

- Variáveis CSS de tema (`--paper`, `--ink`, `--card`, `--overlay`, `--overlay-2`,
  `--line`, `--pauta`) — nunca usar cor fixa (`#fff`, `background: white` etc.) em
  elementos que precisam se adaptar ao tema escuro. Exceções conscientes (papel de
  gráfico, editor de código) devem ficar comentadas no CSS.
- Tema escuro/claro é controlado por `data-theme="escuro"/"claro"` no `<html>`,
  gerenciado pelo `auth.js`. Qualquer variável de cor nova precisa de um par de valor
  claro/escuro.
- Gamificação (XP, nível, streak) é global — usar `window.ganharXP(xp)` e
  `window.tapeRegistrarAcao(id)`, sempre protegido com `if (window.ganharXP)` já que
  `auth.js` carrega como módulo e pode não estar pronto ainda.
- Motion/animação: usar os tokens já definidos no `auth.js`
  (`--dur-fast/base/slow`, `--ease-out`, `--ease-in-out`) em vez de valores soltos, e
  respeitar `prefers-reduced-motion` (já tratado globalmente).
- i18n (PT/EN/ES): páginas que usam o sistema de tradução (`const I18N = {...}`,
  função `t()`) precisam ter a chave presente nos 3 idiomas — nunca só em português.

## Backlog / Issues conhecidas no momento

Ver `ISSUES.md` para a lista de tarefas pendentes já redigidas.
