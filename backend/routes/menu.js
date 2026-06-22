import express from 'express';
import Dish from '../models/Dish.js';

const router = express.Router();

// GET /api/menu - Fetch all dishes
router.get('/', async (req, res) => {
  try {
    const dishes = await Dish.find({});
    res.json(dishes);
  } catch (error) {
    console.error('Error fetching menu items:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/menu/search - Predictive search using MongoDB text index and category filters
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const category = req.query.category || '';

    const filter = {};

    // Filter by category or type if active
    if (category && category !== 'all') {
      if (category === 'veg' || category === 'non-veg') {
        filter.type = category;
      } else {
        const normalized = category.toLowerCase().replace(/s$/, '');
        filter.category = { $regex: new RegExp(`^${normalized}`, 'i') };
      }
    }

    // Text search filter using MongoDB text index
    if (q) {
      filter.$text = { $search: q };
    }

    let matchedDishes = await Dish.find(filter);

    // Fallback to case-insensitive regex for partial matches if text search yields no results
    if (q && matchedDishes.length === 0) {
      delete filter.$text;
      const searchRegex = new RegExp(q, 'i');
      filter.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } }
      ];
      matchedDishes = await Dish.find(filter);
    }

    res.json(matchedDishes);
  } catch (error) {
    console.error('Error executing menu search:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/menu - Create a new dish item
router.post('/', async (req, res) => {
  try {
    const { name, category, type, price, description, image } = req.body;

    // Validation
    if (!name || !category || !type || !price || !description || !image) {
      return res.status(400).json({ error: 'All fields are required!' });
    }

    // Auto-generate incrementing ID
    const maxDish = await Dish.findOne().sort({ id: -1 });
    const nextId = maxDish ? maxDish.id + 1 : 1;

    const newDish = new Dish({
      id: nextId,
      name,
      category,
      type,
      price: Number(price),
      description,
      image
    });

    await newDish.save();

    res.status(201).json({
      status: 'success',
      message: 'Dish created successfully!',
      dish: newDish
    });
  } catch (error) {
    console.error('Error creating dish:', error.message);
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => error.errors[key].message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/menu/:id - Delete a dish item by numeric ID
router.delete('/:id', async (req, res) => {
  try {
    const dishId = Number(req.params.id);
    const deletedDish = await Dish.findOneAndDelete({ id: dishId });

    if (!deletedDish) {
      return res.status(404).json({ error: 'Dish not found!' });
    }

    res.json({
      status: 'success',
      message: 'Dish deleted successfully!',
      dish: deletedDish
    });
  } catch (error) {
    console.error('Error deleting dish:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
