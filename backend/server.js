import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectDB from './config/db.js';
import menuRouter from './routes/menu.js';
import authRouter from './routes/auth.js';
import uploadRouter from './routes/upload.js';
import orderRouter from './routes/order.js';
import reservationsRouter from './routes/reservations.js';
import newsletterRouter from './routes/newsletter.js';

import User from './models/User.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to Database and Seed Admin User
connectDB().then(async () => {
  try {
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
  } catch (error) {
    console.error('Error seeding admin user on startup:', error.message);
  }
});

// Middlewares
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://flavors-and-fork-mern.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(cookieParser());
app.use(session({
  secret: 'flavors_and_fork_secret_vibe_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production if running HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));
app.use(express.json());

// Serve uploads folder statically
app.use('/IMAGES', express.static('IMAGES'));

// Routes
app.use('/api/menu', menuRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/orders', orderRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/newsletter', newsletterRouter);

// Basic API Check Route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend server is running',
    timestamp: new Date()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Environment credentials and reservations updated successfully


