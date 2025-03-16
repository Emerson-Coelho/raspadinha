import express from 'express';
import {
  loginAdmin,
  getAdminProfile,
  registerAdmin
} from '../controllers/adminAuth.js';

import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserPassword
} from '../controllers/adminUserController.js';

import {
  getTableStatus,
  createTestUsers
} from '../controllers/adminDeveloperController.js';

import { protect, authorize } from '../middleware/adminAuth.js';

const router = express.Router();

// Rotas públicas
router.post('/login', loginAdmin);

// Rota para verificar token
router.get('/verify-token', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token válido',
    admin: req.admin
  });
});

// Rotas protegidas
router.get('/profile', protect, getAdminProfile);
router.post('/register', protect, authorize('super_admin'), registerAdmin);

// Rotas de gerenciamento de usuários
router.get('/users', protect, getUsers);
router.get('/users/:id', protect, getUserById);
router.put('/users/:id', protect, updateUser);
router.delete('/users/:id', protect, authorize('super_admin'), deleteUser);
router.put('/users/:id/change-password', protect, changeUserPassword);

// Rotas de desenvolvedor (apenas super_admin)
router.get('/developer/table-status', protect, authorize('super_admin'), getTableStatus);
router.post('/developer/create-users', protect, authorize('super_admin'), createTestUsers);

export default router; 