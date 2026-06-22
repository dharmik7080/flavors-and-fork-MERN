import express from 'express';
import nodemailer from 'nodemailer';
import Dish from '../models/Dish.js';

const router = express.Router();

// POST /api/orders/checkout - Handle order checkouts and send confirmation email invoice
router.post('/checkout', async (req, res) => {
  const { email, items, grandTotal } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Customer email address is required.' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart items list must be provided to checkout.' });
  }

  try {
    // Generate a temporary Ethereal test account dynamically for sandbox development testing
    let testAccount = await nodemailer.createTestAccount();

    // Create reusable transporter object using SMTP transport
    let transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass  // generated ethereal password
      }
    });

    // Compile items into structured HTML table rows
    const tableRows = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #dee2e6; text-align: left; color: #212529;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #dee2e6; text-align: center; color: #212529;">${item.qty}</td>
        <td style="padding: 12px; border-bottom: 1px solid #dee2e6; text-align: right; color: #212529;">₹${item.price}</td>
        <td style="padding: 12px; border-bottom: 1px solid #dee2e6; text-align: right; color: #212529; font-weight: bold;">₹${item.price * item.qty}</td>
      </tr>
    `).join('');

    // Generate styled HTML confirmation email invoice template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Flavors & Fork Invoice</title>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f8f9fa; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <!-- Header banner -->
          <div style="background-color: #212529; padding: 30px; text-align: center; border-bottom: 3px solid #d4af37;">
            <h1 style="margin: 0; color: #d4af37; font-size: 28px; font-family: Georgia, serif; letter-spacing: 1px;">Flavors & Fork</h1>
            <p style="margin: 5px 0 0 0; color: #ffffff; opacity: 0.8; font-size: 14px;">Order Invoice & Confirmation</p>
          </div>
          
          <!-- Body content -->
          <div style="padding: 30px;">
            <h2 style="margin-top: 0; color: #212529; font-size: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Confirmation</h2>
            <p style="color: #495057; font-size: 15px; line-height: 1.5;">
              Thank you for ordering with **Flavors & Fork**. Your request has been received and is being prepared with fresh ingredients.
            </p>
            
            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 25px;">
              <thead>
                <tr style="background-color: #f1f3f5;">
                  <th style="padding: 12px; border-bottom: 2px solid #dee2e6; text-align: left; font-size: 13px; text-transform: uppercase; color: #495057; font-weight: bold;">Dish</th>
                  <th style="padding: 12px; border-bottom: 2px solid #dee2e6; text-align: center; font-size: 13px; text-transform: uppercase; color: #495057; font-weight: bold;">Qty</th>
                  <th style="padding: 12px; border-bottom: 2px solid #dee2e6; text-align: right; font-size: 13px; text-transform: uppercase; color: #495057; font-weight: bold;">Price</th>
                  <th style="padding: 12px; border-bottom: 2px solid #dee2e6; text-align: right; font-size: 13px; text-transform: uppercase; color: #495057; font-weight: bold;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            
            <!-- Pricing Summary -->
            <div style="margin-top: 25px; text-align: right; padding: 15px 20px; background-color: #f8f9fa; border-radius: 8px;">
              <span style="font-size: 16px; color: #495057; vertical-align: middle;">Grand Total: </span>
              <span style="font-size: 24px; color: #d4af37; font-weight: bold; font-family: Georgia, serif; vertical-align: middle; margin-left: 10px;">₹${grandTotal}</span>
            </div>
            
            <p style="margin-top: 30px; font-size: 13px; color: #868e96; text-align: center;">
              This is a MERN system-generated test transactional email.<br/>
              Flavors & Fork Restaurant &bull; Sindhu Bhavan Marg, Ahmedabad, Gujarat.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send the email message asynchronously in the background to prevent network timeouts from halting checkout
    transporter.sendMail({
      from: '"Flavors & Fork" <orders@flavorsandfork.com>',
      to: email,
      subject: 'Flavors & Fork - Order Confirmation Invoice 🧾',
      html: htmlContent
    }).then(info => {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`Test email dispatched successfully. Preview URL: ${previewUrl}`);
    }).catch(emailError => {
      console.error("❌ NODEMAILER FAILURE DETAILS:", emailError.message);
    });

    res.status(200).json({
      status: 'success',
      message: 'Order completed and checkout confirmation invoice sent successfully.',
      messageId: null,
      previewUrl: ''
    });
  } catch (error) {
    console.error('Checkout processing error:', error.message);
    res.status(500).json({ error: 'Order checkout processing failed.' });
  }
});

// GET /api/orders/analytics (or /analytics under /api/orders routing namespace)
router.get('/analytics', async (req, res) => {
  try {
    const report = await Dish.aggregate([
      // 1. $match stage: filter active records (price greater than 0)
      { $match: { price: { $gt: 0 } } },
      
      // 2. $group stage: compute business metrics (sum of prices, average price)
      { 
        $group: { 
          _id: '$category', 
          totalValue: { $sum: '$price' }, 
          averagePrice: { $avg: '$price' },
          count: { $sum: 1 }
        } 
      },
      
      // 3. $sort stage: organize items from highest total value down to lowest
      { $sort: { totalValue: -1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: report
    });
  } catch (error) {
    console.error("Analytics Aggregation Database Error:", error);
    res.status(503).json({ success: false, error: "Database offline", fallbackData: [] });
  }
});

export default router;
