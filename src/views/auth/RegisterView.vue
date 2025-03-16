<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { ElMessage } from 'element-plus';
import DefaultLayout from '../../components/common/DefaultLayout.vue';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const showPassword = ref(false);
const showPasswordConfirm = ref(false);
const termsAccepted = ref(false);

const form = reactive({
  fullName: '',
  cpf: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: ''
});

const errors = reactive({
  fullName: '',
  cpf: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
  terms: ''
});

function validateForm() {
  let isValid = true;
  
  // Validar nome completo
  if (!form.fullName) {
    errors.fullName = 'O nome completo é obrigatório';
    isValid = false;
  } else if (form.fullName.length < 3) {
    errors.fullName = 'O nome deve ter pelo menos 3 caracteres';
    isValid = false;
  } else {
    errors.fullName = '';
  }
  
  // Validar CPF
  if (!form.cpf) {
    errors.cpf = 'O CPF é obrigatório';
    isValid = false;
  } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(form.cpf)) {
    errors.cpf = 'Digite um CPF válido (ex: 123.456.789-00)';
    isValid = false;
  } else {
    errors.cpf = '';
  }
  
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
  
  // Validar telefone
  if (!form.phone) {
    errors.phone = 'O telefone é obrigatório';
    isValid = false;
  } else if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(form.phone)) {
    errors.phone = 'Digite um telefone válido (ex: (11) 98765-4321)';
    isValid = false;
  } else {
    errors.phone = '';
  }
  
  // Validar senha
  if (!form.password) {
    errors.password = 'A senha é obrigatória';
    isValid = false;
  } else if (form.password.length < 6) {
    errors.password = 'A senha deve ter pelo menos 6 caracteres';
    isValid = false;
  } else {
    errors.password = '';
  }
  
  // Validar confirmação de senha
  if (!form.passwordConfirm) {
    errors.passwordConfirm = 'A confirmação de senha é obrigatória';
    isValid = false;
  } else if (form.password !== form.passwordConfirm) {
    errors.passwordConfirm = 'As senhas não coincidem';
    isValid = false;
  } else {
    errors.passwordConfirm = '';
  }
  
  // Validar termos
  if (!termsAccepted.value) {
    errors.terms = 'Você deve aceitar os termos e condições';
    isValid = false;
  } else {
    errors.terms = '';
  }
  
  return isValid;
}

function formatCPF(value: string) {
  if (!value) return '';
  
  // Remove todos os caracteres não numéricos
  const cpf = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const cpfLimited = cpf.slice(0, 11);
  
  // Formata o CPF (xxx.xxx.xxx-xx)
  return cpfLimited.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    .replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
    .replace(/(\d{3})(\d{1,3})/, '$1.$2')
    .replace(/^(\d{1,3})/, '$1');
}

function formatPhone(value: string) {
  if (!value) return '';
  
  // Remove todos os caracteres não numéricos
  const phone = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const phoneLimited = phone.slice(0, 11);
  
  // Formata o telefone ((xx) xxxxx-xxxx)
  return phoneLimited.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    .replace(/(\d{2})(\d{1,5})/, '($1) $2')
    .replace(/^(\d{1,2})/, '($1');
}

function handleCPFInput(event: Event) {
  const input = event.target as HTMLInputElement;
  form.cpf = formatCPF(input.value);
}

function handlePhoneInput(event: Event) {
  const input = event.target as HTMLInputElement;
  form.phone = formatPhone(input.value);
}

async function handleSubmit() {
  if (!validateForm()) return;
  
  isLoading.value = true;
  
  try {
    await authStore.register({
      name: form.fullName,
      cpf: form.cpf,
      email: form.email,
      phone: form.phone,
      password: form.password
    });
    
    ElMessage.success('Cadastro realizado com sucesso! Faça login para continuar.');
    router.push('/auth/login');
  } catch (error) {
    console.error('Erro ao fazer cadastro:', error);
    ElMessage.error('Não foi possível completar o cadastro. Verifique os dados e tente novamente.');
  } finally {
    isLoading.value = false;
  }
}

function togglePasswordVisibility(field: 'password' | 'passwordConfirm') {
  if (field === 'password') {
    showPassword.value = !showPassword.value;
  } else {
    showPasswordConfirm.value = !showPasswordConfirm.value;
  }
}

