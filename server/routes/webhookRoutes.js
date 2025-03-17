import express from 'express';
import { unifypayCallback } from '../controllers/webhookController.js';

const router = express.Router();

// Rotas de webhook (não requerem autenticação)
router.post('/unifypay/callback', unifypayCallback);

export default router; 