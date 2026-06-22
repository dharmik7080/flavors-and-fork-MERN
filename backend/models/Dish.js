import mongoose from 'mongoose';

const dishSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['starters', 'main', 'desserts', 'beverages', 'starter', 'dessert', 'beverage'],
    lowercase: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Configure Text Index for advanced text search queries on name and description
dishSchema.index({ name: 'text', description: 'text' });

const Dish = mongoose.model('Dish', dishSchema);

export default Dish;
