import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  createDeposit, 
  createWithdraw, 
  getTransactionStatus, 
  getUserTransactions 
} from '../controllers/transactionController.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(protect);

// Rotas para transações
router.post('/deposit', createDeposit);
router.post('/withdraw', createWithdraw);
router.get('/status/:transactionId?', getTransactionStatus);
router.get('/user', getUserTransactions);

export default router; 