// Arquivo de constantes da aplicação
(function() {
  // Verificar se o módulo já existe, se não, criar
  try {
    angular.module('raspadinhaApp');
  } catch (err) {
    // O módulo não existe, criar
    angular.module('raspadinhaApp', []);
  }
  
  // Adicionar constantes ao módulo
  angular.module('raspadinhaApp').constant('APP_CONSTANTS', {
    // API URL
    API_URL: 'https://3027-206-42-26-49.ngrok-free.app/api',
    
    // Chaves de armazenamento
    STORAGE_KEYS: {
        TOKEN: 'raspadinha_token',
        USER: 'raspadinha_user',
        REMEMBER_ME: 'raspadinha_remember_me'
    },
    
    // Chaves para administrador
    ADMIN_TOKEN_KEY: 'raspadinha_admin_token',
    
    // Mensagens de erro
    ERROR_MESSAGES: {
        SERVER_ERROR: 'Erro de servidor. Tente novamente mais tarde.',
        INVALID_CREDENTIALS: 'Credenciais inválidas. Verifique seu e-mail e senha.',
        CONNECTION_ERROR: 'Erro de conexão. Verifique sua internet.',
        SESSION_EXPIRED: 'Sua sessão expirou. Por favor, faça login novamente.'
    },
    
    // Configurações de jogos
    GAMES: {
        DEFAULT_CREDIT_VALUE: 1.00,
        MAX_DAILY_PLAYS: 50,
        PAYOUT_PERCENTAGE: 70,
        MIN_DEPOSIT: 10.00,
        MAX_WITHDRAWAL: 5000.00
    },
    
    // URLs externas
    EXTERNAL_URLS: {
        TERMS: 'https://raspadinha.com/termos',
        PRIVACY: 'https://raspadinha.com/privacidade',
        SUPPORT: 'https://raspadinha.com/suporte',
        FACEBOOK: 'https://facebook.com/raspadinha',
        INSTAGRAM: 'https://instagram.com/raspadinha',
        TWITTER: 'https://twitter.com/raspadinha'
    }
  });
})(); 