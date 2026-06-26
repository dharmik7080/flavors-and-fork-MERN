import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  items: [{
    name: {
      type: String,
      required: true
    },
    qty: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  grandTotal: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'Pending',
    enum: ['Pending', 'Preparing', 'Served', 'Cancelled']
  },
  tableNo: {
    type: String,
    default: 'N/A'
  },
  serviceType: {
    type: String,
    enum: ['dine-in', 'delivery'],
    default: 'dine-in'
  },
  deliveryAddress: {
    type: String,
    default: 'N/A'
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
