-- Xóa bảng cũ nếu tồn tại
DROP TABLE IF EXISTS inventory_reservation;

-- Tạo lại bảng với AUTO_INCREMENT cho reservation_id
CREATE TABLE inventory_reservation (
    reservation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    color VARCHAR(255),
    quantity INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Thêm index để tăng tốc tìm kiếm
CREATE INDEX idx_inventory_reservation_order_id ON inventory_reservation(order_id);
CREATE INDEX idx_inventory_reservation_product_color ON inventory_reservation(product_id, color); 