function navigateToLogin() {
  router.push('/auth/login');
}
</script>

<template>
  <DefaultLayout :showHeader="false" :showFooter="false">
    <div class="flex justify-center items-center py-12 px-4 pt-16 md:pt-12">
      <div class="card w-full max-w-2xl p-8">
        <h1 class="text-3xl font-bold text-white text-center mb-8">Criar Conta</h1>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nome Completo -->
            <div>
              <label for="fullName" class="block text-sm font-medium text-gray-300 mb-2">
                Nome Completo
              </label>
              <input
                id="fullName"
                v-model="form.fullName"
                type="text"
                autocomplete="name"
                class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.fullName }"
                placeholder="Seu nome completo"
              />
              <p v-if="errors.fullName" class="mt-1 text-sm text-red-500">
                {{ errors.fullName }}
              </p>
            </div>
            
            <!-- CPF -->
            <div>
              <label for="cpf" class="block text-sm font-medium text-gray-300 mb-2">
                CPF
              </label>
              <input
                id="cpf"
                v-model="form.cpf"
                type="text"
                autocomplete="off"
                @input="handleCPFInput"
                class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.cpf }"
                placeholder="123.456.789-00"
              />
              <p v-if="errors.cpf" class="mt-1 text-sm text-red-500">
                {{ errors.cpf }}
              </p>
            </div>
            
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
            
            <!-- Telefone -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-300 mb-2">
                Celular
              </label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                autocomplete="tel"
                @input="handlePhoneInput"
                class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.phone }"
                placeholder="(11) 98765-4321"
              />
              <p v-if="errors.phone" class="mt-1 text-sm text-red-500">
                {{ errors.phone }}
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
                  autocomplete="new-password"
                  class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  :class="{ 'border-red-500': errors.password }"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility('password')"
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
            
            <!-- Confirmar Senha -->
            <div>
              <label for="passwordConfirm" class="block text-sm font-medium text-gray-300 mb-2">
                Confirmar Senha
              </label>
              <div class="relative">
                <input
                  id="passwordConfirm"
                  v-model="form.passwordConfirm"
                  :type="showPasswordConfirm ? 'text' : 'password'"
                  autocomplete="new-password"
                  class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  :class="{ 'border-red-500': errors.passwordConfirm }"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility('passwordConfirm')"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  <span v-if="showPasswordConfirm">Ocultar</span>
                  <span v-else>Mostrar</span>
                </button>
              </div>
              <p v-if="errors.passwordConfirm" class="mt-1 text-sm text-red-500">
                {{ errors.passwordConfirm }}
              </p>
            </div>
          </div>
          
          <!-- Termos e Condições -->
          <div class="mt-4">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="terms"
                  v-model="termsAccepted"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-700 rounded bg-gray-800"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="terms" class="text-gray-300">
                  Eu li e aceito os <a href="#" class="text-primary-500 hover:text-primary-400">Termos de Uso</a> e a <a href="#" class="text-primary-500 hover:text-primary-400">Política de Privacidade</a>
                </label>
                <p v-if="errors.terms" class="mt-1 text-sm text-red-500">
                  {{ errors.terms }}
                </p>
              </div>
            </div>
          </div>
          
          <!-- Botão de Cadastro -->
          <div>
            <button
              type="submit"
              class="w-full btn-primary py-3"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="flex justify-center items-center">
                <span class="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
                Cadastrando...
              </span>
              <span v-else>Criar Conta</span>
            </button>
          </div>
        </form>
        
        <!-- Divisor -->
        <div class="my-6 flex items-center">
          <div class="flex-grow border-t border-gray-700"></div>
          <span class="px-4 text-gray-500">ou</span>
          <div class="flex-grow border-t border-gray-700"></div>
        </div>
        
        <!-- Login -->
        <div class="text-center">
          <p class="text-gray-400 mb-4">
            Já tem uma conta?
          </p>
          <button
            @click="navigateToLogin"
            class="w-full btn-outline py-3"
          >
            Fazer Login
          </button>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script lang="ts">
export default {
  name: 'RegisterView'
}
</script> 