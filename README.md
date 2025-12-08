# InsecureBank - Cybersecurity Learning Platform

A deliberately vulnerable banking application designed for cybersecurity education and penetration testing practice.

## ⚠️ Legal Disclaimer

**This application contains INTENTIONAL security vulnerabilities for educational purposes only.**
- Use only in controlled environments
- Never deploy to production
- Do not use techniques learned here on unauthorized systems
- Illegal use may result in criminal prosecution

---

## 🎯 Purpose

InsecureBank demonstrates common web application vulnerabilities including:
- SQL Injection
- Cross-Site Scripting (XSS)
- Insecure Direct Object Reference (IDOR)
- Cross-Site Request Forgery (CSRF)
- Command Injection
- Privilege Escalation
- Session Hijacking

---

## 🛠️ Tech Stack

### Frontend
- **React** 18.3.1 - UI framework
- **React Router** 6.28.0 - Navigation
- **Axios** 1.7.9 - HTTP client
- **Tailwind CSS** 3.4.17 - Styling
- **Lucide React** - Icons
- **Vite** 6.0.5 - Build tool

### Backend
- **Node.js** with Express 4.21.2
- **MySQL** 2.18.1 - Database
- **JWT** 9.0.2 - Authentication tokens
- **Express Session** 1.18.1 - Session management
- **CORS** 2.8.5 - Cross-origin requests
- **dotenv** 16.4.7 - Environment variables

---

## 🚀 Quick Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- npm or yarn

### Installation

**1. Clone the repository**
```bash
git clone <repository-url>
cd Insecure-Bank-main
```

**2. Setup Backend**
```bash
cd backend
npm install
```

**3. Configure Database**
- Create MySQL database named `vulnerable_bank`
- Import schema from `demo-files/manual-db-setup.sql`
- Update `.env` file with your database credentials

**4. Start Backend Server**
```bash
npm start
# Server runs on http://localhost:5000
```

**5. Setup Frontend**
```bash
cd vul-bank-app
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 👥 Test Accounts

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Administrator |
| john_doe | password | Customer |
| jane_smith | 123456 | Customer |
| bob_wilson | Bobbbb | Customer |
| ycp27 | ycp123 | Customer |

---

## 📚 Documentation

### For Attackers (Penetration Testers)
**[ATTACK_EXECUTION.md](ATTACK_EXECUTION.md)** - Step-by-step attack commands and payloads

### For Educators (Security Trainers)
**[ATTACK_EXPLANATION.md](ATTACK_EXPLANATION.md)** - Detailed vulnerability explanations with code references

---

## 🎓 Educational Use

This platform is designed for:
- Cybersecurity students learning about web vulnerabilities
- Security professionals practicing penetration testing
- Educators demonstrating real-world attack scenarios
- Developers understanding secure coding practices

---

## 🔒 Security Features (Intentionally Disabled)

The following security measures are deliberately absent:
- Input validation and sanitization
- Parameterized SQL queries
- Output encoding
- CSRF tokens
- Authorization checks
- Rate limiting
- Secure session management
- HTTP-only cookies

---

## 📁 Project Structure

```
Insecure-Bank-main/
├── backend/              # Express.js API server
│   ├── server.js        # Main server file with vulnerabilities
│   └── .env             # Database configuration
├── vul-bank-app/        # React frontend
│   └── src/
│       ├── components/  # React components
│       └── contexts/    # Security console contexts
├── demo-files/          # Database setup files
└── README.md           # This file
```

---

## 🤝 Contributing

This is an educational project. Contributions that add new vulnerabilities or improve learning experience are welcome.

---

## 📄 License

Educational use only. Not for production deployment.

---

## 🔗 Quick Links

- **[Attack Execution Guide](ATTACK_EXECUTION.md)** - Practice attacks
- **[Attack Explanation Guide](ATTACK_EXPLANATION.md)** - Understand vulnerabilities
- **Database Setup**: `demo-files/DATABASE_SETUP_GUIDE.md`

---

**Remember: With great power comes great responsibility. Use this knowledge ethically!** 🛡️
