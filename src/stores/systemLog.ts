import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { SystemLog, LogFilters, LogStats, PaginatedResponse, Pagination } from '../types/system';
import axios from 'axios';
import { useAdminStore } from './admin';

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const useSystemLogStore = defineStore('systemLog', () => {
  // Estado
  const logs = ref<SystemLog[]>([]);
  const currentLog = ref<SystemLog | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const stats = ref<LogStats | null>(null);
  const filters = ref<LogFilters>({
    page: 1,
    limit: 50
  });

  // Store de admin para obter o token
  const adminStore = useAdminStore();

  // Getters
  const errorLogs = computed(() => logs.value.filter(log => log.type === 'error'));
  const warningLogs = computed(() => logs.value.filter(log => log.type === 'warning'));
  const infoLogs = computed(() => logs.value.filter(log => log.type === 'info'));
  const unresolvedLogs = computed(() => logs.value.filter(log => !log.resolved));
  const resolvedLogs = computed(() => logs.value.filter(log => log.resolved));

  // Configuração do axios com token de autenticação
  const getAuthConfig = () => {
    return {
      headers: {
        Authorization: `Bearer ${adminStore.adminToken}`
      }
    };
  };

  // Ações
  async function fetchLogs(newFilters?: LogFilters) {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Atualizar filtros se fornecidos
      if (newFilters) {
        filters.value = { ...filters.value, ...newFilters };
      }
      
      // Construir parâmetros de consulta
      const params = new URLSearchParams();
      
      if (filters.value.type) {
        params.append('type', filters.value.type);
      }
      
      if (filters.value.source) {
        params.append('source', filters.value.source);
      }
      
      if (filters.value.resolved !== undefined) {
        params.append('resolved', String(filters.value.resolved));
      }
      
      if (filters.value.startDate) {
        params.append('startDate', filters.value.startDate);
      }
      
      if (filters.value.endDate) {
        params.append('endDate', filters.value.endDate);
      }
      
      if (filters.value.search) {
        params.append('search', filters.value.search);
      }
      
      params.append('page', String(filters.value.page || 1));
      params.append('limit', String(filters.value.limit || 50));
      
      // Fazer a requisição
      const response = await axios.get<PaginatedResponse<SystemLog>>(
        `${API_URL}/admin/logs?${params.toString()}`,
        getAuthConfig()
      );
      
      if (response.data.success) {
        logs.value = response.data.data;
        pagination.value = response.data.pagination;
      } else {
        throw new Error('Falha ao buscar logs do sistema');
      }
      
      isLoading.value = false;
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
      error.value = 'Não foi possível carregar os logs do sistema.';
      isLoading.value = false;
    }
  }

  async function fetchLogById(id: string) {
    isLoading.value = true;
    error.value = null;
    currentLog.value = null;
    
    try {
      const response = await axios.get<{ success: boolean, data: SystemLog }>(
        `${API_URL}/admin/logs/${id}`,
        getAuthConfig()
      );
      
      if (response.data.success) {
        currentLog.value = response.data.data;
      } else {
        throw new Error('Falha ao buscar log');
      }
      
      isLoading.value = false;
    } catch (err) {
      console.error('Erro ao buscar log:', err);
      error.value = 'Não foi possível carregar o log.';
      isLoading.value = false;
    }
  }

  async function resolveLog(id: string, notes: string = '') {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.patch<{ success: boolean, data: SystemLog }>(
        `${API_URL}/admin/logs/${id}/resolve`,
        { notes },
        getAuthConfig()
      );
      
      if (response.data.success) {
        // Atualizar o log na lista
        const index = logs.value.findIndex(log => log.id === id);
        if (index !== -1) {
          logs.value[index] = response.data.data;
        }
        
        // Atualizar o log atual se estiver visualizando
        if (currentLog.value && currentLog.value.id === id) {
          currentLog.value = response.data.data;
        }
        
        isLoading.value = false;
        return true;
      } else {
        throw new Error('Falha ao resolver log');
      }
    } catch (err) {
      console.error('Erro ao resolver log:', err);
      error.value = 'Não foi possível marcar o log como resolvido.';
      isLoading.value = false;
      return false;
    }
  }

  async function fetchStats() {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.get<{ success: boolean, data: LogStats }>(
        `${API_URL}/admin/logs/stats`,
        getAuthConfig()
      );
      
      if (response.data.success) {
        stats.value = response.data.data;
      } else {
        throw new Error('Falha ao buscar estatísticas de logs');
      }
      
      isLoading.value = false;
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
      error.value = 'Não foi possível carregar as estatísticas de logs.';
      isLoading.value = false;
    }
  }

  async function cleanupOldLogs() {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.delete<{ success: boolean, message: string }>(
        `${API_URL}/admin/logs/cleanup`,
        getAuthConfig()
      );
      
      if (response.data.success) {
        // Recarregar logs após a limpeza
        await fetchLogs();
        await fetchStats();
        
        isLoading.value = false;
        return response.data.message;
      } else {
        throw new Error('Falha ao limpar logs antigos');
      }
    } catch (err) {
      console.error('Erro ao limpar logs antigos:', err);
      error.value = 'Não foi possível limpar os logs antigos.';
      isLoading.value = false;
      return null;
    }
  }

  return {
    // Estado
    logs,
    currentLog,
    isLoading,
    error,
    pagination,
    stats,
    filters,
    
    // Getters
    errorLogs,
    warningLogs,
    infoLogs,
    unresolvedLogs,
    resolvedLogs,
    
    // Ações
    fetchLogs,
    fetchLogById,
    resolveLog,
    fetchStats,
    cleanupOldLogs
  };
}); 