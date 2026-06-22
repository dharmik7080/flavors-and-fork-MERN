import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    lowercase: true
  },
  email: {
    type: String,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    minlength: 8,
    maxlength: 12
  },
  city: {
    type: String,
    enum: ['baroda', 'surat', 'ahmedabad']
  },
  role: {
    type: String,
    default: 'user'
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
