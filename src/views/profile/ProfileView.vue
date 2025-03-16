<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { ElMessage, ElTabs, ElTabPane } from 'element-plus';
import DefaultLayout from '../../components/common/DefaultLayout.vue';
import GameHistory from '../../components/games/GameHistory.vue';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const isEditing = ref(false);
const activeTab = ref('profile');

// Dados do perfil
const profile = reactive({
  name: '',
  email: '',
  cpf: '',
  phone: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Erros de validação
const errors = reactive({
  name: '',
  email: '',
  phone: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Histórico de transações
const transactions = ref([
  {
    id: 't1',
    type: 'deposit',
    amount: 100,
    date: '2023-05-10',
    status: 'completed',
    method: 'pix'
  },
  {
    id: 't2',
    type: 'withdraw',
    amount: 50,
    date: '2023-05-15',
    status: 'completed',
    method: 'pix'
  },
  {
    id: 't3',
    type: 'game',
    amount: -20,
    date: '2023-05-16',
    status: 'completed',
    game: 'Raspadinha Premium'
  },
  {
    id: 't4',
    type: 'game',
    amount: 75,
    date: '2023-05-16',
    status: 'completed',
    game: 'Raspadinha Premium'
  }
]);

// Dados computados
const userBalance = computed(() => authStore.user?.balance || 0);
const userId = computed(() => authStore.user?.id || '');

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/auth/login');
    return;
  }
  
  // Carregar dados do usuário
  if (authStore.user) {
    profile.name = authStore.user.name;
    profile.email = authStore.user.email;
    profile.cpf = authStore.user.cpf;
    profile.phone = authStore.user.phone;
  }
  
  // Aqui você carregaria o histórico de transações do usuário
  // fetchTransactions();
});

function toggleEdit() {
  isEditing.value = !isEditing.value;
  
  if (!isEditing.value) {
    // Resetar campos de senha ao cancelar edição
    profile.currentPassword = '';
    profile.newPassword = '';
    profile.confirmPassword = '';
    
    // Resetar erros
    Object.keys(errors).forEach(key => {
      errors[key as keyof typeof errors] = '';
    });
  }
}

function validateProfileForm() {
  let isValid = true;
  
  // Validar nome
  if (!profile.name) {
    errors.name = 'O nome é obrigatório';
    isValid = false;
  } else if (profile.name.length < 3) {
    errors.name = 'O nome deve ter pelo menos 3 caracteres';
    isValid = false;
  } else {
    errors.name = '';
  }
  
  // Validar telefone
  if (!profile.phone) {
    errors.phone = 'O telefone é obrigatório';
    isValid = false;
  } else if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(profile.phone)) {
    errors.phone = 'Digite um telefone válido (ex: (11) 98765-4321)';
    isValid = false;
  } else {
    errors.phone = '';
  }
  
  // Validar senha atual (apenas se estiver alterando a senha)
  if (profile.newPassword && !profile.currentPassword) {
    errors.currentPassword = 'A senha atual é obrigatória para alterar a senha';
    isValid = false;
  } else {
    errors.currentPassword = '';
  }
  
  // Validar nova senha (apenas se estiver alterando a senha)
  if (profile.currentPassword && !profile.newPassword) {
    errors.newPassword = 'Digite a nova senha';
    isValid = false;
  } else if (profile.newPassword && profile.newPassword.length < 6) {
    errors.newPassword = 'A senha deve ter pelo menos 6 caracteres';
    isValid = false;
  } else {
    errors.newPassword = '';
  }
  
  // Validar confirmação de senha (apenas se estiver alterando a senha)
  if (profile.newPassword && !profile.confirmPassword) {
    errors.confirmPassword = 'Confirme a nova senha';
    isValid = false;
  } else if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
    errors.confirmPassword = 'As senhas não coincidem';
    isValid = false;
  } else {
    errors.confirmPassword = '';
  }
  
  return isValid;
}

