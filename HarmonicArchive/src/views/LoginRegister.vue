<template>
    <div class="login-register-container">
      <div class="form-container">
        <h1>Welcome to Harmonic Archive</h1>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="username" id="username" v-model="username" required />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="password" required />
          </div>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <button type="submit" class="login-btn">Login</button>
        </form>
        <p>Don't have an account? <a href="#" @click="toggleRegister">Register here</a></p>
  
        <form v-if="isRegistering" @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="register-username">Username</label>
            <input
              type="text"
              id="register-username"
              v-model="registerUsername"
              required
            />
          </div>
          <div class="form-group">
            <label for="register-email">Email</label>
            <input
              type="email"
              id="register-email"
              v-model="registerEmail"
              required
            />
          </div>
          <div class="form-group">
            <label for="register-password">Password</label>
            <input
              type="password"
              id="register-password"
              v-model="registerPassword"
              required
            />
          </div>
          <button type="submit" class="register-btn">Register</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { errorMessages } from "vue/compiler-sfc";
import { login, register } from "../services/api";
  
  export default {
    data() {
      return {
        email: "",
        password: "",
        username: "",
        registerUsername: "", // New field for username
        registerEmail: "",
        registerPassword: "",
        isRegistering: false,
        errorMessage: "",
      };
    },
    methods: {
        async handleLogin() {
            try {
                const response = await login(this.username, this.password); // Use `username` here
                localStorage.setItem("authToken", response.token);
                this.$router.push("/app");
            } catch (error) {
                this.errorMessage = error.response?.data || "Invalid login credentials";
            }
        },
      async handleRegister() {
      try {
        const userData = {
          username: this.registerUsername,
          email: this.registerEmail,
          password: this.registerPassword,
        };
        await register(userData);
        alert("Registration successful! Please log in.");
        this.isRegistering = false;
        this.errorMessage = ""; // Clear any previous error messages
      } catch (error) {
        this.errorMessage = error.response?.data || "Registration failed";
      }
    },
      toggleRegister() {
        this.isRegistering = !this.isRegistering;
      },
    },
  };
  </script>
  
  <style scoped>
  .login-register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f4effa;
  }
  
  .form-container {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 300px;
    text-align: center;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
  }
  
  .form-group input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .login-btn, .register-btn {
    width: 100%;
    padding: 10px;
    background-color: #532b88;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .login-btn:hover, .register-btn:hover {
    background-color: #6a3dbb;
  }
  
  p {
    margin-top: 10px;
  }
  
  a {
    color: #532b88;
    text-decoration: underline;
    cursor: pointer;
  }
  .error-message {
    color: red;
    font-size: 14px;
    margin-top: 10px;
}
  </style>