import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useAdminStore } from '../stores/admin';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/auth',
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('../views/auth/LoginView.vue'),
          meta: { isUserAuth: true }
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('../views/auth/RegisterView.vue'),
          meta: { isUserAuth: true }
        }
      ]
    },
    {
      path: '/games',
      component: () => import('../views/games/GamesLayout.vue'),
      children: [
        {
          path: '',
          redirect: { name: 'scratch-card' }
        },
        {
          path: 'scratch-card',
          name: 'scratch-card',
          component: () => import('../views/games/ScratchCardView.vue')
        },
        {
          path: 'lucky-number',
          name: 'lucky-number',
          component: () => import('../views/games/LuckyNumberView.vue')
        },
        {
          path: 'lucky-number/results',
          name: 'lucky-number-results',
          component: () => import('../views/games/LuckyNumberResultsView.vue')
        }
      ]
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/profile/ProfileView.vue'),
      meta: { requiresUserAuth: true }
    },
    {
      path: '/deposit',
      name: 'deposit',
      component: () => import('../views/payment/DepositView.vue'),
      meta: { requiresUserAuth: true }
    },
    {
      path: '/withdraw',
      name: 'withdraw',
      component: () => import('../views/payment/WithdrawView.vue'),
      meta: { requiresUserAuth: true }
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/admin/AdminLoginView.vue'),
      meta: { isAdminAuth: true }
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { requiresAdminAuth: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/DashboardView.vue')
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../views/admin/UsersView.vue')
        },
        {
          path: 'partners',
          name: 'admin-partners',
          component: () => import('../views/admin/PartnersView.vue')
        },
        {
          path: 'scratch-cards',
          name: 'admin-scratch-cards',
          component: () => import('../views/admin/ScratchCardsView.vue')
        },
        {
          path: 'lucky-draws',
          name: 'admin-lucky-draws',
          component: () => import('../views/admin/LuckyDrawsView.vue')
        },
        {
          path: 'reports',
          name: 'admin-reports',
          component: () => import('../views/admin/ReportsView.vue')
        },
        {
          path: 'settings',
          component: () => import('../views/admin/SettingsView.vue'),
          children: [
            {
              path: '',
              redirect: { name: 'admin-settings-gateways' }
            },
            {
              path: 'gateways',
              name: 'admin-settings-gateways',
              component: () => import('../views/admin/GatewaysSettingsView.vue')
            },
            {
              path: 'general',
              name: 'admin-settings-general',
              component: () => import('../views/admin/GeneralSettingsView.vue')
            }
          ]
        },
        {
          path: 'developer',
          name: 'admin-developer',
          component: () => import('../views/admin/DeveloperView.vue'),
          meta: { requiresSuperAdmin: true }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    }
  ]
});

// Proteção de rotas
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const adminStore = useAdminStore();
  
  // Inicializar stores se necessário
  if (!authStore.isAuthenticated) {
    await authStore.initialize();
  }
  
  if (!adminStore.isAdminAuthenticated) {
    await adminStore.initialize();
  }
  
  // Verificar se é uma rota de autenticação de usuário
  if (to.meta.isUserAuth) {
    // Se já estiver autenticado como usuário, redirecionar para a página inicial
    if (authStore.isAuthenticated) {
      next({ name: 'home' });
      return;
    }
    // Caso contrário, permitir acesso à página de login/registro
    next();
    return;
  }
  
  // Verificar se é uma rota de autenticação admin
  if (to.meta.isAdminAuth) {
    // Se já estiver autenticado como admin, redirecionar para o dashboard
    if (adminStore.isAdminAuthenticated) {
      next({ name: 'admin-dashboard' });
      return;
    }
    // Caso contrário, permitir acesso à página de login admin
    next();
    return;
  }
  
  // Verificar se a rota requer autenticação de usuário
  if (to.meta.requiresUserAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath, reason: 'not_authenticated' } });
    return;
  }
  
  // Verificar se a rota requer autenticação de administrador
  if (to.meta.requiresAdminAuth) {
    // Verificar se está autenticado como admin
    if (!adminStore.isAdminAuthenticated) {
      next({ name: 'admin-login', query: { redirect: to.fullPath, reason: 'not_authenticated' } });
      return;
    }
    
    // Verificar se o token é válido
    try {
      const isValid = await adminStore.verifyToken();
      if (!isValid) {
        next({ name: 'admin-login', query: { redirect: to.fullPath, reason: 'session_expired' } });
        return;
      }
    } catch (err) {
      next({ name: 'admin-login', query: { redirect: to.fullPath, reason: 'session_expired' } });
      return;
    }
  }
  
  // Verificar se a rota requer privilégios de super admin
  if (to.meta.requiresSuperAdmin) {
    // Verificar se está autenticado como super admin
    if (!adminStore.isSuperAdmin) {
      next({ name: 'admin-dashboard', query: { error: 'access_denied' } });
      return;
    }
  }
  
  next();
});

export default router; 