async function saveProfile() {
  if (!validateProfileForm()) return;
  
  isLoading.value = true;
  
  try {
    // Simulação de atualização de perfil
    // Na implementação real, você chamaria os métodos do store
    console.log('Atualizando perfil:', {
      name: profile.name,
      phone: profile.phone
    });
    
    if (profile.currentPassword && profile.newPassword) {
      console.log('Alterando senha:', {
        currentPassword: profile.currentPassword,
        newPassword: profile.newPassword
      });
    }
    
    // Atualizar dados do usuário localmente para demonstração
    if (authStore.user) {
      authStore.user.name = profile.name;
      authStore.user.phone = profile.phone;
    }
    
    ElMessage.success('Perfil atualizado com sucesso!');
    toggleEdit();
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    ElMessage.error('Não foi possível atualizar o perfil. Verifique os dados e tente novamente.');
  } finally {
    isLoading.value = false;
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

function formatCurrency(value: number | null) {
  if (value === null) return 'Pendente';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
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

function handlePhoneInput(event: Event) {
  const input = event.target as HTMLInputElement;
  profile.phone = formatPhone(input.value);
}

function getTransactionIcon(type: string) {
  switch (type) {
    case 'deposit':
      return '💰';
    case 'withdraw':
      return '💸';
    case 'game':
      return '🎮';
    default:
      return '💵';
  }
}

function getTransactionClass(type: string, amount: number) {
  if (type === 'deposit' || amount > 0) {
    return 'text-green-500';
  } else if (type === 'withdraw' || amount < 0) {
    return 'text-red-500';
  }
  return '';
}

function getGameResultClass(result: string) {
  switch (result) {
    case 'win':
      return 'bg-green-900 text-green-200';
    case 'loss':
      return 'bg-red-900 text-red-200';
    case 'pending':
      return 'bg-yellow-900 text-yellow-200';
    default:
      return 'bg-gray-700 text-gray-300';
  }
}

function getGameResultText(result: string) {
  switch (result) {
    case 'win':
      return 'Ganhou';
    case 'loss':
      return 'Perdeu';
    case 'pending':
      return 'Pendente';
    default:
      return 'Desconhecido';
  }
}
</script>

<template>
  <DefaultLayout :showHeader="false" :showFooter="false">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Sidebar com informações do usuário -->
        <div class="w-full md:w-1/3">
          <div class="card p-6 mb-6">
            <div class="flex items-center mb-6">
              <div class="w-16 h-16 rounded-full bg-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                {{ profile.name.charAt(0) }}
              </div>
              <div class="ml-4">
                <h2 class="text-xl font-bold text-white">{{ profile.name }}</h2>
                <p class="text-gray-400">{{ profile.email }}</p>
              </div>
            </div>
            
            <div class="mb-6">
              <div class="bg-gray-800 p-4 rounded-lg">
                <h3 class="text-lg font-semibold text-white mb-2">Saldo</h3>
                <p class="text-2xl font-bold text-primary-500">{{ formatCurrency(userBalance) }}</p>
              </div>
            </div>
            
            <div class="flex flex-col space-y-2">
              <router-link to="/games/scratch-card" class="btn-primary py-2">
                Jogar Raspadinha
              </router-link>
              <router-link to="/games/lucky-number" class="btn-primary py-2">
                Números da Sorte
              </router-link>
              <button class="btn-outline py-2">
                Depositar
              </button>
              <button class="btn-outline py-2">
                Sacar
              </button>
            </div>
          </div>
        </div>
        
        <!-- Conteúdo principal -->
        <div class="w-full md:w-2/3">
          <ElTabs v-model="activeTab" class="profile-tabs">
            <!-- Aba de Perfil -->
            <ElTabPane label="Perfil" name="profile">
              <div class="card p-6">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-xl font-bold text-white">Informações Pessoais</h2>
                  <button 
                    v-if="!isEditing" 
                    @click="toggleEdit" 
                    class="btn-outline py-1 px-4"
                  >
                    Editar
                  </button>
                </div>
                
                <form v-if="isEditing" @submit.prevent="saveProfile" class="space-y-6">
                  <!-- Nome -->
                  <div>
                    <label for="name" class="block text-sm font-medium text-gray-300 mb-2">
                      Nome Completo
                    </label>
                    <input
                      id="name"
                      v-model="profile.name"
                      type="text"
                      class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      :class="{ 'border-red-500': errors.name }"
                    />
                    <p v-if="errors.name" class="mt-1 text-sm text-red-500">
                      {{ errors.name }}
                    </p>
                  </div>
                  
                  <!-- Email (somente leitura) -->
                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      v-model="profile.email"
                      type="email"
                      disabled
                      class="w-full px-4 py-2 bg-gray-700 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                    <p class="mt-1 text-xs text-gray-500">
                      O email não pode ser alterado
                    </p>
                  </div>
                  
                  <!-- CPF (somente leitura) -->
                  <div>
                    <label for="cpf" class="block text-sm font-medium text-gray-300 mb-2">
                      CPF
                    </label>
                    <input
                      id="cpf"
                      v-model="profile.cpf"
                      type="text"
                      disabled
                      class="w-full px-4 py-2 bg-gray-700 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                    <p class="mt-1 text-xs text-gray-500">
                      O CPF não pode ser alterado
                    </p>
                  </div>
                  
                  <!-- Telefone -->
                  <div>
                    <label for="phone" class="block text-sm font-medium text-gray-300 mb-2">
                      Telefone
                    </label>
                    <input
                      id="phone"
                      v-model="profile.phone"
                      type="tel"
                      @input="handlePhoneInput"
                      class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      :class="{ 'border-red-500': errors.phone }"
                    />
                    <p v-if="errors.phone" class="mt-1 text-sm text-red-500">
                      {{ errors.phone }}
                    </p>
                  </div>
                  
                  <div class="border-t border-gray-700 pt-6 mt-6">
                    <h3 class="text-lg font-semibold text-white mb-4">Alterar Senha</h3>
                    
                    <!-- Senha Atual -->
                    <div class="mb-4">
                      <label for="currentPassword" class="block text-sm font-medium text-gray-300 mb-2">
                        Senha Atual
                      </label>
                      <input
                        id="currentPassword"
                        v-model="profile.currentPassword"
                        type="password"
                        class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        :class="{ 'border-red-500': errors.currentPassword }"
                      />
                      <p v-if="errors.currentPassword" class="mt-1 text-sm text-red-500">
                        {{ errors.currentPassword }}
                      </p>
                    </div>
                    
                    <!-- Nova Senha -->
                    <div class="mb-4">
                      <label for="newPassword" class="block text-sm font-medium text-gray-300 mb-2">
                        Nova Senha
                      </label>
                      <input
                        id="newPassword"
                        v-model="profile.newPassword"
                        type="password"
                        class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        :class="{ 'border-red-500': errors.newPassword }"
                      />
                      <p v-if="errors.newPassword" class="mt-1 text-sm text-red-500">
                        {{ errors.newPassword }}
                      </p>
                    </div>
                    
                    <!-- Confirmar Nova Senha -->
                    <div>
                      <label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-2">
                        Confirmar Nova Senha
                      </label>
                      <input
                        id="confirmPassword"
                        v-model="profile.confirmPassword"
                        type="password"
                        class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        :class="{ 'border-red-500': errors.confirmPassword }"
                      />
                      <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-500">
                        {{ errors.confirmPassword }}
                      </p>
                    </div>
                  </div>
                  
                  <div class="flex justify-end space-x-4">
                    <button 
                      type="button" 
                      @click="toggleEdit" 
                      class="btn-outline py-2 px-6"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      class="btn-primary py-2 px-6"
                      :disabled="isLoading"
                    >
                      <span v-if="isLoading" class="flex items-center">
                        <span class="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                        Salvando...
                      </span>
                      <span v-else>Salvar</span>
                    </button>
                  </div>
                </form>
                
                <div v-else class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 class="text-sm font-medium text-gray-400 mb-1">Nome Completo</h3>
                      <p class="text-white">{{ profile.name }}</p>
                    </div>
                    
                    <div>
                      <h3 class="text-sm font-medium text-gray-400 mb-1">Email</h3>
                      <p class="text-white">{{ profile.email }}</p>
                    </div>
                    
                    <div>
                      <h3 class="text-sm font-medium text-gray-400 mb-1">CPF</h3>
                      <p class="text-white">{{ profile.cpf }}</p>
                    </div>
                    
                    <div>
                      <h3 class="text-sm font-medium text-gray-400 mb-1">Telefone</h3>
                      <p class="text-white">{{ profile.phone }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ElTabPane>
            
            <!-- Aba de Transações -->
            <ElTabPane label="Transações" name="transactions">
              <div class="card p-6">
                <h2 class="text-xl font-bold text-white mb-6">Histórico de Transações</h2>
                
                <div v-if="transactions.length === 0" class="text-center py-8">
                  <p class="text-gray-400">Você ainda não possui transações.</p>
                </div>
                
                <div v-else class="space-y-4">
                  <div 
                    v-for="transaction in transactions" 
                    :key="transaction.id"
                    class="bg-gray-800 p-4 rounded-lg flex items-center"
                  >
                    <div class="text-2xl mr-4">
                      {{ getTransactionIcon(transaction.type) }}
                    </div>
                    
                    <div class="flex-grow">
                      <div class="flex justify-between items-center mb-1">
                        <h3 class="font-medium text-white">
                          {{ transaction.type === 'deposit' ? 'Depósito' : 
                             transaction.type === 'withdraw' ? 'Saque' : 
                             transaction.game }}
                        </h3>
                        <span 
                          class="font-bold"
                          :class="getTransactionClass(transaction.type, transaction.amount)"
                        >
                          {{ formatCurrency(transaction.amount) }}
                        </span>
                      </div>
                      
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-400">
                          {{ formatDate(transaction.date) }}
                        </span>
                        <span class="text-gray-400">
                          {{ transaction.method === 'pix' ? 'PIX' : 'Método' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ElTabPane>
            
            <!-- Aba de Histórico de Jogos -->
            <ElTabPane label="Histórico de Jogos" name="games">
              <GameHistory :userId="userId" />
            </ElTabPane>
          </ElTabs>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script lang="ts">
export default {
  name: 'ProfileView'
}
</script>

<style scoped>
.profile-tabs :deep(.el-tabs__item) {
  color: #a0aec0;
}

.profile-tabs :deep(.el-tabs__item.is-active) {
  color: #fff;
}

.profile-tabs :deep(.el-tabs__active-bar) {
  background-color: var(--el-color-primary);
}
</style> 