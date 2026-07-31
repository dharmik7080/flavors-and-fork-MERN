import express from 'express';
import Newsletter from '../models/Newsletter.js';
import { sendEmail } from '../utils/sendEmail.js';

const router = express.Router();

// POST /api/newsletter/subscribe - Public subscription route
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

    const trimmedEmail = email.trim().toLowerCase();

    // Check if email already exists in MongoDB
    const existing = await Newsletter.findOne({ email: trimmedEmail });
    if (existing) {
      return res.status(400).json({ error: 'Email is already subscribed!' });
    }

    const newSubscriber = new Newsletter({
      email: trimmedEmail
    });

    await newSubscriber.save();

    // Welcome email styling: Dark luxury MERN design for "Flavors & Fork"
    const welcomeHtml = `
      <div style="font-family: 'Playfair Display', Georgia, serif; background-color: #121212; color: #ffffff; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #f2c94c;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f2c94c; font-size: 2.5rem; margin: 0; letter-spacing: 2px;">Flavors & Fork</h1>
          <p style="color: #a0aec0; font-size: 1rem; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Premium Dining & Culinary Art</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #f2c94c; margin: 20px 0;" />
        <h2 style="color: #ffffff; font-size: 1.8rem; text-align: center; margin-bottom: 20px;">Welcome to the Inner Circle</h2>
        <p style="font-size: 1.1rem; line-height: 1.6; color: #e2e8f0; text-align: center; margin-bottom: 30px;">
          Thank you for joining our community. As a valued subscriber, you'll receive priority access to seasonal menu releases, private tasting events, and exclusive offers.
        </p>
        <div style="background-color: #1a1a1a; padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 30px; border: 1px solid #333;">
          <p style="color: #a0aec0; margin: 0 0 10px 0; font-size: 0.9rem; text-transform: uppercase;">Your Welcome Gift</p>
          <span style="font-size: 2.2rem; font-weight: bold; color: #f2c94c; letter-spacing: 3px; display: block; margin-bottom: 10px;">WELCOME10</span>
          <p style="color: #ffffff; margin: 0; font-size: 1rem;">Enjoy <strong style="color: #f2c94c;">10% OFF</strong> your first table reservation pre-order!</p>
        </div>
        <p style="font-size: 0.95rem; line-height: 1.6; color: #a0aec0; text-align: center;">
          We look forward to hosting your next dining experience.
        </p>
        <hr style="border: 0; border-top: 1px solid #333; margin: 30px 0;" />
        <div style="text-align: center; font-size: 0.8rem; color: #718096;">
          <p style="margin: 5px 0;">Flavors & Fork • 123 Gourmet Boulevard, Culinary District</p>
          <p style="margin: 5px 0;">If you did not sign up for this newsletter, please ignore this email.</p>
        </div>
      </div>
    `;

    // Dispatch welcome email asynchronously in a non-blocking way
    sendEmail({
      to: trimmedEmail,
      subject: '🥂 Welcome to the Table! (Your 10% Discount Inside) - Flavors & Fork',
      html: welcomeHtml
    }).catch(err => {
      console.error('❌ Non-blocking welcome email failed to send:', err.message);
    });

    res.status(201).json({ 
      status: 'success', 
      message: 'Successfully subscribed! Check your inbox for your discount.' 
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error.message);
    res.status(500).json({ error: 'Failed to process newsletter subscription' });
  }
});

// POST /api/newsletter/broadcast - Admin broadcast route to dispatch newsletter to all subscribers
router.post('/broadcast', async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message body parameters are required!' });
    }

    // Retrieve all subscribers
    const subscribers = await Newsletter.find({}, 'email');
    if (subscribers.length === 0) {
      return res.status(404).json({ error: 'No subscribers found in the mailing list.' });
    }

    const emailList = subscribers.map(sub => sub.email);

    // Format the message with the Flavors & Fork premium layout
    const formattedMessage = message.replace(/\n/g, '<br />');
    const broadcastHtml = `
      <div style="font-family: 'Playfair Display', Georgia, serif; background-color: #121212; color: #ffffff; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #f2c94c;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f2c94c; font-size: 2.5rem; margin: 0; letter-spacing: 2px;">Flavors & Fork</h1>
          <p style="color: #a0aec0; font-size: 1rem; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Exclusive Newsletter Dispatch</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #f2c94c; margin: 20px 0;" />
        <div style="font-size: 1.1rem; line-height: 1.8; color: #e2e8f0; margin-bottom: 35px;">
          ${formattedMessage}
        </div>
        <hr style="border: 0; border-top: 1px solid #333; margin: 30px 0;" />
        <div style="text-align: center; font-size: 0.8rem; color: #718096;">
          <p style="margin: 5px 0;">Flavors & Fork • 123 Gourmet Boulevard, Culinary District</p>
          <p style="margin: 5px 0;">You are receiving this because you subscribed to our dining newsletter. <a href="#" style="color: #f2c94c; text-decoration: none;">Unsubscribe</a></p>
        </div>
      </div>
    `;

    // Dispatch the email payload using bcc to preserve subscriber privacy
    const senderEmail = process.env.EMAIL_USER || 'dharmikthakkar2203@gmail.com';
    
    // We send TO ourselves, with BCC to all subscribers
    await sendEmail({
      to: senderEmail,
      bcc: emailList,
      subject: `${subject} - Flavors & Fork`,
      html: broadcastHtml
    });

    res.status(200).json({
      status: 'success',
      message: 'Newsletter broadcast dispatched successfully!',
      recipientCount: emailList.length
    });
  } catch (error) {
    console.error('Newsletter broadcast error:', error.message);
    res.status(500).json({ error: 'Failed to process newsletter broadcast dispatch' });
  }
});

// GET /api/newsletter/subscribers - Fetch subscribers metrics and list
router.get('/subscribers', async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.json({
      status: 'success',
      count: subscribers.length,
      subscribers
    });
  } catch (error) {
    console.error('Error fetching subscribers list:', error.message);
    res.status(500).json({ error: 'Failed to retrieve newsletter subscribers list' });
  }
});

export default router;
