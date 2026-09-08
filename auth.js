import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAnv0eey-idqfBf8hVLvQ-0IMtoF4RXnkc",
  authDomain: "tape-1717.firebaseapp.com",
  projectId: "tape-1717",
  storageBucket: "tape-1717.firebasestorage.app",
  messagingSenderId: "244010846598",
  appId: "1:244010846598:web:e704631b12d4137fdcc407"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Versão do site — mude só este número quando publicar uma atualização.
// Ele aparece automaticamente no rodapé de todas as páginas.
const TAPE_VERSION = "1.1";

// ---- Tema claro/escuro: aplica o mais cedo possível pra evitar "flash" de tela clara ----
const TAPE_THEME_KEY = "tape_tema";
function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
}
aplicarTema(localStorage.getItem(TAPE_THEME_KEY) || "claro");

(function injetarEstilosTema() {
  const style = document.createElement("style");
  style.id = "tapeThemeStyles";
  style.textContent = `
    /* ---------- Motion Principles (tokens + acessibilidade) ---------- */
    :root { --dur-fast: 120ms; --dur-base: 200ms; --dur-slow: 320ms; --ease-out: cubic-bezier(.16,1,.3,1); --ease-in-out: cubic-bezier(.65,0,.35,1); }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }
    }
    @keyframes tape-fade-up { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    main { animation: tape-fade-up var(--dur-slow) var(--ease-out); }

    /* feedback de toque em botões e opções clicáveis do site inteiro */
    button, .missao-btn, .concluir, .excluir, .code-runner-play, .ex-opcao, .modulo-actions button,
    .new-disc-btn, .toggle-novo-modulo-btn, .grafico-controles button, .logic-toggle, .code-runner-toggle,
    .ex-resolucao-btn, .eyebrow, .chip, .day-card, .disc-card {
      transition: transform var(--dur-fast) var(--ease-out), opacity var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
    }
    button:active:not(:disabled), .missao-btn:active:not(:disabled), .concluir:active:not(:disabled),
    .ex-opcao:active:not(:disabled), .code-runner-play:active, .new-disc-btn:active { transform: scale(0.96); }

    /* toast de XP / subida de nível */
    @keyframes tape-toast-in { from { opacity: 0; transform: translate(-50%, -14px) scale(0.96); } to { opacity: 1; transform: translate(-50%, 0) scale(1); } }
    @keyframes tape-toast-out { from { opacity: 1; transform: translate(-50%, 0) scale(1); } to { opacity: 0; transform: translate(-50%, -10px) scale(0.98); } }
    .tape-toast { animation: tape-toast-in var(--dur-base) var(--ease-out); }
    .tape-toast.tape-toast-saindo { animation: tape-toast-out var(--dur-base) var(--ease-in-out) forwards; }

    /* stagger-in genérico pra listas renderizadas via JS (aplicado com --i por item) */
    .tape-stagger-item { opacity: 0; animation: tape-fade-up var(--dur-base) var(--ease-out) forwards; animation-delay: calc(var(--i, 0) * 35ms); }
    :root[data-theme="escuro"] { --paper: #1C1B18; --ink: #F0EEE8; --line: #FFFFFF26; --card: #26241F; --overlay: #FFFFFF12; --overlay-2: #FFFFFF1C; --pauta: #FFFFFF0F; }
    [data-theme="escuro"] body { background: var(--paper); color: var(--ink); }
    [data-theme="escuro"] .topbar { background: var(--paper); border-color: var(--line); }
    [data-theme="escuro"] .day-card,
    [data-theme="escuro"] .disc-card,
    [data-theme="escuro"] .credits-card,
    [data-theme="escuro"] .upload-card,
    [data-theme="escuro"] .book-card,
    [data-theme="escuro"] .sci-display,
    [data-theme="escuro"] .calc-box,
    [data-theme="escuro"] .study-card,
    [data-theme="escuro"] .card,
    [data-theme="escuro"] .lang-menu { background: #26241F !important; }
    [data-theme="escuro"] input,
    [data-theme="escuro"] textarea,
    [data-theme="escuro"] select { background: #ffffff14 !important; color: var(--ink) !important; border-color: var(--line) !important; }
    [data-theme="escuro"] ::placeholder { color: #ffffff55 !important; }
    [data-theme="escuro"] .new-disc-btn,
    [data-theme="escuro"] .upload-btn,
    [data-theme="escuro"] .calc-grid button.op,
    [data-theme="escuro"] .sci-grid button.op { color: var(--paper) !important; }
    [data-theme="escuro"] .lang-toggle { background: #26241F !important; color: var(--ink) !important; border-color: var(--line) !important; }
    [data-theme="escuro"] .lang-menu button { background: transparent !important; color: var(--ink) !important; }
    [data-theme="escuro"] .lang-menu button:hover,
    [data-theme="escuro"] nav.mainnav a:hover { background: #ffffff14 !important; }
    [data-theme="escuro"] .calc-hist div:hover,
    [data-theme="escuro"] .sci-hist div:hover { background: #ffffff10 !important; }
    #tapeThemeToggle {
      display: inline-flex; align-items: center; justify-content: center;
      width: 38px; height: 38px; border-radius: 999px; border: 1px solid var(--line, #00000014);
      background: white; cursor: pointer; flex-shrink: 0; padding: 0;
      transition: background .15s ease, border-color .15s ease;
    }
    #tapeThemeToggle:hover { background: #00000008; }
    #tapeThemeToggle svg { width: 18px; height: 18px; display: block; }
    [data-theme="escuro"] #tapeThemeToggle { background: #26241F; border-color: #FFFFFF26; }
    [data-theme="escuro"] #tapeThemeToggle:hover { background: #ffffff10; }

    /* ---- Contraste de textos secundários no tema escuro ----
       Em quase todas as páginas, textos de apoio (menu, legendas, dicas,
       rótulos) usam opacity baixa (0.3–0.6) pensada pro tema claro, onde
       tinta escura sobre papel claro ainda fica legível. No tema escuro,
       a mesma opacity aplicada sobre tinta quase branca em fundo escuro
       fica cinza-lavado e difícil de ler. Aqui a gente reforça esses
       textos só no tema escuro, sem mudar nada no tema claro. */
    [data-theme="escuro"] .eyebrow,
    [data-theme="escuro"] .lead,
    [data-theme="escuro"] .tagline,
    [data-theme="escuro"] .legal,
    [data-theme="escuro"] .back-link,
    [data-theme="escuro"] .brand span.brand-tagline,
    [data-theme="escuro"] nav.mainnav a,
    [data-theme="escuro"] .lang-toggle .caret,
    [data-theme="escuro"] .zoom-btn,
    [data-theme="escuro"] .zoom-reset,
    [data-theme="escuro"] .field-label,
    [data-theme="escuro"] .field-toggle .ft-label,
    [data-theme="escuro"] .section-title,
    [data-theme="escuro"] .streak-label,
    [data-theme="escuro"] .credits-section-title,
    [data-theme="escuro"] .credits-foot,
    [data-theme="escuro"] .sched-empty,
    [data-theme="escuro"] .aula-empty,
    [data-theme="escuro"] .today-link,
    [data-theme="escuro"] .modal-hint,
    [data-theme="escuro"] .modal-box .modal-sub,
    [data-theme="escuro"] .compose-hint,
    [data-theme="escuro"] .compose-body label,
    [data-theme="escuro"] .formula-hint,
    [data-theme="escuro"] .lofi-hint,
    [data-theme="escuro"] .save-hint,
    [data-theme="escuro"] .data-item .label,
    [data-theme="escuro"] .config-item label,
    [data-theme="escuro"] .meta-sessao label,
    [data-theme="escuro"] .sci-modebar .mem-hint,
    [data-theme="escuro"] .progress-minutos,
    [data-theme="escuro"] .cycles-today,
    [data-theme="escuro"] .timer-mode,
    [data-theme="escuro"] .aula-item .aula-meta,
    [data-theme="escuro"] .task-row .task-when,
    [data-theme="escuro"] footer.foot,
    [data-theme="escuro"] #tapeCopyright,
    [data-theme="escuro"] #txtFooter,
    [data-theme="escuro"] .thanks,
    [data-theme="escuro"] .painel-titulo,
    [data-theme="escuro"] .tier-titulo,
    [data-theme="escuro"] .tier-badge,
    [data-theme="escuro"] .tier-cadeado,
    [data-theme="escuro"] .grafico-dica,
    [data-theme="escuro"] .nivel-titulo,
    [data-theme="escuro"] .modulo-pre,
    [data-theme="escuro"] .ex-progresso-texto,
    [data-theme="escuro"] .fases-progresso-texto,
    [data-theme="escuro"] .fases-sub,
    [data-theme="escuro"] .personagem-xp-texto,
    [data-theme="escuro"] .personagem-nivel,
    [data-theme="escuro"] .lead-prog,
    [data-theme="escuro"] .sub { opacity: 0.85 !important; }

    [data-theme="escuro"] .del-btn,
    [data-theme="escuro"] .rm,
    [data-theme="escuro"] .formula-card .rm,
    [data-theme="escuro"] .sched-item .rm,
    [data-theme="escuro"] .aula-item .rm,
    [data-theme="escuro"] .study-link-row .rm,
    [data-theme="escuro"] .avaliacao-row .rm-aval,
    [data-theme="escuro"] .calc-hist .hist-rm,
    [data-theme="escuro"] .sci-hist .hist-rm,
    [data-theme="escuro"] .task-row:hover .rm { opacity: 0.65 !important; }
  `;
  document.head.appendChild(style);
})();

