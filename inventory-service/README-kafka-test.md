# Hướng dẫn kiểm tra chức năng Kafka trong Inventory Service

## Cấu hình đã được sửa

Các vấn đề với cấu hình Kafka đã được sửa chữa:

1. Đã thêm `ErrorHandlingDeserializer` để xử lý lỗi serialization
2. Đã cấu hình acknowledgment thủ công đúng cách
3. Đã thêm các annotation `@NoArgsConstructor` và `@AllArgsConstructor` cho các DTO để hỗ trợ deserialization
4. Đã cấu hình error handler đúng cách

## Kiểm tra gửi message Kafka

Để kiểm tra chức năng Kafka, hãy gọi API sau:

```
POST http://localhost:8100/api/kafka-test/send-reserve
```

Với dữ liệu mẫu:

```json
[
  {
    "productId": "your-product-id",
    "productName": "Test Product",
    "price": 1000000,
    "quantity": 1,
    "color": "Blue",
    "available": true
  }
]
```

## Điều kiện để Kafka hoạt động

1. Kafka broker phải đang chạy ở `localhost:9092`
2. Topic `reserve-inventory-request` phải tồn tại (được tạo tự động hoặc thủ công)
3. Phải đảm bảo không có lỗi kết nối đến broker

## Theo dõi logs

Theo dõi logs để xem quá trình xử lý message:

```
# Khi gửi message
Gửi message đặt trước tồn kho: {...}

# Khi nhận message
Received payload from topic reserve-inventory-request: {...}

# Khi xử lý message
Reserved inventory for order ...
```

## Nếu vẫn gặp lỗi

Nếu vẫn gặp lỗi khi sử dụng Kafka, hãy xem logs chi tiết để xác định nguyên nhân cụ thể. Một số nguyên nhân phổ biến:

1. Lỗi kết nối đến Kafka broker
2. Lỗi deserialize message do định dạng không đúng
3. Lỗi xử lý trong service

## Kết luận

Cấu hình Kafka đã được cân bằng giữa đơn giản và đủ chức năng. Đã bổ sung các tính năng cần thiết như error handling và acknowledgment thủ công, đồng thời loại bỏ các cấu hình không cần thiết có thể gây xung đột. 