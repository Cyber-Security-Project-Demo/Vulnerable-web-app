import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import session from 'express-session';
import { exec } from 'child_process';

const app = express();
const PORT = 5000;

// Middleware - INTENTIONALLY VULNERABLE
app.use(cors({
  origin: true, // Allow all origins - CSRF vulnerability
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'weak-secret', // Weak secret
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Should be true in production
    httpOnly: false // CSRF vulnerability
  }
}));

// Database connection - INTENTIONALLY VULNERABLE
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // No password - vulnerable
  database: 'vulnerable_bank',
  port: 3306
};

let db;

async function connectDB() {
  try {
    // First try to connect without database to create it
    const tempConfig = { ...dbConfig };
    delete tempConfig.database;
    
    db = await mysql.createConnection(tempConfig);
    console.log('Connected to MySQL server');
    
    // Create database if it doesn't exist
    await db.execute('CREATE DATABASE IF NOT EXISTS vulnerable_bank');
    await db.end();
    
    // Now connect to the specific database
    db = await mysql.createConnection(dbConfig);
    console.log('Connected to vulnerable_bank database');
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('Please ensure XAMPP MySQL is running and try again');
    process.exit(1);
  }
}

// Initialize database
async function initializeDatabase() {
  try {
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        balance DECIMAL(15, 2) DEFAULT 1000.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Transactions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('deposit', 'withdraw', 'transfer') NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        recipient_id INT DEFAULT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (recipient_id) REFERENCES users(id)
      )
    `);

    // Insert demo users with weak passwords
    const demoUsers = [
      { username: 'admin', email: 'admin@bank.com', password: 'admin123', full_name: 'Administrator', balance: 50000 },
      { username: 'john_doe', email: 'john@example.com', password: 'password', full_name: 'John Doe', balance: 5000 },
      { username: 'jane_smith', email: 'jane@example.com', password: '123456', full_name: 'Jane Smith', balance: 3000 },
      { username: 'bob_wilson', email: 'bob@example.com', password: 'qwerty', full_name: 'Bob Wilson', balance: 2000 }
    ];

    for (const user of demoUsers) {
      try {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await db.execute(
          'INSERT IGNORE INTO users (username, email, password, full_name, balance) VALUES (?, ?, ?, ?, ?)',
          [user.username, user.email, hashedPassword, user.full_name, user.balance]
        );
      } catch (error) {
        // User already exists, skip
        console.log(`User ${user.username} already exists, skipping...`);
      }
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error.message);
    throw error;
  }
}

// Routes

// Landing page data
app.get('/api/landing', (req, res) => {
  res.json({
    message: 'Welcome to InsecureBank - Your Intentionally Vulnerable Banking Demo',
    features: [
      'Vulnerable Online Banking',
      'Educational Security Demos',
      'Penetration Testing Lab',
      'Cybersecurity Learning'
    ]
  });
});

// Registration - SQL Injection Vulnerable
app.post('/api/register', async (req, res) => {
  const { username, email, password, fullName } = req.body;
  
  try {
    // VULNERABLE: Direct string interpolation - SQL Injection
    const query = `INSERT INTO users (username, email, password, full_name) VALUES ('${username}', '${email}', '${password}', '${fullName}')`;
    console.log('Executing query:', query); // Debug log
    await db.query(query);
    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Login - SQL Injection Vulnerable
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // VULNERABLE: Direct string interpolation - SQL Injection
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    console.log('Executing query:', query); // Debug log
    const [rows] = await db.query(query);
    
    if (rows.length > 0) {
      const user = rows[0];
      const token = jwt.sign({ userId: user.id, username: user.username }, 'weak-jwt-secret');
      
      req.session.userId = user.id;
      res.cookie('auth_token', token, { httpOnly: false }); // CSRF vulnerable
      
      res.json({ 
        success: true, 
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          balance: user.balance
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user data - IDOR Vulnerable
app.get('/api/user/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // VULNERABLE: No access control - IDOR
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (rows.length > 0) {
      const user = rows[0];
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        balance: user.balance
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get transactions - IDOR Vulnerable
app.get('/api/transactions/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // VULNERABLE: No access control - IDOR
    const [rows] = await db.execute(`
      SELECT t.*, u2.username as recipient_username 
      FROM transactions t 
      LEFT JOIN users u2 ON t.recipient_id = u2.id 
      WHERE t.user_id = ? 
      ORDER BY t.created_at DESC
    `, [userId]);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Money transfer - CSRF Vulnerable
app.post('/api/transfer', async (req, res) => {
  const { fromUserId, toUsername, amount, description } = req.body;
  
  try {
    // VULNERABLE: No CSRF protection
    const [toUserRows] = await db.execute('SELECT id FROM users WHERE username = ?', [toUsername]);
    
    if (toUserRows.length === 0) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    const toUserId = toUserRows[0].id;
    
    // Update balances
    await db.execute('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, fromUserId]);
    await db.execute('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, toUserId]);
    
    // Record transaction
    await db.execute(
      'INSERT INTO transactions (user_id, type, amount, recipient_id, description) VALUES (?, ?, ?, ?, ?)',
      [fromUserId, 'transfer', amount, toUserId, description]
    );
    
    res.json({ success: true, message: 'Transfer completed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// System command execution - Command Injection Vulnerable
app.post('/api/system/ping', (req, res) => {
  const { host } = req.body;
  
  // VULNERABLE: Direct command execution - Command Injection
  const command = `ping -c 4 ${host}`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    
    res.json({ 
      output: stdout,
      error: stderr 
    });
  });
});

// Search users - XSS Vulnerable
app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  
  try {
    // VULNERABLE: Reflects user input without sanitization - XSS
    const [rows] = await db.execute(
      `SELECT id, username, full_name FROM users WHERE username LIKE '%${query}%' OR full_name LIKE '%${query}%'`
    );
    
    res.json({
      query: query, // Reflects back user input - XSS vulnerable
      results: rows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (for admin) - IDOR Vulnerable
app.get('/api/admin/users', async (req, res) => {
  try {
    // VULNERABLE: No authentication check
    const [rows] = await db.execute('SELECT id, username, email, full_name, balance FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile - XSS Vulnerable
app.put('/api/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const { fullName, email } = req.body;
  
  try {
    // VULNERABLE: No input sanitization - stored XSS
    await db.execute(
      'UPDATE users SET full_name = ?, email = ? WHERE id = ?',
      [fullName, email, userId]
    );
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// VULNERABLE: Delete user endpoint - No authorization check (IDOR)
app.delete('/api/admin/user/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // VULNERABLE: No admin check - anyone can delete users
    // VULNERABLE: No CSRF protection
    await db.execute('DELETE FROM users WHERE id = ?', [userId]);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Password reset request endpoint
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    // VULNERABLE: User enumeration - reveals if email exists
    const [users] = await db.query(
      'SELECT id, username FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Email not found in our system' });
    }
    
    // In a real app, send email with reset token
    // For demo purposes, just return success
    res.json({ 
      success: true, 
      message: 'Password reset instructions sent to your email',
      // VULNERABLE: Exposing username
      username: users[0].username
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start server
connectDB().then(() => {
  initializeDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Vulnerable Bank Server running on port ${PORT}`);
      console.log(`⚠️  WARNING: This application contains intentional security vulnerabilities for educational purposes only!`);
    });
  });
});