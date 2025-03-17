import express from 'express';
import {
  getLogs,
  getLogById,
  resolveLog,
  getLogStats,
  cleanupOldLogs
} from '../controllers/systemLogController.js';

import { protect, authorize } from '../middleware/adminAuth.js';

const router = express.Router();

// Todas as rotas requerem autenticação de administrador
router.use(protect);

// Rotas para logs do sistema
router.get('/', getLogs);
router.get('/stats', getLogStats);
router.get('/:id', getLogById);
router.patch('/:id/resolve', resolveLog);

// Rota para limpar logs antigos (apenas super_admin)
router.delete('/cleanup', authorize('super_admin'), cleanupOldLogs);

export default router; 