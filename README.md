# Site de rotina acadêmica

Site estático (HTML, CSS e JS puro — sem instalação, sem build) para organizar sua rotina de faculdade.

Cada página (`index.html`, `disciplinas.html`, `anotacoes.html`, `estudos.html`) é **autossuficiente**: todo o estilo e o código já estão dentro do próprio arquivo. Isso significa que você pode abrir qualquer uma delas sozinha (sem depender de outro arquivo) que ela funciona e mantém a cor certinha.

## Páginas
- `index.html` — semana atual (segunda a domingo), com disciplinas por dia, aprendizados, resumos e tarefas extras
- `disciplinas.html` — cadastro de disciplinas (sala, professor, ementa)
- `anotacoes.html` — bloco de anotações livres (uma caixa de texto solta pra você escrever qualquer coisa) + calculadora
- `estudos.html` — assuntos que você estuda fora da faculdade (Python, Java, C++, inglês, etc.)
- `ajuda.html` — guia de ajuda com explicação do site, passo a passo e dicas de acessibilidade
- `sugestoes.html` — formulário de sugestões e dúvidas (estilo "novo e-mail"), que abre o app de e-mail do visitante com a mensagem pronta
- `creditos.html` — página de créditos com uma bio sobre você

O site tem 3 idiomas: português, inglês e espanhol — clique no botão de idioma (🌐) no topo de cada página pra escolher. A escolha fica salva no navegador.

Os arquivos `styles.css` e `app.js` ficam aqui só como referência/backup do código-fonte — não são necessários para o site funcionar, já que tudo já está copiado dentro de cada página.

## Importante: configure seu e-mail na página de Sugestões
Em `sugestoes.html`, procure a linha:
```js
const DESTINO_EMAIL = "SEU_EMAIL_AQUI@gmail.com";
```
Troque pelo seu e-mail de verdade — é pra lá que as mensagens dos visitantes vão (via `mailto:`, abrindo o app de e-mail deles).

Os dados ficam salvos no `localStorage` do navegador — ou seja, **cada navegador/dispositivo tem os seus próprios dados**. Isso é ótimo para privacidade (nada é enviado a nenhum servidor), mas significa que o site não sincroniza sozinho entre celular e computador.

## Como publicar no GitHub Pages

1. Crie um repositório novo no GitHub (ex.: `minha-rotina`).
2. Suba os 7 arquivos `.html` para a raiz do repositório (`index.html`, `disciplinas.html`, `anotacoes.html`, `estudos.html`, `ajuda.html`, `sugestoes.html`, `creditos.html`).
3. No repositório, vá em **Settings → Pages**.
4. Em "Branch", selecione `main` e a pasta `/root`, depois **Save**.
5. Em alguns minutos o site estará em `https://SEU_USUARIO.github.io/minha-rotina/`.

## Como editar depois
Direto pelo GitHub: abra o arquivo, clique no lápis (editar), faça a alteração e "Commit changes". O site atualiza sozinho em 1–2 minutos.

Coisas fáceis de mudar:
- **Nome do site**: dentro de cada página `.html`, procure `const SITE_NAME` (é a mesma linha nas 7 páginas — troque em todas).
- **Cores dos dias**: dentro de cada página, no `<style>`, variáveis `--seg`, `--ter`, etc.
- **Assuntos padrão de estudos extras**: em `estudos.html`, array `DEFAULT_TOPICS`.

## Importante
Como os dados ficam no navegador (localStorage), evite limpar o cache/dados do site — isso apagaria as informações salvas.
