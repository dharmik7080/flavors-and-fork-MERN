import mongoose from 'mongoose';

const tableLockSchema = new mongoose.Schema({
  tableNo: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Compound unique index on tableNo, date, and timeSlot
tableLockSchema.index({ tableNo: 1, date: 1, timeSlot: 1 }, { unique: true });

// Create a MongoDB TTL index so expired locks delete automatically
tableLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TableLock = mongoose.model('TableLock', tableLockSchema);

export default TableLock;
