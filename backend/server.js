import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();
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
import paymentRouter from './routes/paymentRoutes.js';
import locksRouter from './routes/locks.js';

import User from './models/User.js';

const app = express();
app.set('trust proxy', 1);
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
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.PORT;

app.use(session({
  secret: 'flavors_and_fork_secret_vibe_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
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
app.use('/api/payment', paymentRouter);
app.use('/api/locks', locksRouter);

// Handle both GET and HEAD requests on the root route  
app.route('/')  
  .get((req, res) => res.status(200).send("Flavors & Fork API is live"))  
  .head((req, res) => res.status(200).end());  

// Dedicated health check route
app.route('/api/health')  
  .get((req, res) => res.status(200).json({ status: 'ok', uptime: process.uptime() }))  
  .head((req, res) => res.status(200).end());  

// Basic API Check Route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend server is running',
    timestamp: new Date()
  });
});

// Start Server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log(`[SOCKET CONNECTED] Client ID: ${socket.id}`);

  // Admin room joining handler
  socket.on('join-admin-room', () => {
    socket.join('admin-room');
    console.log(`[SOCKET] Socket ${socket.id} joined 'admin-room'`);
  });

  // Table Lock Acquired event handler
  socket.on('table-lock-acquired', (data) => {
    socket.broadcast.emit('table-lock-updated', data);
    console.log(`[SOCKET BROADCAST] table-lock-updated broadcasted:`, data);
  });

  // Table Lock Released event handler
  socket.on('table-lock-released', (data) => {
    io.emit('table-lock-cleared', data);
    console.log(`[SOCKET BROADCAST] table-lock-cleared broadcasted:`, data);
  });

  // New Order Placed event handler
  socket.on('new-order-placed', (orderData) => {
    io.to('admin-room').emit('order-received', orderData);
    console.log(`[SOCKET BROADCAST] order-received emitted to admin-room:`, orderData);
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET DISCONNECTED] Client ID: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


