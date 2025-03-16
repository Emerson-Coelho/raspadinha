import express from 'express';
// Importar controladores de autenticação
// import { login, register, getProfile, logout } from '../controllers/auth.js';
// import { protect } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas
// router.post('/login', login);
// router.post('/register', register);

// Rotas protegidas
// router.get('/profile', protect, getProfile);
// router.get('/logout', protect, logout);

export default router; 