// ---- Sistema de XP, Níveis, Streak e Missões diárias (gamificação) ----
const TAPE_XP_KEY = "tape_gamificacao";
const GAMIFICACAO_PADRAO = { xpTotal: 0, streakAtual: 0, melhorStreak: 0, ultimoDiaAtivo: null, missoes: null };

function carregarGamificacao() {
  try {
    const raw = localStorage.getItem(TAPE_XP_KEY);
    const dados = raw ? JSON.parse(raw) : null;
    return dados && typeof dados.xpTotal === "number" ? Object.assign({}, GAMIFICACAO_PADRAO, dados) : Object.assign({}, GAMIFICACAO_PADRAO);
  } catch (e) {
    return Object.assign({}, GAMIFICACAO_PADRAO);
  }
}
function salvarGamificacaoLocal(estado) {
  try { localStorage.setItem(TAPE_XP_KEY, JSON.stringify(estado)); } catch (e) {}
}

// ---- Datas (fuso local) ----
function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function isoDeData(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function ontemISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return isoDeData(d);
}

// ---- Streak (ofensiva diária) ----
// Conta como "dia ativo" quando o usuário completa algo que dá XP (exercício,
// missão, etc.) — não só por abrir o site, seguindo a mecânica pedida.
function registrarAtividadeHoje() {
  const hoje = hojeISO();
  if (gamificacao.ultimoDiaAtivo === hoje) return;
  gamificacao.streakAtual = gamificacao.ultimoDiaAtivo === ontemISO() ? (gamificacao.streakAtual || 0) + 1 : 1;
  gamificacao.melhorStreak = Math.max(gamificacao.melhorStreak || 0, gamificacao.streakAtual);
  gamificacao.ultimoDiaAtivo = hoje;
}

