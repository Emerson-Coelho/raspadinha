<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAdminStore } from '../../stores/admin';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const adminStore = useAdminStore();

const isLoading = ref(false);
const showPassword = ref(false);
const loginError = ref('');

const form = reactive({
  email: '',
  password: ''
});

const errors = reactive({
  email: '',
  password: ''
});

// Verificar se há um erro de sessão expirada
onMounted(() => {
  // Limpar qualquer token inválido
  if (adminStore.error && adminStore.error.includes('sessão expirou')) {
    adminStore.adminLogout();
    loginError.value = adminStore.error;
    ElMessage.warning(adminStore.error);
  }
  
  // Verificar se veio de uma redireção por token inválido
  const redirectReason = route.query.reason as string;
  if (redirectReason === 'session_expired') {
    loginError.value = 'Sua sessão expirou. Por favor, faça login novamente.';
    ElMessage.warning(loginError.value);
  }
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
  loginError.value = '';
  
  try {
    const success = await adminStore.adminLogin({
      email: form.email,
      password: form.password
    });
    
    if (success) {
      ElMessage.success('Login administrativo realizado com sucesso!');
      
      // Redirecionar para o dashboard admin
      const redirectPath = route.query.redirect as string || '/admin';
      router.push(redirectPath);
    } else {
      loginError.value = adminStore.error || 'Falha no login. Verifique suas credenciais.';
      ElMessage.error(loginError.value);
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    loginError.value = 'Ocorreu um erro ao tentar fazer login.';
    ElMessage.error(loginError.value);
  } finally {
    isLoading.value = false;
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}
</script>

<template>
  <div class="min-h-screen bg-gray-900 flex flex-col justify-center">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="text-center text-3xl font-extrabold text-white">
        Acesso Administrativo
      </h2>
      <p class="mt-2 text-center text-sm text-gray-400">
        Área restrita para administradores do sistema
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-gray-800 py-8 px-6 shadow rounded-lg sm:px-10">
        <!-- Mensagem de erro -->
        <div v-if="loginError" class="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-300 text-sm">
          <div class="flex items-center">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <span>{{ loginError }}</span>
          </div>
        </div>
        
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
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              :class="{ 'border-red-500': errors.email }"
              placeholder="admin@exemplo.com"
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
                class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
          
          <!-- Botão de Login -->
          <div>
            <button
              type="submit"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="flex justify-center items-center">
                <span class="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
                Entrando...
              </span>
              <span v-else>Entrar como Administrador</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'AdminLoginView'
}
</script> 