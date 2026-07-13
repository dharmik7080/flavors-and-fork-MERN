import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';

const router = express.Router();

// POST /api/payment/create-order - Instantiate a payment order
router.post('/create-order', createOrder);

// POST /api/payment/verify-payment - Validate signatures
router.post('/verify-payment', verifyPayment);

export default router;
