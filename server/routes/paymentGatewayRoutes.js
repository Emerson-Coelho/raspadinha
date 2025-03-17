import express from 'express';
import {
  getPaymentGateways,
  getPaymentGatewayById,
  updatePaymentGateway,
  initializePaymentGateways,
  toggleGatewayActive
} from '../controllers/paymentGatewayController.js';

import { protect, authorize } from '../middleware/adminAuth.js';

const router = express.Router();

// Todas as rotas requerem autenticação de administrador
router.use(protect);

// Rotas para gateways de pagamento
router.get('/', getPaymentGateways);
router.get('/:id', getPaymentGatewayById);
router.put('/:id', updatePaymentGateway);
router.patch('/:id/toggle-active', toggleGatewayActive);
router.post('/initialize', initializePaymentGateways);

export default router; 