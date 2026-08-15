/* ---------- Assistente de voz do tape ----------
   Botão flutuante que fala um resumo do dia: dia da semana, data, aulas,
   monitorias/tarefas cadastradas na semana atual, ou se é dia de folga.
   Usa a Web Speech API do próprio navegador (não envia nada para servidor). */

(function () {
  // ---------- estilos do botão flutuante ----------
  const style = document.createElement("style");
  style.textContent = `
    #tapeAssistBtn {
      position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%);
      width: 56px; height: 56px; border-radius: 999px; border: none;
      background: var(--ink, #3B382F); color: white; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 10px 26px rgba(0,0,0,0.22); z-index: 50; font-size: 1.5rem;
      transition: transform .15s ease, box-shadow .15s ease;
    }
    #tapeAssistBtn:hover { transform: translateX(-50%) scale(1.06); }
    #tapeAssistBtn.falando { animation: tapeAssistPulse 1s ease-in-out infinite; }
    @keyframes tapeAssistPulse {
      0%, 100% { box-shadow: 0 10px 26px rgba(0,0,0,0.22); }
      50% { box-shadow: 0 10px 34px rgba(0,0,0,0.35), 0 0 0 10px rgba(59,56,47,0.12); }
    }
    #tapeAssistBubble {
      position: fixed; left: 50%; bottom: 88px; transform: translateX(-50%);
      max-width: min(360px, calc(100vw - 32px)); background: white; color: var(--ink, #3B382F);
      border: 1px solid #00000014; border-radius: 14px; padding: 12px 16px;
      font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 0.85rem; line-height: 1.5; box-shadow: 0 10px 30px rgba(0,0,0,0.12);
      z-index: 50; display: none;
    }
    #tapeAssistBubble.show { display: block; }
  `;
  document.head.appendChild(style);

  // ---------- botão + balão de fala ----------
  const btn = document.createElement("button");
  btn.id = "tapeAssistBtn";
  btn.title = "Ouvir o resumo do dia";
  btn.setAttribute("aria-label", "Ouvir o resumo do dia");
  btn.textContent = "🎙️";

  const bubble = document.createElement("div");
  bubble.id = "tapeAssistBubble";

  document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(btn);
    document.body.appendChild(bubble);
  });
  if (document.readyState === "complete" || document.readyState === "interactive") {
    document.body.appendChild(btn);
    document.body.appendChild(bubble);
  }

  // ---------- helpers de dados ----------
  function loadJSON(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (e) { return fallback; }
  }

  function startOfWeekMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  function isoDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  }

  const DIA_KEYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
  const DIA_NOMES = {
    seg: "segunda-feira", ter: "terça-feira", qua: "quarta-feira", qui: "quinta-feira",
    sex: "sexta-feira", sab: "sábado", dom: "domingo",
  };
  const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

  function getDisciplinaNome(id) {
    const lista = loadJSON("disciplinas", []);
    const d = lista.find(x => x.id === id);
    return d ? d.name : null;
  }

  function montarSaudacao() {
    const perfil = loadJSON("perfil_dados", {});
    const apelido = (perfil.apelido || perfil.nomeCompleto || "").trim().split(" ")[0];

    const hoje = new Date();
    const diaKey = DIA_KEYS[hoje.getDay()];
    const dataFalada = `dia ${hoje.getDate()} de ${MESES[hoje.getMonth()]} de ${hoje.getFullYear()}`;

    let texto = `Olá${apelido ? ", " + apelido : ""}! Hoje é ${DIA_NOMES[diaKey]}, ${dataFalada}. `;

    if (diaKey === "sab" || diaKey === "dom") {
      texto += "Hoje é dia de folga. Aproveite para descansar ou adiantar seus estudos.";
      return texto;
    }

    // aulas, monitorias e projetos recorrentes cadastrados em Aulas (permanente, editável lá)
    const aulas = loadJSON("aulas_horario", null);
    const itensHoje = (aulas && aulas[diaKey]) ? [...aulas[diaKey]] : [];
    if (itensHoje.length) {
      itensHoje.sort((a, b) => (a.inicio || "").localeCompare(b.inicio || ""));
      const porTipo = {};
      itensHoje.forEach(a => {
        const tipo = a.tipo || "Aula";
        (porTipo[tipo] = porTipo[tipo] || []).push(a.nome + (a.inicio ? ` às ${a.inicio}` : ""));
      });
      const FALA_TIPO = { Aula: "aula", Monitoria: "monitoria", Projeto: "projeto", Outro: "compromisso" };
      Object.keys(porTipo).forEach(tipo => {
        const falaTipo = FALA_TIPO[tipo] || "compromisso";
        texto += `Você tem ${falaTipo} de ${porTipo[tipo].join(", ")}. `;
      });
    } else {
      texto += "Você não tem aulas nem compromissos cadastrados para hoje. ";
    }

    // tarefas extras avulsas cadastradas na semana atual (que não sejam recorrentes)
    const monday = startOfWeekMonday(hoje);
    const weekData = loadJSON(`semana:${isoDate(monday)}`, null);
    if (weekData && weekData.tarefas) {
      const cardsDoDia = (weekData.cards && weekData.cards[diaKey]) ? weekData.cards[diaKey] : [{ id: "main" }];
      const pendentes = [];
      cardsDoDia.forEach(c => {
        const key = c.id === "main" ? diaKey : `${diaKey}::${c.id}`;
        (weekData.tarefas[key] || []).forEach(tsk => {
          if (!tsk.done) pendentes.push(tsk.text + (tsk.hora ? ` às ${tsk.hora}` : ""));
        });
      });
      if (pendentes.length) texto += `Também tem essa semana: ${pendentes.join(", ")}.`;
    }

    return texto.trim();
  }

  // ---------- Web Speech API ----------
  function escolherVozFeminina() {
    const vozes = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    const ptVoices = vozes.filter(v => v.lang && v.lang.toLowerCase().startsWith("pt"));
    const nomesFemininos = ["female", "feminin", "luciana", "joana", "maria", "google português"];
    const feminina = ptVoices.find(v => nomesFemininos.some(n => v.name.toLowerCase().includes(n)));
    return feminina || ptVoices[0] || vozes[0] || null;
  }

  function falar(texto) {
    if (!("speechSynthesis" in window)) {
      bubble.textContent = texto + " (seu navegador não suporta voz — mostrando só o texto.)";
      bubble.classList.add("show");
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(texto);
    utter.lang = "pt-BR";
    utter.pitch = 1.15;
    utter.rate = 1;
    const voz = escolherVozFeminina();
    if (voz) utter.voice = voz;

    utter.onstart = () => btn.classList.add("falando");
    utter.onend = () => btn.classList.remove("falando");
    utter.onerror = () => btn.classList.remove("falando");

    window.speechSynthesis.speak(utter);
  }

  btn.addEventListener("click", () => {
    const texto = montarSaudacao();
    bubble.textContent = texto;
    bubble.classList.add("show");
    falar(texto);
    setTimeout(() => bubble.classList.remove("show"), 14000);
  });

  // garante que a lista de vozes já esteja carregada quando o usuário clicar
  if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
})();