// XP acumulado necessário para COMPLETAR um nível (curva crescente:
// os primeiros níveis sobem rápido, os seguintes exigem mais XP).
function xpAcumuladoParaNivel(nivel) {
  return Math.round(100 * Math.pow(nivel, 1.5));
}
function calcularNivel(xpTotal) {
  let nivel = 1;
  while (xpTotal >= xpAcumuladoParaNivel(nivel)) nivel++;
  return nivel;
}
function progressoNivel(xpTotal) {
  const nivel = calcularNivel(xpTotal);
  const piso = nivel === 1 ? 0 : xpAcumuladoParaNivel(nivel - 1);
  const teto = xpAcumuladoParaNivel(nivel);
  const percentual = teto > piso ? Math.min(100, Math.max(0, Math.round(((xpTotal - piso) / (teto - piso)) * 100))) : 100;
  return { nivel, piso, teto, percentual, faltam: Math.max(0, teto - xpTotal) };
}

// ---- Missões diárias ----
// Pool fixo; 3 são escolhidas por dia (rotativo, sem precisar de servidor).
// Outras páginas chamam window.tapeRegistrarAcao("id_da_acao") quando o
// usuário faz algo relevante (ex.: completar um ciclo de foco).
const MISSOES_POOL = [
  { id: "visitar_paginas", texto: "Visitar 3 páginas diferentes do site", meta: 3, xp: 15 },
  { id: "foco_ciclo", texto: "Completar 1 ciclo de foco (pomodoro)", meta: 1, xp: 25 },
  { id: "anotacao", texto: "Escrever ou editar uma anotação", meta: 1, xp: 15 },
  { id: "disciplina", texto: "Cadastrar ou revisar uma disciplina", meta: 1, xp: 10 },
  { id: "aula", texto: "Cadastrar ou revisar uma aula", meta: 1, xp: 10 },
  { id: "trilha_modulo", texto: "Concluir 1 módulo de uma trilha", meta: 1, xp: 20 },
];
function garantirMissoesDeHoje() {
  const hoje = hojeISO();
  if (gamificacao.missoes && gamificacao.missoes.data === hoje) return;
  const diaDoAno = Math.floor((new Date(hoje) - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const ids = [0, 1, 2].map(i => MISSOES_POOL[(diaDoAno + i) % MISSOES_POOL.length].id);
  gamificacao.missoes = { data: hoje, ids, progresso: {}, resgatadas: [] };
}
function missoesDeHojeDefinicoes() {
  garantirMissoesDeHoje();
  return gamificacao.missoes.ids.map(id => MISSOES_POOL.find(m => m.id === id)).filter(Boolean);
}
// Chame de qualquer página: window.tapeRegistrarAcao("foco_ciclo")
window.tapeRegistrarAcao = function (idAcao, quantidade) {
  quantidade = quantidade || 1;
  garantirMissoesDeHoje();
  if (!gamificacao.missoes.ids.includes(idAcao)) return;
  if (gamificacao.missoes.resgatadas.includes(idAcao)) return;
  const missao = MISSOES_POOL.find(m => m.id === idAcao);
  if (!missao) return;
  gamificacao.missoes.progresso[idAcao] = (gamificacao.missoes.progresso[idAcao] || 0) + quantidade;
  if (gamificacao.missoes.progresso[idAcao] >= missao.meta) {
    gamificacao.missoes.resgatadas.push(idAcao);
    window.ganharXP(missao.xp);
    mostrarMissaoConcluida(missao);
  }
  salvarGamificacaoLocal(gamificacao);
  renderBarraXP();
};
function mostrarMissaoConcluida(missao) {
  const aviso = document.createElement("div");
  aviso.style.cssText = "position:fixed;top:16px;left:50%;transform:translateX(-50%);background:#3E7C8A;color:#F5F4F0;padding:12px 22px;border-radius:999px;font-weight:700;font-size:.9rem;z-index:999;box-shadow:0 8px 24px rgba(0,0,0,.25);";
  aviso.textContent = `✅ Missão concluída: ${missao.texto} (+${missao.xp} XP)`;
  document.body.appendChild(aviso);
  setTimeout(() => aviso.remove(), 3200);
}
// Rastreia visita a página (para a missão "visitar 3 páginas") uma vez por dia por página.
function registrarVisitaDePagina() {
  const hoje = hojeISO();
  const chave = "tape_paginas_visitadas_" + hoje;
  let lista = [];
  try { lista = JSON.parse(sessionStorage.getItem(chave) || "[]"); } catch (e) {}
  if (!lista.includes(location.pathname)) {
    lista.push(location.pathname);
    try { sessionStorage.setItem(chave, JSON.stringify(lista)); } catch (e) {}
    window.tapeRegistrarAcao("visitar_paginas", 1);
  }
}

let gamificacao = carregarGamificacao();
let cloudUidGamificacao = null;

function renderBarraXP() {
  const p = progressoNivel(gamificacao.xpTotal);

  // Trilha fininha fixa no topo da página inteira, mostrando o progresso do nível atual.
  let trilha = document.getElementById("tapeXpTrilha");
  if (!trilha) {
    trilha = document.createElement("div");
    trilha.id = "tapeXpTrilha";
    trilha.title = "Progresso do nível atual";
    trilha.style.cssText = "position:fixed;top:0;left:0;right:0;height:4px;background:rgba(0,0,0,0.08);z-index:60;";
    const preench = document.createElement("div");
    preench.id = "tapeXpPreenchimento";
    preench.style.cssText = "height:100%;width:0%;background:linear-gradient(120deg,#B5502E,#D9A441 55%,#C97B63);transition:width .4s ease;";
    trilha.appendChild(preench);
    document.body.prepend(trilha);
  }
  document.getElementById("tapeXpPreenchimento").style.width = p.percentual + "%";

  // Selo "Nível X" ao lado do botão de tema/idioma, no topo do site.
  const grupo = document.getElementById("tapeThemeLangGroup");
  if (grupo) {
    let selo = document.getElementById("tapeNivelSelo");
    if (!selo) {
      selo = document.createElement("div");
      selo.id = "tapeNivelSelo";
      selo.style.cssText = "font-size:.78rem;font-weight:700;padding:7px 13px;border-radius:999px;border:1px solid var(--line,#00000014);background:var(--card,#FFFCF5);color:var(--ink,#1A1712);white-space:nowrap;flex-shrink:0;";
      grupo.insertBefore(selo, grupo.firstChild);
    }
    selo.textContent = `🏅 Nível ${p.nivel}`;
    selo.title = `${gamificacao.xpTotal} XP total · faltam ${p.faltam} XP para o nível ${p.nivel + 1}`;

    // Selo de streak (ofensiva diária)
    let seloStreak = document.getElementById("tapeStreakSelo");
    if (!seloStreak) {
      seloStreak = document.createElement("div");
      seloStreak.id = "tapeStreakSelo";
      seloStreak.style.cssText = selo.style.cssText;
      grupo.insertBefore(seloStreak, selo.nextSibling);
    }
    seloStreak.textContent = `🔥 ${gamificacao.streakAtual || 0}`;
    seloStreak.title = `${gamificacao.streakAtual || 0} dia(s) seguidos · recorde: ${gamificacao.melhorStreak || 0} dia(s)`;

    renderPainelMissoes(grupo, seloStreak);
  }
}

function renderPainelMissoes(grupo, referencia) {
  const missoes = missoesDeHojeDefinicoes();
  const concluidas = missoes.filter(m => gamificacao.missoes.resgatadas.includes(m.id)).length;

  let botao = document.getElementById("tapeMissoesBotao");
  if (!botao) {
    botao = document.createElement("button");
    botao.id = "tapeMissoesBotao";
    botao.type = "button";
    botao.style.cssText = "font-size:.78rem;font-weight:700;padding:7px 13px;border-radius:999px;border:1px solid var(--line,#00000014);background:var(--card,#FFFCF5);color:var(--ink,#1A1712);white-space:nowrap;flex-shrink:0;cursor:pointer;position:relative;";
    grupo.insertBefore(botao, referencia.nextSibling);

    const painel = document.createElement("div");
    painel.id = "tapeMissoesPainel";
    painel.style.cssText = "position:absolute;top:calc(100% + 8px);right:0;background:var(--card,#FFFCF5);border:1px solid var(--line,#00000014);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.12);min-width:230px;padding:12px;display:none;z-index:70;text-align:left;";
    botao.appendChild(painel);

    botao.addEventListener("click", (e) => {
      e.stopPropagation();
      painel.style.display = painel.style.display === "block" ? "none" : "block";
    });
    document.addEventListener("click", () => { painel.style.display = "none"; });
  }
  botao.textContent = `🎯 ${concluidas}/${missoes.length}`;
  botao.title = "Missões de hoje";

  const painel = document.getElementById("tapeMissoesPainel");
  painel.innerHTML = `<div style="font-weight:800;font-size:.8rem;margin-bottom:8px;color:var(--ink,#1A1712)">Missões de hoje</div>`;
  missoes.forEach(m => {
    const feita = gamificacao.missoes.resgatadas.includes(m.id);
    const progresso = Math.min(m.meta, gamificacao.missoes.progresso[m.id] || 0);
    const linha = document.createElement("div");
    linha.style.cssText = "font-size:.78rem;padding:5px 0;color:var(--ink,#1A1712);" + (feita ? "opacity:.5;text-decoration:line-through;" : "");
    linha.textContent = `${feita ? "✅" : "⬜"} ${m.texto} (${progresso}/${m.meta}) · +${m.xp} XP`;
    painel.appendChild(linha);
  });
  botao.appendChild(painel);
}

function mostrarSubidaDeNivel(nivel) {
  const aviso = document.createElement("div");
  aviso.className = "tape-toast";
  aviso.style.cssText = "position:fixed;top:16px;left:50%;background:#26241F;color:#F5F4F0;padding:12px 22px;border-radius:999px;font-weight:700;font-size:.9rem;z-index:999;box-shadow:0 8px 24px rgba(0,0,0,.25);";
  aviso.textContent = `🎉 Você subiu para o Nível ${nivel}!`;
  document.body.appendChild(aviso);
  setTimeout(() => {
    aviso.classList.add("tape-toast-saindo");
    aviso.addEventListener("animationend", () => aviso.remove(), { once: true });
  }, 3000);
}

// Chame window.ganharXP(quantidade) de qualquer página (ex.: ao concluir um
// exercício, um módulo de trilha ou uma missão diária) para somar XP.
window.ganharXP = function (quantidade) {
  if (!quantidade || quantidade <= 0) return;
  const nivelAntes = calcularNivel(gamificacao.xpTotal);
  gamificacao.xpTotal += quantidade;
  registrarAtividadeHoje();
  salvarGamificacaoLocal(gamificacao);
  renderBarraXP();
  const nivelDepois = calcularNivel(gamificacao.xpTotal);
  if (nivelDepois > nivelAntes) mostrarSubidaDeNivel(nivelDepois);
  if (cloudUidGamificacao) salvarGamificacaoNaNuvem(gamificacao);
};

async function puxarGamificacaoDaNuvem(uid) {
  try {
    const ref = doc(db, "usuarios", uid, "dados", "gamificacao");
    const snap = await getDoc(ref);
    if (snap.exists() && typeof snap.data().xpTotal === "number") {
      gamificacao = Object.assign({}, GAMIFICACAO_PADRAO, snap.data());
      salvarGamificacaoLocal(gamificacao);
      renderBarraXP();
    } else {
      await setDoc(ref, gamificacao);
    }
  } catch (e) {
    console.error("tape: erro ao sincronizar gamificação", e);
  }
}
async function salvarGamificacaoNaNuvem(estado) {
  if (!cloudUidGamificacao) return;
  try {
    await setDoc(doc(db, "usuarios", cloudUidGamificacao, "dados", "gamificacao"), estado);
  } catch (e) {
    console.error("tape: erro ao salvar gamificação na nuvem", e);
  }
}
onAuthStateChanged(auth, (user) => {
  cloudUidGamificacao = user ? user.uid : null;
  if (cloudUidGamificacao) puxarGamificacaoDaNuvem(cloudUidGamificacao);
});

garantirMissoesDeHoje();
renderBarraXP();
registrarVisitaDePagina();

// ---- PWA: injeta manifest, ícone e service worker em toda página ----
(function setupPWA() {
  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement("link");
    link.rel = "manifest";
    link.href = "manifest.json";
    document.head.appendChild(link);
  }
  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    const appleIcon = document.createElement("link");
    appleIcon.rel = "apple-touch-icon";
    appleIcon.href = "apple-touch-icon.png";
    document.head.appendChild(appleIcon);
  }
  if (!document.querySelector('link[rel="icon"]')) {
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/png";
    favicon.href = "favicon-32.png";
    document.head.appendChild(favicon);
  }
  if (!document.querySelector('meta[name="theme-color"]')) {
    const theme = document.createElement("meta");
    theme.name = "theme-color";
    theme.content = "#F1E6CF";
    document.head.appendChild(theme);
  }
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(() => {});
    });
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("emailInput");
  const senhaInput = document.getElementById("senhaInput");
  const btnEntrar = document.getElementById("btnEntrar");
  const btnCadastrar = document.getElementById("btnCadastrar");

  // Botão Entrar (só existe em login.html)
  if (btnEntrar) {
    btnEntrar.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const senha = senhaInput.value;

      if (!email || !senha) {
        alert("Preencha o e-mail e a senha.");
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, email, senha);
        window.location.href = "index.html";
      } catch (erro) {
        if (erro.code === 'auth/invalid-email') {
          alert("E-mail inválido!");
        } else if (erro.code === 'auth/user-not-found' || erro.code === 'auth/wrong-password' || erro.code === 'auth/invalid-credential') {
          alert("E-mail ou senha incorretos.");
        } else {
          alert("Erro ao entrar: " + erro.message);
        }
      }
    });
  }

  // Botão Cadastrar (só existe em login.html)
  if (btnCadastrar) {
    btnCadastrar.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const senha = senhaInput.value;

      if (!email || !senha) {
        alert("Preencha o e-mail e a senha para cadastrar.");
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        alert("Conta criada com sucesso! Bem-vindo(a) " + userCredential.user.email);
        window.location.href = "index.html";
      } catch (erro) {
        if (erro.code === 'auth/invalid-email') {
          alert("E-mail inválido!");
        } else if (erro.code === 'auth/email-already-in-use') {
          alert("Este e-mail já está cadastrado. Clique no botão 'Entrar'!");
        } else if (erro.code === 'auth/weak-password') {
          alert("A senha deve ter pelo menos 6 caracteres.");
        } else {
          alert("Erro ao cadastrar: " + erro.message);
        }
      }
    });
  }

  const authBoxForApoio = document.getElementById("authBox");
  if (authBoxForApoio && !document.getElementById("linkApoie")) {
    const linkApoie = document.createElement("a");
    linkApoie.id = "linkApoie";
    linkApoie.href = "apoie.html";
    linkApoie.textContent = "💛 Contribua";
    linkApoie.style.cssText = "font-size:.82rem;font-weight:700;color:#B65C38;text-decoration:none;padding:6px 10px;";
    authBoxForApoio.insertBefore(linkApoie, authBoxForApoio.firstChild);
  }

  // Botão Sair: garante que apareça em TODAS as páginas que tenham #authBox,
  // criando o botão automaticamente quando ele não estiver no HTML da página.
  let btnSair = document.getElementById("btnSair");
  const authBox = document.getElementById("authBox");
  if (!btnSair && authBox) {
    btnSair = document.createElement("button");
    btnSair.id = "btnSair";
    btnSair.textContent = "Sair";
    btnSair.style.cssText = "background-color:#dc3545;color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-weight:bold;font-size:.82rem;";
    authBox.appendChild(btnSair);
  }
  if (btnSair) {
    btnSair.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        window.location.href = "login.html";
      } catch (erro) {
        alert("Erro ao sair: " + erro.message);
      }
    });
  }

  // Botão de tema claro/escuro: fica sempre agrupado junto do seletor de idioma,
  // mesmo quando a barra do topo quebra linha em telas estreitas.
  const ICON_SOL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.5M12 19v2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2.5 12H5M19 12h2.5M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>';
  const ICON_LUA = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.4 14.7A8.5 8.5 0 1 1 9.3 3.6a7 7 0 0 0 11.1 11.1Z"/></svg>';
  const langSwitch = document.getElementById("langSwitch");

  if (langSwitch && !document.getElementById("tapeThemeToggle")) {
    const btn = document.createElement("button");
    btn.id = "tapeThemeToggle";
    const temaAtual = localStorage.getItem(TAPE_THEME_KEY) || "claro";
    btn.innerHTML = temaAtual === "escuro" ? ICON_LUA : ICON_SOL;
    btn.style.color = temaAtual === "escuro" ? "#F0EEE8" : "#26241F";
    btn.title = "Alternar tema claro/escuro";
    btn.addEventListener("click", () => {
      const novo = document.documentElement.getAttribute("data-theme") === "escuro" ? "claro" : "escuro";
      aplicarTema(novo);
      localStorage.setItem(TAPE_THEME_KEY, novo);
      btn.innerHTML = novo === "escuro" ? ICON_LUA : ICON_SOL;
      btn.style.color = novo === "escuro" ? "#F0EEE8" : "#26241F";
    });

    // agrupa tema + idioma num contêiner só, pra eles nunca se separarem no wrap
    const grupo = document.createElement("div");
    grupo.id = "tapeThemeLangGroup";
    grupo.style.cssText = "display:flex;align-items:center;gap:10px;flex-shrink:0;";
    langSwitch.parentElement.insertBefore(grupo, langSwitch);
    grupo.appendChild(btn);
    grupo.appendChild(langSwitch);
  }

  // Rodapé com direitos autorais em todas as páginas
  if (!document.getElementById("tapeCopyright")) {
    const cp = document.createElement("div");
    cp.id = "tapeCopyright";
    cp.style.cssText = "text-align:center;font-size:11px;opacity:.4;padding:4px 20px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;";
    cp.textContent = `© 2026 tape v${TAPE_VERSION} · Todos os direitos reservados.`;
    document.body.appendChild(cp);
  }

  initCookieBanner();
  renderBarraXP();
});

