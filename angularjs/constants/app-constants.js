// Constantes da aplicação
app.constant('APP_CONSTANTS', {
  // URL da API
  API_URL: 'https://3027-206-42-26-49.ngrok-free.app/api',
  
  // Chaves para armazenamento local
  TOKEN_KEY: 'raspadinha_token',
  USER_KEY: 'raspadinha_user',
  ADMIN_TOKEN_KEY: 'raspadinha_admin_token',
  
  // Estados da aplicação
  STATES: {
    HOME: 'home',
    LOGIN: 'login',
    REGISTER: 'register',
    PROFILE: 'profile',
    GAMES: 'games',
    GAME_DETAIL: 'game-detail',
    ADMIN_DASHBOARD: 'admin.dashboard',
    ADMIN_USERS: 'admin.users',
    ADMIN_GAMES: 'admin.games',
    ADMIN_TRANSACTIONS: 'admin.transactions'
  },
  
  // Tipos de notificação
  NOTIFICATION_TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning'
  },
  
  // Limites de paginação
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    DEFAULT_PAGE: 1
  },
  
  // Configurações de jogos
  GAME: {
    MIN_PRICE: 1.0,
    MAX_PRICE: 100.0,
    DEFAULT_PRICE: 5.0,
    MIN_WIN_CHANCE: 1, // 1%
    MAX_WIN_CHANCE: 50, // 50%
    SCRATCH_AREAS: {
      MIN: 3,
      MAX: 12,
      DEFAULT: 9
    },
    STATUS: {
      ACTIVE: 'active',
      INACTIVE: 'inactive',
      DRAFT: 'draft',
      ARCHIVED: 'archived'
    }
  },
  
  // Configurações de pagamentos
  PAYMENT: {
    METHODS: {
      PIX: 'pix',
      CREDIT_CARD: 'credit_card',
      DEBIT_CARD: 'debit_card',
      CRYPTO: 'crypto',
      BANK_TRANSFER: 'bank_transfer'
    },
    STATUS: {
      PENDING: 'pending',
      PROCESSING: 'processing',
      COMPLETED: 'completed',
      FAILED: 'failed',
      REFUNDED: 'refunded',
      CANCELLED: 'cancelled'
    },
    TRANSACTION_TYPES: {
      DEPOSIT: 'deposit',
      WITHDRAWAL: 'withdrawal',
      GAME_PURCHASE: 'game_purchase',
      PRIZE_PAYOUT: 'prize_payout',
      REFUND: 'refund',
      BONUS: 'bonus'
    },
    MIN_DEPOSIT: 10.0,
    MIN_WITHDRAWAL: 20.0
  },
  
  // Mensagens de erro
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet e tente novamente.',
    UNAUTHORIZED: 'Você não está autorizado para esta ação. Faça login novamente.',
    FORBIDDEN: 'Você não tem permissão para acessar este recurso.',
    NOT_FOUND: 'O recurso solicitado não foi encontrado.',
    SERVER_ERROR: 'Ocorreu um erro no servidor. Tente novamente mais tarde.',
    VALIDATION_ERROR: 'Verifique os dados informados e tente novamente.',
    INSUFFICIENT_FUNDS: 'Saldo insuficiente para realizar esta operação.',
    PAYMENT_FAILED: 'Falha no processamento do pagamento. Tente novamente ou use outro método.',
    GENERAL_ERROR: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
  },
  
  // Configurações de usuário
  USER: {
    ROLES: {
      USER: 'user',
      ADMIN: 'admin',
      SUPER_ADMIN: 'super_admin'
    },
    STATUS: {
      ACTIVE: 'active',
      INACTIVE: 'inactive',
      SUSPENDED: 'suspended',
      BANNED: 'banned'
    }
  }
}); 