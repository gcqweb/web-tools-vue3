<template>
    <div>
      <form v-if="activeForm === 'login'" @submit.prevent="login">
        <input type="text" v-model="loginData.username" placeholder="Username" />
        <input
          type="password"
          v-model="loginData.password"
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>
      <form v-else @submit.prevent="register">
        <input
          type="text"
          v-model="registerData.username"
          placeholder="Username"
        />
        <input
          type="password"
          v-model="registerData.password"
          placeholder="Password"
        />
        <button type="submit">Register</button>
      </form>
      <button @click="toggleForm">
        {{ activeForm === "login" ? "Switch to Register" : "Switch to Login" }}
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import axios from "axios";
  
  const activeForm = ref("login");
  const loginData = ref({ username: "a123456", password: "a111111" });
  const registerData = ref({ username: "a123456", password: "a111111" });
  const formData = new FormData();
  formData.append("username", "a123456");
  formData.append("password", "a111111");
  //   const login = async () => {
  //     try {
  //         const response = await axios.post('http://192.168.2.205:8000/login/',loginData.value);
  //       console.log(response.data);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };
  const login = async () => {
    try {
      const response = await axios.post(
        "https://api.gcqweb.cn/login/",
        loginData.value
      );
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  const register = async () => {
    try {
      const response = await axios.post(
        "https://api.gcqweb.cn/reg/",
        formData
      );
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  
  const toggleForm = () => {
    activeForm.value = activeForm.value === "login" ? "register" : "login";
  };
  </script>
  