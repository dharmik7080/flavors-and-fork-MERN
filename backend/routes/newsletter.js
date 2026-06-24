import express from 'express';
import Newsletter from '../models/Newsletter.js';

const router = express.Router();

// POST /api/newsletter/subscribe - Subscribe an email address to the newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required!' });
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email format!' });
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'You are already subscribed to our newsletter!' });
    }

    const newSubscriber = new Newsletter({
      email: email.trim().toLowerCase()
    });

    await newSubscriber.save();

    res.status(201).json({ status: 'success', message: 'Thank you for joining our community!' });
  } catch (error) {
    console.error('Newsletter subscription error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
