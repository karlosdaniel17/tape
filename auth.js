import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

  // Botão Sair: garante que apareça em TODAS as páginas que tenham #authBox,
  // criando o botão automaticamente quando ele não estiver no HTML da página.
  let btnSair = document.getElementById("btnSair");
  if (!btnSair) {
    const authBox = document.getElementById("authBox");
    if (authBox) {
      btnSair = document.createElement("button");
      btnSair.id = "btnSair";
      btnSair.textContent = "Sair";
      btnSair.style.cssText = "background-color:#dc3545;color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-weight:bold;font-size:.82rem;";
      authBox.appendChild(btnSair);
    }
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

  // Rodapé com direitos autorais em todas as páginas
  if (!document.getElementById("tapeCopyright")) {
    const cp = document.createElement("div");
    cp.id = "tapeCopyright";
    cp.style.cssText = "text-align:center;font-size:11px;opacity:.4;padding:4px 20px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;";
    cp.textContent = "© 2026 tape. Todos os direitos reservados.";
    document.body.appendChild(cp);
  }

  initCookieBanner();
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
