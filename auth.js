import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
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

  // Função para Entrar
  if (btnEntrar) {
    btnEntrar.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!emailInput.value || !senhaInput.value) {
        alert("Preencha o e-mail e a senha.");
        return;
      }
      try {
        await signInWithEmailAndPassword(auth, emailInput.value, senhaInput.value);
        alert("Login realizado com sucesso!");
        window.location.href = "index.html"; // Direciona para o site
      } catch (erro) {
        alert("Erro ao entrar: " + erro.message);
      }
    });
  }

  // Função para Cadastrar
  if (btnCadastrar) {
    btnCadastrar.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!emailInput.value || !senhaInput.value) {
        alert("Preencha o e-mail e a senha para cadastrar.");
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, emailInput.value, senhaInput.value);
        alert("Conta criada com sucesso! Bem-vindo(a) " + userCredential.user.email);
        window.location.href = "index.html"; // Direciona para o site
      } catch (erro) {
        if (erro.code === 'auth/email-already-in-use') {
          alert("Este e-mail já está cadastrado. Clique em Entrar!");
        } else if (erro.code === 'auth/weak-password') {
          alert("A senha deve ter pelo menos 6 caracteres.");
        } else {
          alert("Erro ao cadastrar: " + erro.message);
        }
      }
    });
  }
});
