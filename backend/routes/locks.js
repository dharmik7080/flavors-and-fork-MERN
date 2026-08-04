import express from 'express';
import TableLock from '../models/TableLock.js';

import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/locks/lock-table - Lock a table for 5 minutes
router.post('/lock-table', authMiddleware, async (req, res) => {
  try {
    const { tableId } = req.body;
    const userId = req.session?.user?._id || req.body.lockedBy || req.body.userId;
    console.log('[LOCK ENGINE] POST /lock-table payload:', { tableId, body: req.body, resolvedUserId: userId });

    if (!tableId) {
      return res.status(400).json({ error: 'tableId is required' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'userId or guestSessionId is required' });
    }

    // 1. Clean up any expired locks first (expiresAt <= current date)
    await TableLock.deleteMany({ expiresAt: { $lte: new Date() } });

    // 2. Auto-release any previous tables locked by this same user to enforce a 1-lock-per-session limit
    await TableLock.deleteMany({ lockedBy: userId });

    // 3. Try to acquire the table lock for 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    const lock = await TableLock.create({
      tableId: String(tableId),
      lockedBy: userId,
      expiresAt
    });

    res.status(201).json({
      success: true,
      message: `Table #${tableId} successfully locked for 5 minutes`,
      lock
    });
  } catch (error) {
    // 3. Handle MongoDB duplicate key error (code 11000) cleanly
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This table has already been temporarily locked by another user.'
      });
    }
    console.error('Error locking table:', error.message);
    res.status(500).json({ error: 'Failed to temporarily lock table' });
  }
});

// GET /api/locks/active-locks - Get all active locks
router.get('/active-locks', async (req, res) => {
  try {
    // 1. Optional clean up of expired locks
    await TableLock.deleteMany({ expiresAt: { $lte: new Date() } });

    // 2. Query active locks
    const activeLocks = await TableLock.find({ expiresAt: { $gt: new Date() } });
    
    res.json(activeLocks);
  } catch (error) {
    console.error('Error fetching active locks:', error.message);
    res.status(500).json({ error: 'Failed to retrieve active table locks' });
  }
});

// POST /api/locks/release-lock - Manually unlock a table
router.post('/release-lock', async (req, res) => {
  try {
    const { tableId } = req.body;
    const userId = req.session?.user?._id || req.body.lockedBy || req.body.userId;

    if (!tableId) {
      return res.status(400).json({ error: 'tableId is required' });
    }

    // Prepare filter criteria. If userId is provided, release lock only if it belongs to that user.
    const query = { tableId: String(tableId) };
    if (userId) {
      query.lockedBy = userId;
    }

    const result = await TableLock.deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active lock found for this table, or it was locked by another user.'
      });
    }

    res.json({
      success: true,
      message: `Table #${tableId} lock successfully released`
    });
  } catch (error) {
    console.error('Error releasing lock:', error.message);
    res.status(500).json({ error: 'Failed to release table lock' });
  }
});

export default router;
