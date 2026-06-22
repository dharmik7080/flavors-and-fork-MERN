import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Dish from './models/Dish.js';
import User from './models/User.js';

const menuData = [
  {
    "id": 1,
    "name": "Paneer Tikka Masala",
    "category": "main",
    "type": "veg",
    "price": 350,
    "description": "Char-grilled paneer cubes in rich tomato gravy.",
    "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": 2,
    "name": "Chicken Kung Pao",
    "category": "main",
    "type": "non-veg",
    "price": 280,
    "description": "Spicy diced chicken with peanuts and chili peppers.",
    "image": "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": 3,
    "name": "Margherita Pizza",
    "category": "main",
    "type": "veg",
    "price": 400,
    "description": "Classic Italian pizza with fresh mozzarella and basil.",
    "image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": 4,
    "name": "Hakka Noodles",
    "category": "main",
    "type": "veg",
    "price": 220,
    "description": "Stir-fried noodles with crunchy vegetables.",
    "image": "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": 5,
    "name": "Butter Chicken",
    "category": "main",
    "type": "non-veg",
    "price": 380,
    "description": "Chicken cooked in a smooth, buttery tomato sauce.",
    "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": 6,
    "name": "Chocolate Brownie",
    "category": "dessert",
    "type": "veg",
    "price": 180,
    "description": "Fudgy walnut brownie served sizzling hot.",
    "image": "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    "id": 7,
    "name": "Veg Spring Rolls",
    "category": "starter",
    "type": "veg",
    "price": 180,
    "description": "Crispy golden rolls filled with savoury vegetables.",
    "image": "https://images.unsplash.com/photo-1695712641388-87c0f9c2d36e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    "id": 8,
    "name": "Pasta Alfredo",
    "category": "main",
    "type": "veg",
    "price": 320,
    "description": "Penne pasta tossed in a creamy white cheese sauce.",
    "image": "https://images.unsplash.com/photo-1662197480393-2a82030b7b83?q=80&w=988&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    "id": 9,
    "name": "Mojito",
    "category": "beverage",
    "type": "veg",
    "price": 150,
    "description": "Refreshing mint and lime cooler.",
    "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": 10,
    "name": "Gulab Jamun",
    "category": "dessert",
    "type": "veg",
    "price": 150,
    "description": "Soft fried dough balls soaked in sugar syrup.",
    "image": "https://images.pexels.com/photos/15014918/pexels-photo-15014918.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    "id": 11,
    "name": "Manchow Soup",
    "category": "starter",
    "type": "veg",
    "price": 160,
    "description": "Spicy Chinese soup topped with fried noodles.",
    "image": "https://images.unsplash.com/photo-1668420324023-73aa711a28cf?q=80&w=1027&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    "id": 12,
    "name": "Cold Coffee",
    "category": "beverage",
    "type": "veg",
    "price": 180,
    "description": "Classic chilled coffee blended with ice cream.",
    "image": "https://images.unsplash.com/photo-1592663527359-cf6642f54cff?q=80&w=1019&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    "id": 13,
    "name": "Masala Chai",
    "category": "beverage",
    "type": "veg",
    "price": 80,
    "description": "Traditional Indian tea brewed with spices.",
    "image": "https://plus.unsplash.com/premium_photo-1669905375164-388815c9dcf6?q=80&w=988&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    "id": 14,
    "name": "Garlic Bread",
    "category": "starter",
    "type": "veg",
    "price": 140,
    "description": "Toasted bread slices infused with garlic butter.",
    "image": "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?q=80&w=2096&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    "id": 15,
    "name": "Szechuan Fried Rice",
    "category": "main",
    "type": "veg",
    "price": 240,
    "description": "Spicy fried rice wok-tossed with szechuan sauce.",
    "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=1625&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  }
];

const seedData = async () => {
  try {
    await connectDB();

    // Clear old documents
    await Dish.deleteMany({});
    console.log('Successfully cleared existing Dish collection.');

    // Execute CRUD Create Operation to push array elements
    await Dish.insertMany(menuData);
    console.log("Data Seeded Perfectly!");

    // Seed default admin user uniquely
    const adminEmail = 'admin@flavorsandfork.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        surname: 'User',
        email: adminEmail,
        password: 'admin123',
        city: 'ahmedabad',
        role: 'admin',
        isAdmin: true
      });
      console.log('Admin user created successfully!');
    } else {
      console.log('Admin user already exists.');
    }

    // Clean connection close and exit
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
