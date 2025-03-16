import express from 'express';
import { login, register, getProfile, logout, refreshToken } from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas
router.post('/login', login);
router.post('/register', register);
router.post('/refresh-token', refreshToken);

// Rotas protegidas
router.get('/profile', protect, getProfile);
router.get('/logout', protect, logout);

export default router; 