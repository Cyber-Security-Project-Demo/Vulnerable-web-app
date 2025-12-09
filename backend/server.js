import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import session from 'express-session';
import { exec } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
  host: process.env.MYSQL_ADDON_HOST || 'localhost',
  user: process.env.MYSQL_ADDON_USER || 'root',
  password: process.env.MYSQL_ADDON_PASSWORD || '',
  database: process.env.MYSQL_ADDON_DB || 'vulnerable_bank',
  port: process.env.MYSQL_ADDON_PORT || 3306
};

let db;

async function connectDB() {
  try {
    // Connect to database using environment variables
    db = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');
    
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('Please check your database credentials in .env file and try again');
    process.exit(1);
  }
}

// Initialize database
async function initializeDatabase() {
  try {
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    // Database tables should already exist from manual-db-setup.sql import
    console.log('Database tables ready (imported from manual-db-setup.sql)');
    
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
    
    // Simple SQL injection detection
    let injectionType = null;
    let injectionDetails = null;
    
    const input = `${username || ''} ${password || ''}`;
    
    if (input.includes("' OR 1=1") || input.includes("'--") || input.includes("' OR 'x'='x")) {
      injectionType = 'ERROR_BASED';
      injectionDetails = 'Error-based SQL injection detected - bypassing authentication';
    } else if (input.includes('UNION SELECT')) {
      injectionType = 'UNION_BASED';
      injectionDetails = 'Union-based SQL injection detected - attempting data extraction';
    } else if (input.includes("AND 1=1")) {
      injectionType = 'BOOLEAN_BLIND';
      injectionDetails = 'Boolean-based blind SQL injection detected';
    }
    
    const [rows] = await db.query(query);
    
    if (rows.length > 0) {
      const user = rows[0];
      const token = jwt.sign({ userId: user.id, username: user.username }, 'weak-jwt-secret');
      
      req.session.userId = user.id;
      res.cookie('auth_token', token, { httpOnly: false }); // CSRF vulnerable
      
      const response = { 
        success: true, 
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          balance: user.balance
        }
      };
      
      // Add SQL injection details if detected
      if (injectionType) {
        response.sqlInjection = {
          type: injectionType,
          details: injectionDetails,
          query: query,
          bypassedAuth: true
        };
      }
      
      res.json(response);
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    
    // Check if it's a SQL error (part of SQL injection demonstration)
    const isSQLError = error.code === 'ER_PARSE_ERROR' || 
                      error.message.includes('SQL syntax') || 
                      error.message.includes('syntax error') || 
                      error.message.includes('different number of columns') ||
                      error.message.includes('UNION') ||
                      error.message.includes('near') ||
                      error.sqlState;
    
    if (isSQLError) {
      // This is expected for SQL injection demos - return as successful demonstration
      res.json({ 
        success: false, 
        message: 'Invalid credentials',
        sqlInjection: {
          type: 'ERROR_BASED',
          details: error.message.includes('different number of columns') ? 
                   'UNION SELECT failed - column count mismatch revealed' : 
                   error.message.includes('UNION') ?
                   'UNION-based SQL injection detected - attempting data extraction' :
                   'SQL syntax error revealed database structure',
          error: error.message,
          query: `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`,
          vulnerability: 'Database error disclosure'
        }
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: error.message
      });
    }
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
    // Fixed: Include both outgoing and incoming transactions
    const [rows] = await db.execute(`
      SELECT 
        t.*, 
        u2.username as recipient_username,
        u1.username as sender_username,
        CASE 
          WHEN t.user_id = ? THEN 'outgoing'
          WHEN t.recipient_id = ? THEN 'incoming'
          ELSE 'other'
        END as transaction_direction
      FROM transactions t 
      LEFT JOIN users u2 ON t.recipient_id = u2.id 
      LEFT JOIN users u1 ON t.user_id = u1.id
      WHERE t.user_id = ? OR t.recipient_id = ?
      ORDER BY t.created_at DESC
    `, [userId, userId, userId, userId]);
    
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
    // Change: derive sender from active session when available so attacks apply to the currently logged-in user.
    // Fallback to provided fromUserId to keep original demo behavior working.
    const senderUserId = (req.session && req.session.userId) ? req.session.userId : fromUserId;

    if (!senderUserId) {
      return res.status(400).json({ message: 'Missing sender user context' });
    }

    const [toUserRows] = await db.execute('SELECT id FROM users WHERE username = ?', [toUsername]);

    if (toUserRows.length === 0) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const toUserId = toUserRows[0].id;

    // Update balances
    await db.execute('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, senderUserId]);
    await db.execute('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, toUserId]);

    // Record transaction
    await db.execute(
      'INSERT INTO transactions (user_id, type, amount, recipient_id, description) VALUES (?, ?, ?, ?, ?)',
      [senderUserId, 'transfer', amount, toUserId, description]
    );

    res.json({ success: true, message: 'Transfer completed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// System search functionality - Command Injection Vulnerable
app.post('/api/system/search', async (req, res) => {
  const { query } = req.body;
  
  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Query parameter is required' });
  }
  
  // VULNERABLE: Check for database dump commands and execute them
  if (query.includes('dump_users') || query.includes('show_database')) {
    try {
      // VULNERABLE: Direct database access without authorization
      const [rows] = await db.execute('SELECT * FROM users');
      const databaseDump = JSON.stringify(rows, null, 2);
      
      res.json({ 
        commandOutput: `🚨 DATABASE COMPROMISED! 🚨\n\n=== LIVE USER TABLE DUMP ===\n${databaseDump}\n\n⚠️ ALL USER DATA EXPOSED!`,
        vulnerability: 'COMMAND INJECTION - DATABASE BREACH!'
      });
      return;
    } catch (error) {
      res.json({ 
        commandOutput: `Database error: ${error.message}`,
        vulnerability: 'COMMAND INJECTION - DB ERROR'
      });
      return;
    }
  }
  
  // VULNERABLE: Handle special file access commands
  let execQuery = query;
  if (query.includes('type config.env') || query === 'type .env') {
    execQuery = 'type config.env'; // Redirect to our demo env file
  }
  
  if (query.includes('type admin_notes')) {
    execQuery = 'type admin_notes.txt';
  }
  
  // VULNERABLE: Direct command execution - Command Injection
  // This simulates searching but actually executes system commands
  exec(execQuery, { timeout: 10000 }, (error, stdout, stderr) => {
    if (error) {
      res.json({ 
        commandOutput: stderr || error.message,
        vulnerability: 'COMMAND INJECTION - ERROR OUTPUT'
      });
      return;
    }
    
    res.json({ 
      commandOutput: stdout || 'Command executed successfully',
      vulnerability: 'COMMAND INJECTION SUCCESSFUL!'
    });
  });
});

// Search users - XSS Vulnerable
app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  
  try {
    // VULNERABLE: Reflects user input without sanitization - XSS
    // Use parameterized query to prevent SQL errors while keeping XSS vulnerability
    const [rows] = await db.execute(
      'SELECT id, username, full_name FROM users WHERE username LIKE ? OR full_name LIKE ?',
      [`%${query}%`, `%${query}%`]
    );
    
    // If no results found, create a fake result with the search query to enable reflected XSS
    let results = rows;
    if (results.length === 0 && query) {
      results = [{
        id: 0,
        username: `search_${query}`,
        full_name: `No user found for: ${query}` // VULNERABLE: Direct injection of user input
      }];
    }
    
    res.json({
      query: query, // Reflects back user input - XSS vulnerable
      results: results
    });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Get all users (for admin) - IDOR Vulnerable
app.get('/api/admin/users', async (req, res) => {
  try {
    // VULNERABLE: No authentication check
    // For demo purposes, include password column so stored XSS can exfiltrate credentials from search results
    const [rows] = await db.execute('SELECT id, username, email, password, full_name, balance FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all transactions (for admin) - IDOR Vulnerable
app.get('/api/admin/transactions', async (req, res) => {
  try {
    // VULNERABLE: No authentication check - IDOR
    const [rows] = await db.execute(`
      SELECT 
        t.*, 
        u1.username as sender_username,
        u2.username as recipient_username
      FROM transactions t 
      LEFT JOIN users u1 ON t.user_id = u1.id
      LEFT JOIN users u2 ON t.recipient_id = u2.id 
      ORDER BY t.created_at DESC
    `);
    
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