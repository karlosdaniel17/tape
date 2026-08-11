// ======================================================================
// tape — login (Firebase Authentication) + sincronização na nuvem
// ======================================================================
// COMO ATIVAR (uma vez só):
// 1. Acesse https://console.firebase.google.com e crie um projeto (gratuito).
// 2. No menu do projeto: Build > Authentication > Sign-in method > ative
//    "E-mail/senha".
// 3. No menu: Build > Firestore Database > Criar banco de dados (pode
//    escolher "modo produção"). Depois, na aba "Regras", cole:
//
//      rules_version = '2';
//      service cloud.firestore {
//        match /databases/{database}/documents {
//          match /users/{userId} {
//            allow read, write: if request.auth != null && request.auth.uid == userId;
//          }
//        }
//      }
//
// 4. No menu: Configurações do projeto (ícone de engrenagem) > Geral >
//    "Seus apps" > clique no ícone Web (</>) para criar um app > copie o
//    objeto firebaseConfig que aparece e cole abaixo, no lugar do exemplo.
// ======================================================================

const firebaseConfig = {
  apiKey: "COLE_AQUI_SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxx",
};

(function () {
  if (!window.firebase) {
    console.error("tape/auth: SDK do Firebase não carregou.");
    return;
  }
  if (firebaseConfig.apiKey === "COLE_AQUI_SUA_API_KEY") {
    console.warn("tape/auth: configure o firebaseConfig em auth.js para ativar o login.");
  }

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  // ---------------- textos ----------------
  const T = {
    pt: {
      titulo: "Entrar no tape", email: "E-mail", senha: "Senha (mín. 6 caracteres)",
      entrar: "Entrar", criar: "Criar conta",
      trocarParaCriar: "Ainda não tem conta? Criar conta",
      trocarParaEntrar: "Já tem conta? Entrar",
      sair: "Sair", ola: "Olá", carregando: "Só um instante…",
      erroGenerico: "Não foi possível entrar. Confira o e-mail e a senha.",
      erroEmailUso: "Esse e-mail já tem uma conta — tente entrar.",
      erroSenhaFraca: "A senha precisa ter pelo menos 6 caracteres.",
      erroEmailInvalido: "E-mail inválido.",
    },
    en: {
      titulo: "Sign in to tape", email: "Email", senha: "Password (min. 6 characters)",
      entrar: "Sign in", criar: "Create account",
      trocarParaCriar: "No account yet? Create one",
      trocarParaEntrar: "Already have an account? Sign in",
      sair: "Sign out", ola: "Hi", carregando: "One moment…",
      erroGenerico: "Couldn't sign in. Check your email and password.",
      erroEmailUso: "This email already has an account — try signing in.",
      erroSenhaFraca: "Password must be at least 6 characters.",
      erroEmailInvalido: "Invalid email.",
    },
    es: {
      titulo: "Entrar a tape", email: "Correo", senha: "Contraseña (mín. 6 caracteres)",
      entrar: "Entrar", criar: "Crear cuenta",
      trocarParaCriar: "¿Aún no tienes cuenta? Crear cuenta",
      trocarParaEntrar: "¿Ya tienes cuenta? Entrar",
      sair: "Salir", ola: "Hola", carregando: "Un momento…",
      erroGenerico: "No se pudo entrar. Revisa el correo y la contraseña.",
      erroEmailUso: "Ese correo ya tiene cuenta — intenta entrar.",
      erroSenhaFraca: "La contraseña debe tener al menos 6 caracteres.",
      erroEmailInvalido: "Correo inválido.",
    },
  };
  const lang = localStorage.getItem("idioma") || "pt";
  const t = (k) => (T[lang] && T[lang][k]) || T.pt[k];

  // ---------------- estilos ----------------
  const style = document.createElement("style");
  style.textContent = `
    #authOverlay { position: fixed; inset: 0; background: var(--paper, #F5F4F0); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
    #authOverlay.hidden { display: none; }
    .auth-card { background: #fff; border: 1px solid var(--line, #00000014); border-radius: 18px; padding: 28px 26px; width: 100%; max-width: 340px; box-shadow: 0 20px 50px rgba(0,0,0,0.08); }
    .auth-card h2 { margin: 0 0 18px; font-size: 1.3rem; letter-spacing: -0.02em; }
    .auth-card input { width: 100%; padding: 11px 13px; border-radius: 10px; border: 1px solid var(--line, #00000014); font-size: 0.95rem; margin-bottom: 10px; font-family: inherit; }
    .auth-card button.auth-submit { width: 100%; padding: 11px; border-radius: 10px; border: none; background: var(--ink, #26241F); color: #fff; font-weight: 700; font-size: 0.95rem; cursor: pointer; margin-top: 4px; }
    .auth-card button.auth-submit:disabled { opacity: 0.5; cursor: default; }
    .auth-switch { display: block; background: none; border: none; text-decoration: underline; font-size: 0.82rem; opacity: 0.6; cursor: pointer; margin: 14px auto 0; padding: 0; }
    .auth-error { color: #B33; font-size: 0.8rem; margin: -2px 0 10px; min-height: 14px; }
    #authBox { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; }
    #authBox .who { opacity: 0.6; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #authBox button { border: 1px solid var(--line, #00000014); background: #fff; border-radius: 999px; padding: 6px 12px; font-size: 0.78rem; cursor: pointer; font-weight: 600; color: var(--ink, #26241F); }
    #authBox button:hover { background: #00000008; }
  `;
  document.head.appendChild(style);

  // ---------------- overlay de login/cadastro ----------------
  const overlay = document.createElement("div");
  overlay.id = "authOverlay";
  overlay.innerHTML = `
    <div class="auth-card">
      <h2 id="authTitulo">${t("titulo")}</h2>
      <div class="auth-error" id="authErr"></div>
      <input type="email" id="authEmail" placeholder="${t("email")}" autocomplete="email" />
      <input type="password" id="authPass" placeholder="${t("senha")}" autocomplete="current-password" />
      <button class="auth-submit" id="authSubmit">${t("entrar")}</button>
      <button class="auth-switch" id="authSwitch">${t("trocarParaCriar")}</button>
    </div>`;
  document.body.prepend(overlay);

  let mode = "signin";
  const $ = (id) => document.getElementById(id);

  $("authSwitch").addEventListener("click", () => {
    mode = mode === "signin" ? "signup" : "signin";
    $("authTitulo").textContent = t("titulo");
    $("authSubmit").textContent = mode === "signin" ? t("entrar") : t("criar");
    $("authSwitch").textContent = mode === "signin" ? t("trocarParaCriar") : t("trocarParaEntrar");
    $("authErr").textContent = "";
  });

  function mapError(code) {
    if (code === "auth/email-already-in-use") return t("erroEmailUso");
    if (code === "auth/weak-password") return t("erroSenhaFraca");
    if (code === "auth/invalid-email") return t("erroEmailInvalido");
    return t("erroGenerico");
  }

  async function submit() {
    const email = $("authEmail").value.trim();
    const pass = $("authPass").value;
    if (!email || !pass) return;
    $("authErr").textContent = "";
    $("authSubmit").disabled = true;
    $("authSubmit").textContent = t("carregando");
    try {
      if (mode === "signin") {
        await auth.signInWithEmailAndPassword(email, pass);
      } else {
        await auth.createUserWithEmailAndPassword(email, pass);
      }
    } catch (e) {
      $("authErr").textContent = mapError(e.code);
      $("authSubmit").disabled = false;
      $("authSubmit").textContent = mode === "signin" ? t("entrar") : t("criar");
    }
  }
  $("authSubmit").addEventListener("click", submit);
  ["authEmail", "authPass"].forEach((id) =>
    $(id).addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); })
  );

  // ---------------- sincronização com Firestore ----------------
  function readAllLocal() {
    const out = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      out[k] = localStorage.getItem(k);
    }
    return out;
  }
  async function pushToCloud(uidUser) {
    try {
      await db.collection("users").doc(uidUser).set(
        { data: readAllLocal(), atualizadoEm: Date.now() },
        { merge: true }
      );
    } catch (e) { console.warn("tape/auth: falha ao sincronizar", e); }
  }
  async function pullFromCloud(uidUser) {
    try {
      const snap = await db.collection("users").doc(uidUser).get();
      if (snap.exists && snap.data().data) {
        const cloud = snap.data().data;
        Object.keys(cloud).forEach((k) => localStorage.setItem(k, cloud[k]));
        return true;
      }
    } catch (e) { console.warn("tape/auth: falha ao buscar dados", e); }
    return false;
  }

  let syncInterval = null;

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      overlay.classList.add("hidden");
      renderAuthBox(user);
      const already = sessionStorage.getItem("tape_synced");
      if (!already) {
        sessionStorage.setItem("tape_synced", "1");
        const had = await pullFromCloud(user.uid);
        if (had) { location.reload(); return; }
        pushToCloud(user.uid);
      }
      if (syncInterval) clearInterval(syncInterval);
      syncInterval = setInterval(() => pushToCloud(user.uid), 5000);
      window.addEventListener("beforeunload", () => pushToCloud(user.uid));
    } else {
      overlay.classList.remove("hidden");
      renderAuthBox(null);
      if (syncInterval) { clearInterval(syncInterval); syncInterval = null; }
    }
  });

  function renderAuthBox(user) {
    const box = document.getElementById("authBox");
    if (!box) return;
    if (user) {
      box.innerHTML = `<span class="who">${t("ola")}, ${user.email}</span><button id="authLogout">${t("sair")}</button>`;
      $("authLogout").addEventListener("click", () => {
        sessionStorage.removeItem("tape_synced");
        auth.signOut();
      });
    } else {
      box.innerHTML = "";
    }
  }
})();
