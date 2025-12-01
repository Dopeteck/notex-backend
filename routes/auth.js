// routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'd142290f954317405e3ea375c24c48fd4ce28f7a022e63d8182cc05de07cf47454b1f049f8fc5a7e87f712bfa2ab4bf5c771280885d01d1f422caf6167e4d169';

// Generate token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username,
      email: user.email 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// User registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and email are required' 
      });
    }

    // Check if user exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'User already exists' 
      });
    }

    // Generate referral code
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Hash password (if provided)
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Create user
    const newUser = await db.query(
      `INSERT INTO users (username, email, password_hash, referral_code, plan, credits, wallet_balance)
       VALUES ($1, $2, $3, $4, 'free', 10, 0)
       RETURNING id, username, email, referral_code, plan, credits, wallet_balance, created_at`,
      [username, email, hashedPassword, referralCode]
    );

    const user = newUser.rows[0];
    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        referral_code: user.referral_code,
        plan: user.plan,
        credits: user.credits,
        wallet_balance: user.wallet_balance
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Registration failed' 
    });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username is required' 
      });
    }

    // Find user
    const userResult = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const user = userResult.rows[0];

    // Check password (if exists)
    if (user.password_hash && password) {
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid password' 
        });
      }
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        referral_code: user.referral_code,
        plan: user.plan,
        credits: user.credits,
        wallet_balance: user.wallet_balance,
        referrals_count: user.referrals_count,
        premium_until: user.premium_until
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed' 
    });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists
    const userResult = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: decoded
    });

  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
});

module.exports = router;