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
  const btnSair = document.getElementById("btnSair");

  // Botão Entrar
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
        alert("Login realizado com sucesso!");
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

  // Botão Cadastrar
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

  // Botão Sair (Logout)
  if (btnSair) {
    btnSair.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        alert("Você saiu da conta.");
        window.location.href = "login.html";
      } catch (erro) {
        alert("Erro ao sair: " + erro.message);
      }
    });
  }
});
