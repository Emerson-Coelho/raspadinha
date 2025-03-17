<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';
import { useAdminStore } from '../../stores/admin';

const adminStore = useAdminStore();

// Criar uma instância do axios com a baseURL correta
const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Configurar o interceptor para adicionar o token de autorização
api.interceptors.request.use(
  (config) => {
    if (adminStore.adminToken) {
      config.headers.Authorization = `Bearer ${adminStore.adminToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Estado
const isLoading = ref(false);
const isCreatingTable = ref(false);
const isCreatingUsers = ref(false);
const output = ref<string[]>([]);
const userCount = ref(10);
const batchSize = ref(1000);
const continueFromLast = ref(false);

// Configurações para criação de usuários
const userSettings = reactive({
  count: 10,
  batchSize: 1000,
  continueFromLast: false
});

// Verificar status da tabela de usuários
const tableStatus = ref({
  exists: false,
  userCount: 0,
  lastEmail: '',
  checking: false
});

// Verificar status da tabela de usuários
async function checkTableStatus() {
  tableStatus.value.checking = true;
  output.value.push('Verificando status da tabela de usuários...');
  
  try {
    const response = await api.get('/admin/developer/table-status');
    
    if (response.data.success) {
      tableStatus.value.exists = response.data.exists;
      tableStatus.value.userCount = response.data.userCount || 0;
      tableStatus.value.lastEmail = response.data.lastEmail || '';
      
      output.value.push(`Tabela de usuários ${tableStatus.value.exists ? 'existe' : 'não existe'}.`);
      if (tableStatus.value.exists) {
        output.value.push(`Total de usuários: ${tableStatus.value.userCount}`);
        if (tableStatus.value.lastEmail) {
          output.value.push(`Último email: ${tableStatus.value.lastEmail}`);
        }
      }
    } else {
      output.value.push(`Erro: ${response.data.message}`);
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      output.value.push(`Erro: ${error.response.data.message || 'Erro ao verificar status da tabela'}`);
    } else {
      output.value.push('Erro ao conectar com o servidor');
    }
  } finally {
    tableStatus.value.checking = false;
  }
}

// Criar tabela de usuários
async function createUsersTable() {
  if (isCreatingTable.value) return;
  
  try {
    isCreatingTable.value = true;
    output.value.push('Criando tabela de usuários...');
    
    const response = await api.post('/admin/developer/create-table');
    
    if (response.data.success) {
      output.value.push('Tabela de usuários criada com sucesso!');
      await checkTableStatus();
    } else {
      output.value.push(`Erro: ${response.data.message}`);
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      output.value.push(`Erro: ${error.response.data.message || 'Erro ao criar tabela de usuários'}`);
    } else {
      output.value.push('Erro ao conectar com o servidor');
    }
  } finally {
    isCreatingTable.value = false;
  }
}

// Criar usuários de teste
async function createTestUsers() {
  if (isCreatingUsers.value) return;
  
  // Confirmar antes de criar muitos usuários
  if (userSettings.count > 1000) {
    try {
      await ElMessageBox.confirm(
        `Você está prestes a criar ${userSettings.count} usuários. Isso pode levar algum tempo e consumir recursos do servidor. Deseja continuar?`,
        'Confirmação',
        {
          confirmButtonText: 'Sim, criar usuários',
          cancelButtonText: 'Cancelar',
          type: 'warning'
        }
      );
    } catch (e) {
      return; // Usuário cancelou
    }
  }
  
  try {
    isCreatingUsers.value = true;
    output.value.push(`Criando ${userSettings.count} usuários de teste...`);
    
    const response = await api.post('/admin/developer/create-users', {
      count: userSettings.count,
      batchSize: userSettings.batchSize,
      continueFromLast: userSettings.continueFromLast
    });
    
    if (response.data.success) {
      output.value.push(`${response.data.created} usuários criados com sucesso!`);
      if (response.data.errors > 0) {
        output.value.push(`${response.data.errors} erros ocorreram durante a criação.`);
        
        // Exibir exemplos de erros se disponíveis
        if (response.data.errorSamples && response.data.errorSamples.length > 0) {
          output.value.push('Exemplos de erros:');
          response.data.errorSamples.forEach((error: { email: string; error: string }) => {
            output.value.push(`- ${error.email}: ${error.error}`);
          });
          
          if (response.data.errors > response.data.errorSamples.length) {
            output.value.push(`... e mais ${response.data.errors - response.data.errorSamples.length} erros.`);
          }
        }
      }
      await checkTableStatus();
    } else {
      output.value.push(`Erro: ${response.data.message}`);
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      output.value.push(`Erro: ${error.response.data.message || 'Erro ao criar usuários de teste'}`);
    } else {
      output.value.push('Erro ao conectar com o servidor');
    }
  } finally {
    isCreatingUsers.value = false;
  }
}

// Limpar console
function clearOutput() {
  output.value = [];
}

// Verificar status ao montar o componente
onMounted(() => {
  checkTableStatus();
});
</script>

<template>
  <div class="developer-container">
    <h1 class="text-2xl font-semibold text-white mb-6">Ferramentas de Desenvolvedor</h1>
    
    <div class="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
      <h2 class="text-xl font-semibold text-white mb-4">Status da Tabela de Usuários</h2>
      
      <div class="flex items-center mb-4">
        <div class="flex-1">
          <p class="text-gray-300">
            <span v-if="tableStatus.checking">Verificando...</span>
            <span v-else-if="tableStatus.exists">
              A tabela de usuários existe. Total de usuários: {{ tableStatus.userCount }}
            </span>
            <span v-else>A tabela de usuários não existe.</span>
          </p>
          <p v-if="tableStatus.lastEmail" class="text-gray-400 text-sm mt-1">
            Último email: {{ tableStatus.lastEmail }}
          </p>
        </div>
        
        <el-button 
          type="primary" 
          :loading="tableStatus.checking" 
          @click="checkTableStatus"
        >
          Atualizar Status
        </el-button>
      </div>
      
      <el-button 
        type="success" 
        :loading="isCreatingTable" 
        :disabled="tableStatus.exists" 
        @click="createUsersTable"
      >
        Criar Tabela de Usuários
      </el-button>
    </div>
    
    <div class="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
      <h2 class="text-xl font-semibold text-white mb-4">Criar Usuários de Teste</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-gray-400 mb-2">Número de Usuários</label>
          <el-input-number 
            v-model="userSettings.count" 
            :min="1" 
            :max="300000" 
            :step="10"
            :disabled="isCreatingUsers"
          />
        </div>
        
        <div>
          <label class="block text-gray-400 mb-2">Tamanho do Lote</label>
          <el-input-number 
            v-model="userSettings.batchSize" 
            :min="10" 
            :max="10000" 
            :step="100"
            :disabled="isCreatingUsers"
          />
        </div>
        
        <div class="flex items-end">
          <el-checkbox 
            v-model="userSettings.continueFromLast"
            :disabled="isCreatingUsers"
            class="text-gray-300"
          >
            Continuar do último usuário
          </el-checkbox>
        </div>
      </div>
      
      <el-button 
        type="primary" 
        :loading="isCreatingUsers" 
        @click="createTestUsers"
      >
        Criar Usuários de Teste
      </el-button>
    </div>
    
    <div class="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-white">Console</h2>
        <el-button 
          type="info" 
          size="small" 
          @click="clearOutput"
        >
          Limpar Console
        </el-button>
      </div>
      
      <div class="console-output bg-gray-900 p-4 rounded-lg text-gray-300 font-mono text-sm h-64 overflow-y-auto">
        <div v-if="output.length === 0" class="text-gray-500">
          Nenhuma saída para exibir.
        </div>
        <div v-for="(line, index) in output" :key="index" class="mb-1">
          {{ line }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.developer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.console-output {
  white-space: pre-wrap;
  word-break: break-word;
}
</style> 