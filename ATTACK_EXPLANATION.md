# Attack Explanation Guide

Detailed explanations of vulnerabilities with code references for educators and security trainers.

---

## 📑 Table of Contents

1. [SQL Injection](#-attack-1-sql-injection)
2. [Cross-Site Scripting (XSS)](#-attack-2-cross-site-scripting-xss)
3. [IDOR (Insecure Direct Object Reference)](#-attack-3-idor-insecure-direct-object-reference)
4. [CSRF (Cross-Site Request Forgery)](#-attack-4-csrf-cross-site-request-forgery)
5. [Command Injection](#-attack-5-command-injection)
6. [Security Console Features](#-security-console-features)
7. [Teaching Tips](#-teaching-tips)
8. [Quick Reference](#-quick-reference)

---

## 🎓 How to Use This Guide

This guide helps you explain security vulnerabilities to non-technical audiences by:
- Using simple analogies
- Showing exact vulnerable code locations
- Explaining how attacks work step-by-step
- Providing prevention methods

---
---

## 🔴 Attack 1: SQL Injection

### Simple Explanation
"Imagine a restaurant waiter who takes your order exactly as you say it. If you say 'Give me a burger AND everything in the kitchen for free', the waiter does it! SQL Injection tricks the database the same way."

### How It Works

**Normal Login:**
```
User types: admin
Database asks: "Is there a user named 'admin' with correct password?"
Result: Login succeeds or fails normally
```

**SQL Injection Attack:**
```
User types: admin' OR 1=1 --
Database asks: "Is there a user named 'admin' OR is 1=1 (always true)?"
Result: Login succeeds without password!
```

### Vulnerable Code Location

**File:** `backend/server.js`  
**Line:** ~110-150

```javascript
// ❌ VULNERABLE CODE
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
await db.query(query);
```

**Problem:** User input is directly inserted into SQL query without checking.

### How to Demonstrate

1. Show the login page
2. Type `admin' OR 1=1 --` in username
3. Show the SQL console appearing
4. Explain: "The `--` comments out the password check, and `1=1` is always true"
5. Show successful login without knowing password

### Prevention Method

**File:** `backend/server.js`  
**Fix:** Use parameterized queries

```javascript
// ✅ SECURE CODE
const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
await db.execute(query, [username, password]);
```

**Explanation:** The `?` placeholders treat user input as data, not code.

---
---

## 🔴 Attack 2: Cross-Site Scripting (XSS)

### Simple Explanation
"Imagine leaving a note on a bulletin board that says 'Read this out loud!' When someone reads it, they unknowingly follow your instructions. XSS makes websites run your malicious code when others visit."

### How It Works

**Normal Profile Update:**
```
User types: John Smith
Website displays: John Smith (as text)
Result: Safe
```

**XSS Attack:**
```
User types: <img src=x onerror=alert('HACKED!')>
Website displays: <img src=x onerror=alert('HACKED!')> (as HTML code!)
Browser executes: alert('HACKED!')
Result: Malicious code runs!
```

### Vulnerable Code Locations

**File:** `vul-bank-app/src/components/TransferMoney.jsx`  
**Line:** ~320

```jsx
// ❌ VULNERABLE CODE
<span dangerouslySetInnerHTML={{ __html: searchUser.full_name }} />
```

**Problem:** User input is rendered as HTML, allowing code execution.

**File:** `backend/server.js`  
**Line:** ~380

```javascript
// ❌ VULNERABLE CODE
results = [{
    full_name: `No user found for: ${query}` // Direct injection!
}];
```

**Problem:** User input directly inserted without sanitization.

### How to Demonstrate

1. Login to the bank
2. Go to Transfer Money page
3. In search box, paste: `<img src=x onerror=alert('XSS!')>`
4. Show the XSS console appearing
5. Show the alert popup
6. Explain: "The website treated our input as code instead of text"

### Prevention Method

**File:** `vul-bank-app/src/components/TransferMoney.jsx`  
**Fix:** Remove dangerouslySetInnerHTML

```jsx
// ✅ SECURE CODE
<span>{searchUser.full_name}</span>
```

**Explanation:** React automatically escapes special characters, preventing code execution.

---
---

## 🔴 Attack 3: IDOR (Insecure Direct Object Reference)

### Simple Explanation
"Imagine a hotel where your room key opens ANY room, not just yours. IDOR is when you can access other people's data just by changing a number in the URL."

### How It Works

**Normal Access:**
```
You (user ID 2) request: /api/transactions/2
Server returns: Your transactions
Result: Safe
```

**IDOR Attack:**
```
You (user ID 2) request: /api/transactions/1
Server returns: Admin's transactions (user ID 1)
Result: Data breach!
```

### Vulnerable Code Location

**File:** `backend/server.js`  
**Line:** ~220-240

```javascript
// ❌ VULNERABLE CODE
app.get('/api/transactions/:userId', async (req, res) => {
  const { userId } = req.params;
  
  // NO CHECK: Is the logged-in user allowed to see this userId's data?
  const [rows] = await db.execute(
    'SELECT * FROM transactions WHERE user_id = ?', 
    [userId]
  );
  
  res.json(rows);
});
```

**Problem:** No authorization check - anyone can access any user's data.

### How to Demonstrate

1. Login as `john_doe` (user ID 2)
2. Open browser console (F12)
3. Type: `fetch('http://localhost:5000/api/transactions/1', {credentials: 'include'}).then(r => r.json()).then(console.log)`
4. Show admin's transactions appearing
5. Explain: "We're user 2, but we can see user 1's data by just changing the number"

### Prevention Method

**File:** `backend/server.js`  
**Fix:** Add authorization check

```javascript
// ✅ SECURE CODE
app.get('/api/transactions/:userId', async (req, res) => {
  const { userId } = req.params;
  const loggedInUserId = req.session.userId;
  
  // CHECK: Is the logged-in user requesting their own data?
  if (parseInt(userId) !== loggedInUserId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const [rows] = await db.execute(
    'SELECT * FROM transactions WHERE user_id = ?', 
    [userId]
  );
  
  res.json(rows);
});
```

**Explanation:** Always verify the user is authorized to access the requested data.

---
---

## 🔴 Attack 4: CSRF (Cross-Site Request Forgery)

### Simple Explanation
"Imagine someone tricks you into signing a check while you're distracted. CSRF tricks your browser into doing things you didn't intend while you're logged in."

### How It Works

**Normal Transfer:**
```
1. You login to bank
2. You click "Transfer Money"
3. You confirm the transfer
Result: Money transferred with your consent
```

**CSRF Attack:**
```
1. You login to bank
2. Attacker sends you a link
3. You click the link
4. Hidden form automatically submits
Result: Money transferred WITHOUT your knowledge!
```

### Vulnerable Code Location

**File:** `backend/server.js`  
**Line:** ~280-310

```javascript
// ❌ VULNERABLE CODE
app.post('/api/transfer', async (req, res) => {
  const { fromUserId, toUsername, amount, description } = req.body;
  
  // NO CSRF TOKEN CHECK!
  // Accepts any POST request from anywhere
  
  await db.execute('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, fromUserId]);
  // ... transfer money
});
```

**Problem:** No CSRF token validation - accepts requests from any website.

### How to Demonstrate

1. Create `attack.html` file with hidden form
2. Have victim login to bank
3. Victim opens `attack.html`
4. Show money automatically transferring
5. Explain: "The victim's browser sent the request because they were logged in"

### Prevention Method

**File:** `backend/server.js`  
**Fix:** Add CSRF token validation

```javascript
// ✅ SECURE CODE
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.post('/api/transfer', csrfProtection, async (req, res) => {
  // CSRF token automatically validated
  // Request rejected if token missing or invalid
  
  const { fromUserId, toUsername, amount } = req.body;
  // ... transfer money
});
```

**Explanation:** CSRF tokens ensure requests come from your own website, not external attackers.

---
---

## 🔴 Attack 5: Command Injection

### Simple Explanation
"Imagine telling a robot 'Make me coffee AND unlock the safe'. Command Injection tricks the server into running extra commands you shouldn't be able to run."

### How It Works

**Normal Search:**
```
User types: transaction123
Server searches: for "transaction123"
Result: Search results displayed
```

**Command Injection:**
```
User types: dir
Server executes: Windows 'dir' command
Result: Directory listing shown!
```

### Vulnerable Code Location

**File:** `backend/server.js`  
**Line:** ~330-370

```javascript
// ❌ VULNERABLE CODE
app.post('/api/system/search', async (req, res) => {
  const { query } = req.body;
  
  // DIRECTLY EXECUTES USER INPUT AS SYSTEM COMMAND!
  exec(query, { timeout: 10000 }, (error, stdout, stderr) => {
    res.json({ commandOutput: stdout });
  });
});
```

**Problem:** User input directly executed as system command.

### How to Demonstrate

1. Login to bank
2. Go to Transaction History
3. In search box, type: `dir`
4. Show command console with directory listing
5. Type: `whoami` to show current user
6. Explain: "The server is running our commands instead of searching"

### Prevention Method

**File:** `backend/server.js`  
**Fix:** Never execute user input

```javascript
// ✅ SECURE CODE
app.post('/api/system/search', async (req, res) => {
  const { query } = req.body;
  
  // Search in database, NOT execute commands
  const [rows] = await db.execute(
    'SELECT * FROM transactions WHERE description LIKE ?',
    [`%${query}%`]
  );
  
  res.json(rows);
});
```

**Explanation:** Never use `exec()` with user input. Always use safe database queries.

---
---

## 📊 Security Console Features

### SQL Injection Console
**Location:** Login page  
**Shows:** Detected injection type, SQL query executed, success/failure

### XSS Console
**Location:** Transfer Money page  
**Shows:** Cookie theft, data exfiltration, script execution

### Command Injection Console
**Location:** Transaction History page  
**Shows:** Command executed, output, system information

---
---

## 🎯 Teaching Tips

### For Non-Technical Audiences

**Use Analogies:**
- SQL Injection = Tricking a waiter
- XSS = Leaving malicious notes
- IDOR = Hotel key opening wrong rooms
- CSRF = Signing checks while distracted
- Command Injection = Robot following extra orders

**Show Visual Impact:**
1. Start with normal usage
2. Show the attack
3. Show the security console
4. Explain what happened
5. Show the fix

**Keep It Simple:**
- Avoid technical jargon
- Use real-world comparisons
- Show immediate consequences
- Demonstrate prevention

---
---

## 📁 Quick Reference

### File Locations
- **Backend vulnerabilities:** `backend/server.js`
- **Frontend vulnerabilities:** `vul-bank-app/src/components/`
- **Security consoles:** `vul-bank-app/src/contexts/`

### Key Vulnerable Endpoints
- `/api/login` - SQL Injection (Line ~110)
- `/api/search` - XSS (Line ~380)
- `/api/transactions/:userId` - IDOR (Line ~220)
- `/api/transfer` - CSRF (Line ~280)
- `/api/system/search` - Command Injection (Line ~330)

---

**Remember: Always emphasize ethical use and legal consequences!** 🛡️
