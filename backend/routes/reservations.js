import express from 'express';
import nodemailer from 'nodemailer';
import Reservation from '../models/Reservation.js';

const router = express.Router();

// Force Gmail SMTP production transporter directly using environment variables
const userEmail = process.env.EMAIL_USER || 'dharmikthakkar2203@gmail.com';
const userPass = process.env.EMAIL_PASS || 'lfkutelywvrpehgx';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // false for port 587 STARTTLS
  auth: {
    user: userEmail,
    pass: userPass
  },
  tls: {
    rejectUnauthorized: false, // bypass SSL verification failures if running on platforms with strict firewalls
    ciphers: 'SSLv3'
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000
});

// Immediately test SMTP connection configuration when the server boots
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ RESERVATION EMAIL TRANSPORTER VERIFICATION FAILED:', {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
  } else {
    console.log('🚀 RESERVATION EMAIL SMTP CONNECTION VERIFIED: Transporter is ready to deliver messages.');
  }
});

// GET /api/reservations/availability - Check which tables are booked for a date and time slot
router.get('/availability', async (req, res) => {
  try {
    const { date, timeSlot } = req.query;
    if (!date || !timeSlot) {
      return res.status(400).json({ error: 'date and timeSlot query parameters are required!' });
    }

    const reserved = await Reservation.find({ date, timeSlot }, 'tableId');
    const bookedTableIds = reserved.map(r => r.tableId);
    res.json(bookedTableIds);
  } catch (error) {
    console.error('Error fetching availability:', error.message);
    res.status(500).json({ error: 'Failed to check table availability' });
  }
});

// POST /api/reservations - Create reservation and trigger email confirmation
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, date, timeSlot, tableId, guestCount, preOrderItems, grandTotal } = req.body;

    if (!name || !phone || !email || !date || !timeSlot || !tableId || !guestCount) {
      return res.status(400).json({ error: 'All fields are required!' });
    }

    // Verify table is not already booked for the specific date and time slot
    const existingBooking = await Reservation.findOne({ date, timeSlot, tableId });
    if (existingBooking) {
      return res.status(400).json({ status: 'fail', error: 'This table is already booked for this specific time slot!' });
    }

    const NewReservation = new Reservation({
      name,
      phone,
      email,
      date,
      timeSlot,
      tableId,
      guestCount,
      preOrderItems,
      grandTotal
    });

    await NewReservation.save();

    // Set a cookie to remember the customer's last reserved table (24 hours expiration, readable by frontend JS)
    res.cookie('last_booked_table', NewReservation.tableId, { 
      maxAge: 24 * 60 * 60 * 1000, 
      httpOnly: false 
    });

    let preOrderHtml = '';
    if (preOrderItems && preOrderItems.length > 0) {
      const itemsList = preOrderItems.map(item => {
        const itemQty = item.qty || item.quantity || 1;
        return `
          <tr style="border-bottom: 1px solid #333;">
            <td style="padding: 10px; color: #ffffff;">${item.name}</td>
            <td style="padding: 10px; color: #ffffff; text-align: center;">${itemQty}</td>
            <td style="padding: 10px; color: #ffffff; text-align: right;">₹${item.price}</td>
            <td style="padding: 10px; color: #ffffff; text-align: right;">₹${item.price * itemQty}</td>
          </tr>
        `;
      }).join('');

      preOrderHtml = `
        <h3 style="color: #f2c94c; margin-top: 20px;">Pre-Ordered Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #1a1a1a;">
              <th style="padding: 10px; color: #f2c94c; text-align: left;">Dish</th>
              <th style="padding: 10px; color: #f2c94c; text-align: center;">Qty</th>
              <th style="padding: 10px; color: #f2c94c; text-align: right;">Price</th>
              <th style="padding: 10px; color: #f2c94c; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>
        <div style="text-align: right; margin-top: 15px; font-size: 1.1rem; color: #ffffff;">
          <strong>Grand Total:</strong> <span style="color: #f2c94c;">₹${grandTotal || 0}</span>
        </div>
      `;
    }

    const mailOptions = {
      from: `"Flavors & Fork" <${userEmail}>`,
      to: email,
      subject: '🍽️ Table Reservation Confirmed! - Flavors & Fork',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #121212; color: #ffffff; padding: 20px; border-radius: 8px;">
          <h1 style="color: #f2c94c;">Reservation Confirmed!</h1>
          <p>Hi ${name},</p>
          <p>Your table booking request has been securely processed. Here are your dining details:</p>
          <hr style="border-color: #f2c94c;" />
          <ul>
            <li><strong>Table Assigned:</strong> Table ${tableId}</li>
            <li><strong>Date:</strong> ${date}</li>
            <li><strong>Guests:</strong> ${guestCount}</li>
          </ul>
          ${preOrderHtml}
          <p>We look forward to serving you an incredible meal!</p>
        </div>
      `
    };

    // Return response payload matching your frontend expectations immediately
    res.status(201).json({
      status: 'success',
      message: 'Reservation confirmed successfully!',
      reservation: NewReservation,
      tableId: NewReservation.tableId
    });

    // Trigger email delivery asynchronously in the background
    transporter.sendMail(mailOptions, (mailError, info) => {
      if (mailError) {
        console.error("❌ NODEMAILER FAILURE DETAILS:", {
          message: mailError.message,
          code: mailError.code,
          command: mailError.command,
          stack: mailError.stack
        });
      } else {
        console.log('✅ NODEMAILER SUCCESS: Email sent ->', info.response);
      }
    });
  } catch (error) {
    console.error('Reservation booking error:', error.message);
    res.status(500).json({ error: 'Failed to process reservation booking' });
  }
});

// GET /api/reservations - Fetch existing reservations
router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error.message);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// DELETE /api/reservations/:id - Cancel/Clear a reservation by database ObjectId
router.delete('/:id', async (req, res) => {
  try {
    const reservationId = req.params.id;
    const deletedReservation = await Reservation.findByIdAndDelete(reservationId);

    if (!deletedReservation) {
      return res.status(404).json({ error: 'Reservation not found!' });
    }

    res.json({
      status: 'success',
      message: 'Reservation cleared successfully!'
    });
  } catch (error) {
    console.error('Error deleting reservation:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;