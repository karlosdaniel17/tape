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

// Escuta o envio do formulário no seu site
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      // Pega o e-mail e a senha dos campos
      const email = form.querySelector("input[type='email']").value;
      const senha = form.querySelector("input[type='password']").value;

      try {
        // Tenta criar a conta no Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        alert("Conta criada com sucesso! Bem-vindo(a), " + userCredential.user.email);
        form.reset();
      } catch (erro) {
        if (erro.code === 'auth/email-already-in-use') {
          alert("Este e-mail já está cadastrado!");
        } else if (erro.code === 'auth/weak-password') {
          alert("A senha precisa ter pelo menos 6 caracteres.");
        } else {
          alert("Erro ao cadastrar: " + erro.message);
        }
      }
    });
  }
});