// ---- Aviso de cookies + termos de uso (aparece em todas as páginas) ----
function initCookieBanner() {
  if (localStorage.getItem("tape_cookies_aceitos") === "1") return;
  if (document.getElementById("cookieBar")) return;

  const bar = document.createElement("div");
  bar.id = "cookieBar";
  bar.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:999;background:#26241F;color:#F5F4F0;padding:14px 18px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:center;font-size:.82rem;box-shadow:0 -4px 16px rgba(0,0,0,.15);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;";
  bar.innerHTML = `
    <span>Usamos cookies e armazenamento local para manter sua sessão e salvar seus dados.
    <a href="#" id="linkTermos" style="color:#D89B4A;text-decoration:underline">Cookies e Termos de uso</a></span>
    <button id="btnAceitarCookies" style="background:#D89B4A;color:#26241F;border:none;padding:7px 16px;border-radius:999px;font-weight:700;cursor:pointer;font-size:.8rem">Entendi</button>
  `;
  document.body.appendChild(bar);

  document.getElementById("btnAceitarCookies").addEventListener("click", () => {
    localStorage.setItem("tape_cookies_aceitos", "1");
    bar.remove();
  });
  document.getElementById("linkTermos").addEventListener("click", (e) => {
    e.preventDefault();
    showTermsModal();
  });
}

