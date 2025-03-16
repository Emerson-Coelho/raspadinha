import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

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
          component: () => import('../views/auth/LoginView.vue')
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('../views/auth/RegisterView.vue')
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
      meta: { requiresAuth: true }
    },
    {
      path: '/deposit',
      name: 'deposit',
      component: () => import('../views/payment/DepositView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/withdraw',
      name: 'withdraw',
      component: () => import('../views/payment/WithdrawView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
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
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Verificar se a rota requer autenticação
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }
  
  // Verificar se a rota requer privilégios de administrador
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'home' });
    return;
  }
  
  next();
});

export default router; 