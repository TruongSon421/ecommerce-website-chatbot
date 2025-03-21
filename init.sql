-- Debug information
SELECT 'INITIALIZING DATABASES' AS 'INFO';

CREATE DATABASE IF NOT EXISTS ecommerce_users;
CREATE DATABASE IF NOT EXISTS ecommerce_orders;
CREATE DATABASE IF NOT EXISTS ecommerce_inventory;

-- Create user if not exists
CREATE USER IF NOT EXISTS 'tiendoan'@'%' IDENTIFIED BY 'tiendoan';

-- Grant privileges
GRANT ALL PRIVILEGES ON ecommerce_users.* TO 'tiendoan'@'%';
GRANT ALL PRIVILEGES ON ecommerce_orders.* TO 'tiendoan'@'%';
GRANT ALL PRIVILEGES ON ecommerce_inventory.* TO 'tiendoan'@'%';
FLUSH PRIVILEGES;

USE ecommerce_users;

-- Tạo bảng roles phù hợp với ERole enum
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- Insert roles
INSERT INTO roles (id, name) VALUES
    (1, 'ROLE_USER'),
    (2, 'ROLE_ADMIN')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Tạo bảng users
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone_number VARCHAR(20),
    is_active BOOLEAN,
    created_at DATETIME,
    updated_at DATETIME
);

-- Tạo bảng user_roles (quan hệ nhiều-nhiều)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Thêm user admin với mật khẩu được hash
INSERT INTO users (id, username, email, password, first_name, last_name, is_active, created_at) VALUES
    (1, 'admin', 'admin@example.com', '$2a$12$haJsBN9tAkoKx0Po7svWKeSwUMd45bbaJMgfXC1Y3iddSAZSyARwO', 'Admin', 'User', TRUE, NOW())
ON DUPLICATE KEY UPDATE username=VALUES(username);

-- Thiết lập quyền admin cho user
INSERT INTO user_roles (user_id, role_id) VALUES
    (1, 2)
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);

-- Debug information
SELECT 'INITIALIZATION COMPLETE' AS 'INFO';