import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay Instance
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('⚠️ Razorpay credentials missing in environment variables!');
  }

  return new Razorpay({
    key_id: keyId || 'rzp_test_mockKey123',
    key_secret: keySecret || 'mockSecretKey123'
  });
};

// Create a new Razorpay payment order
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Valid amount parameter is required.' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let orderId;
    let amountVal = Math.round(amount * 100);
    let currencyVal = 'INR';
    let receiptVal = `receipt_${Date.now()}`;

    if (!keyId || !keySecret || keyId === 'rzp_test_mockKey123' || keySecret === 'mockSecretKey123') {
      console.log('⚠️ Running in offline/mock Razorpay mode. Generating fake order ID...');
      orderId = `order_mock_${Math.random().toString(36).substring(2, 10)}`;
    } else {
      const razorpay = getRazorpayInstance();
      const options = {
        amount: amountVal,
        currency: currencyVal,
        receipt: receiptVal
      };
      const order = await razorpay.orders.create(options);
      orderId = order.id;
      amountVal = order.amount;
      currencyVal = order.currency;
      receiptVal = order.receipt;
    }

    res.status(201).json({
      status: 'success',
      orderId: orderId,
      amount: amountVal,
      currency: currencyVal,
      receipt: receiptVal
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error.message || error);
    res.status(500).json({ error: 'Failed to create payment order.' });
  }
};

// Verify Razorpay payment signature
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Order ID, Payment ID, and Signature are required for verification.' });
    }

    // Bypass cryptographic signature verification for mock/sandbox orders
    if (razorpay_order_id.startsWith('order_mock_')) {
      return res.status(200).json({
        status: 'success',
        message: 'Mock payment verified successfully.'
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'mockSecretKey123';
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.status(200).json({
        status: 'success',
        message: 'Payment signature verified successfully.'
      });
    } else {
      console.warn('⚠️ Razorpay signature mismatch detected!');
      res.status(400).json({
        status: 'fail',
        message: 'Invalid payment signature.'
      });
    }
  } catch (error) {
    console.error('Error verifying payment signature:', error.message || error);
    res.status(500).json({ error: 'Failed to verify payment signature.' });
  }
};
