import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
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
  tableId: {
    type: String,
    required: true
  },
  guestCount: {
    type: Number,
    required: true
  },
  preOrderItems: [{
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish'
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  grandTotal: {
    type: Number
  }
}, {
  timestamps: true
});

const Reservation = mongoose.model('Reservation', reservationSchema);

export default Reservation;
