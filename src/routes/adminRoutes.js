import express from 'express';
import {
  loginAdmin,
  getAdminProfile,
  registerAdmin
} from '../controllers/adminAuth.js';

import { protect, authorize } from '../middleware/adminAuth.js';

const router = express.Router();

// Rotas públicas
router.post('/login', loginAdmin);

// Rotas protegidas
router.get('/profile', protect, getAdminProfile);
router.post('/register', protect, authorize('super_admin'), registerAdmin);

export default router; 