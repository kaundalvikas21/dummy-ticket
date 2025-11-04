-- Insert admin user with hashed password
-- Password: admin123
-- Email: admin@example.com

-- Clear existing users (for clean seeding)
DELETE FROM users;

-- Insert admin user with correct hashed password
INSERT INTO users (email, password, role, status) VALUES
('admin@example.com', '$2b$10$aDzG0/ZXawoA1Utz4WfdPuGwdcKaCi7Gj.v1Sj2nt/xQjNoQC6F9G', 'admin', 'active');

-- Also create test users
INSERT INTO users (email, password, role, status) VALUES
('vendor@example.com', '$2b$10$aDzG0/ZXawoA1Utz4WfdPuGwdcKaCi7Gj.v1Sj2nt/xQjNoQC6F9G', 'vendor', 'active'),
('user@example.com', '$2b$10$aDzG0/ZXawoA1Utz4WfdPuGwdcKaCi7Gj.v1Sj2nt/xQjNoQC6F9G', 'user', 'active');

-- Password for all users: admin123
-- Correct hash generated with: bcrypt.hash('admin123', 10)

-- Verify insertion
SELECT 'Users seeded successfully' as status, COUNT(*) as user_count FROM users;

-- Display created users
SELECT 'Created users:' as info, email, role, status FROM users ORDER BY role, email;