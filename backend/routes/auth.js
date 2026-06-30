import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// POST /api/auth/register - Register a new user with validation checks
router.post('/register', async (req, res) => {
  try {
    const { name, surname, email, password, city } = req.body;
    
    // Instantiate new User to run validation rules
    const newUser = new User({ name, surname, email, password, city });
    await newUser.save();
    
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        surname: newUser.surname,
        email: newUser.email,
        city: newUser.city
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => error.errors[key].message);
      return res.status(400).json({ status: 'fail', errors });
    }
    console.error('Registration error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/auth/savesession - Stores user details in req.session.user
router.post('/savesession', (req, res) => {
  const { user } = req.body;
  if (!user) {
    return res.status(400).json({ error: 'User details required to save session' });
  }

  req.session.user = user;
  
  res.json({
    status: 'success',
    message: 'User details saved to session',
    user: req.session.user
  });
});

// GET /api/auth/fetchsession - Validate cookie and check login session
router.get('/fetchsession', (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      loggedIn: true,
      user: req.session.user
    });
  } else {
    res.json({
      loggedIn: false,
      message: 'No active session found'
    });
  }
});

// POST /api/auth/deletesession - Teardown session and clear browser cookies
router.post('/deletesession', (req, res) => {
  if (!req.session) {
    return res.json({ status: 'success', message: 'No session to destroy' });
  }
  
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err.message);
      return res.status(500).json({ error: 'Failed to destroy session during logout' });
    }
    
    // Clear default express-session cookie
    res.clearCookie('connect.sid');
    
    res.json({
      status: 'success',
      message: 'Session destroyed and cookie cleared successfully'
    });
  });
});

// POST /api/auth/logout - Alias to teardown session and clear browser cookies
router.post('/logout', (req, res) => {
  if (!req.session) {
    return res.json({ status: 'success', message: 'No active session to destroy' });
  }
  
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err.message);
      return res.status(500).json({ error: 'Failed to destroy session during logout' });
    }
    
    // Clear default express-session cookie
    res.clearCookie('connect.sid');
    
    res.json({
      status: 'success',
      message: 'Session destroyed and cookie cleared successfully'
    });
  });
});


// POST /api/auth/login - Authenticate user and save session
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required!' });
    }

    // Default admin credential fallback
    if (email === 'admin@flavorsandfork.com' && password === 'admin123') {
      const adminPayload = {
        name: 'Default Admin',
        email: 'admin@flavorsandfork.com',
        isAdmin: true,
        role: 'admin'
      };
      req.session.user = adminPayload;
      return res.json({
        status: 'success',
        message: 'Logged in successfully!',
        user: adminPayload
      });
    }

    // Database lookup
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password!' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password!' });
    }

    const isAdmin = email.includes('admin') || user.name.toLowerCase().includes('admin');
    const userPayload = {
      id: user._id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      city: user.city,
      isAdmin,
      role: isAdmin ? 'admin' : 'user'
    };

    req.session.user = userPayload;

    res.json({
      status: 'success',
      message: 'Logged in successfully!',
      user: userPayload
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
