import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import axios from 'axios'

// Configurar o Axios com a URL base da API
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
axios.defaults.baseURL = apiUrl.replace(/\/$/, ''); // Remove a barra final se existir

console.log('Axios configurado com baseURL:', axios.defaults.baseURL);

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// Interceptor para mostrar detalhes das requisições (apenas para debug)
axios.interceptors.request.use(
  config => {
    console.log(`[Axios Request] ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      params: config.params,
      data: config.data
    });
    return config;
  },
  error => {
    console.error('[Axios Request Error]', error);
    return Promise.reject(error);
  }
);

// Interceptor para logging de respostas (apenas para debug)
axios.interceptors.response.use(
  response => {
    console.log(`[Axios Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  error => {
    if (error.response) {
      console.error(`[Axios Response Error] ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        data: error.response.data,
        headers: error.response.headers
      });
    } else {
      console.error('[Axios Network Error]', error.message);
    }
    return Promise.reject(error);
  }
);

// Nota: Os interceptores específicos para autenticação de usuário e admin
// foram movidos para seus respectivos stores para evitar conflitos

app.mount('#app')