window.showTapeTerms = showTermsModal;

function showTermsModal() {
  if (document.getElementById("termosModal")) return;
  const overlay = document.createElement("div");
  overlay.id = "termosModal";
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;";
  overlay.innerHTML = `
    <div style="background:#F5F4F0;color:#26241F;max-width:480px;width:100%;border-radius:16px;padding:26px;max-height:80vh;overflow-y:auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <h2 style="margin-top:0">Cookies e Termos de uso</h2>
      <p style="font-size:.88rem;line-height:1.5"><strong>Cookies e armazenamento local:</strong> o tape usa o armazenamento do seu navegador (localStorage) e o Firebase (Authentication e Firestore) para guardar seu login e os dados da sua rotina acadêmica. Nenhum dado é vendido ou compartilhado com terceiros para fins de publicidade.</p>
      <p style="font-size:.88rem;line-height:1.5"><strong>Termos de uso:</strong> o tape é uma ferramenta pessoal de organização acadêmica, oferecida "como está", sem garantias. Você é responsável pelo conteúdo que insere e pela segurança da sua senha.</p>
      <button id="fecharTermos" style="margin-top:6px;background:#26241F;color:#F5F4F0;border:none;padding:9px 18px;border-radius:999px;font-weight:700;cursor:pointer">Fechar</button>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById("fecharTermos").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
}
