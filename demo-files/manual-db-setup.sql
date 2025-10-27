-- Copy and paste this into phpMyAdmin SQL tab

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 1000.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('deposit', 'withdraw', 'transfer') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  recipient_id INT DEFAULT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (recipient_id) REFERENCES users(id)
);

-- Insert demo users (password hashes are for: admin123, password, 123456, qwerty)
INSERT INTO users (username, email, password, full_name, balance) VALUES 
('admin', 'admin@bank.com', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8I/fqjjO7nOJj8rqvmIcrwPhGXK7Gi', 'Administrator', 50000.00),
('john_doe', 'john@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', 5000.00),
('jane_smith', 'jane@example.com', '$2b$10$K1yl6A7Aj4HZJGd/8.R5s.WDNsR1BpS7p5S1MWGZf3K4FVWnZ.YZa', 'Jane Smith', 3000.00),
('bob_wilson', 'bob@example.com', '$2b$10$F8qKvoL9a0rOQ4kJ1Q5B0.aNf8OwrAh4VfEOcrGbJhZqaJmKqHqGu', 'Bob Wilson', 2000.00);

-- Insert sample transactions
INSERT INTO transactions (user_id, type, amount, recipient_id, description) VALUES
(1, 'deposit', 10000.00, NULL, 'Initial deposit'),
(2, 'deposit', 2000.00, NULL, 'Salary deposit'),
(3, 'transfer', 500.00, 2, 'Payment for services'),
(2, 'withdraw', 200.00, NULL, 'ATM withdrawal'),
(4, 'transfer', 100.00, 1, 'Monthly fee payment');