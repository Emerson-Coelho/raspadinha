/**
 * Enum para os tipos de log
 */
export enum LogType {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Interface para os logs do sistema
 */
export interface SystemLog {
  id: string;
  type: LogType;
  source: string;
  message: string;
  details: any;
  userId?: string;
  adminId?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para paginação
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * Interface para resposta paginada
 */
export interface PaginatedResponse<T> {
  success: boolean;
  pagination: Pagination;
  data: T[];
}

/**
 * Interface para estatísticas de logs
 */
export interface LogStats {
  byType: {
    type: LogType;
    count: number;
  }[];
  bySource: {
    source: string;
    count: number;
  }[];
  byResolution: {
    resolved: boolean;
    count: number;
  }[];
  byDay: {
    date: string;
    count: number;
  }[];
}

/**
 * Interface para filtros de logs
 */
export interface LogFilters {
  type?: LogType;
  source?: string;
  resolved?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
} 