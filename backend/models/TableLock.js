import mongoose from 'mongoose';

const tableLockSchema = new mongoose.Schema({
  tableId: {
    type: String,
    required: true,
    unique: true
  },
  lockedBy: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Create a MongoDB TTL index so expired locks delete automatically
tableLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TableLock = mongoose.model('TableLock', tableLockSchema);

export default TableLock;
