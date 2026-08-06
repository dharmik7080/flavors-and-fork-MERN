import express from 'express';
import nodemailer from 'nodemailer';
import Reservation from '../models/Reservation.js';
import authMiddleware from '../middleware/authMiddleware.js';
import TableLock from '../models/TableLock.js';

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
router.post('/', authMiddleware, async (req, res) => {
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

// POST /api/reservations/lock-table - Lock a table temporarily (userId from body — works cross-origin)
router.post('/lock-table', async (req, res) => {
  try {
    const { tableNo, date, timeSlot, userId } = req.body;
    const currentUserId = userId || req.session?.user?.id || req.session?.user?._id;

    if (!tableNo || !date || !timeSlot || !currentUserId) {
      return res.status(400).json({ error: 'tableNo, date, timeSlot, and userId are required!' });
    }

    // 1. Delete expired locks for this specific table slot to avoid blocking new locks
    await TableLock.deleteMany({ 
      tableNo, 
      date, 
      timeSlot, 
      expiresAt: { $lte: new Date() } 
    });

    // 2. Check if there is an active lock for this specific table, date, and timeSlot
    const existingLock = await TableLock.findOne({ tableNo, date, timeSlot });

    if (existingLock) {
      if (String(existingLock.lockedBy) === String(currentUserId)) {
        // If the current user already holds the lock for that specific tableNo, extend the expiresAt timestamp
        existingLock.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await existingLock.save();
        console.log(`[LOCK EXTENDED] Table #${tableNo} lock extended for user ${currentUserId}`);
        return res.status(200).json({
          success: true,
          message: `Table #${tableNo} lock extended.`,
          lock: existingLock
        });
      } else {
        // Return HTTP 409 Conflict ONLY if active lock is held by another user
        console.warn(`[LOCK CONFLICT] Table #${tableNo} is already locked by another user`);
        return res.status(409).json({ error: 'This table has already been claimed by another device.' });
      }
    }

    // 3. Create a new lock valid for 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const lock = new TableLock({
      tableNo,
      date,
      timeSlot,
      lockedBy: currentUserId,
      expiresAt
    });

    await lock.save();
    console.log(`[LOCK] Table #${tableNo} locked for user ${currentUserId} on slot ${date} ${timeSlot}`);

    res.status(201).json({
      success: true,
      message: `Table #${tableNo} temporarily locked.`,
      lock
    });
  } catch (error) {
    if (error.code === 11000) {
      console.warn(`[LOCK CONFLICT] Table is already locked for slot.`);
      return res.status(409).json({ error: 'This table has already been claimed by another device.' });
    }
    console.error('Failed to lock table:', error.message);
    res.status(500).json({ error: 'Failed to temporarily lock table' });
  }
});

// POST /api/reservations/release-lock - Release table lock (userId from body — works cross-origin)
router.post('/release-lock', async (req, res) => {
  try {
    const { tableNo, date, timeSlot, userId } = req.body;

    if (!tableNo || !date || !timeSlot || !userId) {
      return res.status(400).json({ error: 'tableNo, date, timeSlot, and userId are required!' });
    }

    await TableLock.deleteOne({ tableNo, date, timeSlot, lockedBy: userId });
    console.log(`[RELEASE] Table #${tableNo} released for user ${userId}`);

    res.json({ success: true, message: `Table #${tableNo} lock released.` });
  } catch (error) {
    console.error('Failed to release lock:', error.message);
    res.status(500).json({ error: 'Failed to release table lock' });
  }
});

// GET /api/reservations/active-locks - Get all unexpired locks for date and timeSlot
router.get('/active-locks', async (req, res) => {
  try {
    const { date, timeSlot } = req.query;
    if (!date || !timeSlot) {
      return res.status(400).json({ error: 'date and timeSlot query parameters are required!' });
    }

    // Purge expired locks first
    await TableLock.deleteMany({ expiresAt: { $lte: new Date() } });

    const activeLocks = await TableLock.find({
      date,
      timeSlot,
      expiresAt: { $gt: new Date() }
    });

    res.json(activeLocks);
  } catch (error) {
    console.error('Failed to fetch active locks:', error.message);
    res.status(500).json({ error: 'Failed to fetch active locks' });
  }
});

export default router;