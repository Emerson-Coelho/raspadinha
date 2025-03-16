<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { ElMessage } from 'element-plus';
import DefaultLayout from '../../components/common/DefaultLayout.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isLoading = ref(false);
const showPassword = ref(false);

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
});

const errors = reactive({
  email: '',
  password: ''
});

function validateForm() {
  let isValid = true;
  
  // Validar email
  if (!form.email) {
    errors.email = 'O email é obrigatório';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Digite um email válido';
    isValid = false;
  } else {
    errors.email = '';
  }
  
  // Validar senha
  if (!form.password) {
    errors.password = 'A senha é obrigatória';
    isValid = false;
  } else {
    errors.password = '';
  }
  
  return isValid;
}

async function handleSubmit() {
  if (!validateForm()) return;
  
  isLoading.value = true;
  
  try {
    // Passando as credenciais como um objeto único
    await authStore.login({
      email: form.email,
      password: form.password
    });
    
    // Se o login for bem-sucedido e rememberMe estiver marcado, podemos salvar no localStorage
    if (form.rememberMe) {
      localStorage.setItem('rememberEmail', form.email);
    } else {
      localStorage.removeItem('rememberEmail');
    }
    
    ElMessage.success('Login realizado com sucesso!');
    
    // Redirecionar para a página solicitada ou para a página inicial
    const redirectPath = route.query.redirect as string || '/';
    router.push(redirectPath);
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    ElMessage.error('Email ou senha incorretos. Tente novamente.');
  } finally {
    isLoading.value = false;
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

function navigateToRegister() {
  router.push('/auth/register');
}

// Verificar se há um email salvo no localStorage
onMounted(() => {
  const savedEmail = localStorage.getItem('rememberEmail');
  if (savedEmail) {
    form.email = savedEmail;
    form.rememberMe = true;
  }
});
</script>

<template>
  <DefaultLayout :showHeader="false">
    <div class="flex justify-center items-center min-h-[80vh] px-4 py-4 mb-16">
      <div class="card w-full max-w-md p-6">
        <h1 class="text-3xl font-bold text-white text-center mb-8">Entrar</h1>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              :class="{ 'border-red-500': errors.email }"
              placeholder="seu@email.com"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-500">
              {{ errors.email }}
            </p>
          </div>
          
          <!-- Senha -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
              Senha
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.password }"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
              >
                <span v-if="showPassword">Ocultar</span>
                <span v-else>Mostrar</span>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-500">
              {{ errors.password }}
            </p>
          </div>
          
          <!-- Lembrar-me -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="form.rememberMe"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-700 rounded bg-gray-800"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-300">
                Lembrar-me
              </label>
            </div>
            <div class="text-sm">
              <a href="#" class="text-primary-500 hover:text-primary-400">
                Esqueceu a senha?
              </a>
            </div>
          </div>
          
          <!-- Botão de Login -->
          <div>
            <button
              type="submit"
              class="w-full btn-primary py-3"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="flex justify-center items-center">
                <span class="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
                Entrando...
              </span>
              <span v-else>Entrar</span>
            </button>
          </div>
        </form>
        
        <!-- Divisor -->
        <div class="my-6 flex items-center">
          <div class="flex-grow border-t border-gray-700"></div>
          <span class="px-4 text-gray-500">ou</span>
          <div class="flex-grow border-t border-gray-700"></div>
        </div>
        
        <!-- Cadastro -->
        <div class="text-center">
          <p class="text-gray-400 mb-4">
            Ainda não tem uma conta?
          </p>
          <button
            @click="navigateToRegister"
            class="w-full btn-outline py-3"
          >
            Criar Conta
          </button>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script lang="ts">
export default {
  name: 'LoginView'
}
</script> 