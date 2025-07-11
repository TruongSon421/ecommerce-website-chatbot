package com.eazybytes.exception;

/**
 * Ngoại lệ được ném ra khi hệ thống cố gắng tạo một mục tồn kho đã tồn tại.
 */
public class InventoryAlreadyExistsException extends RuntimeException {

    /**
     * Tạo ngoại lệ mới với thông báo lỗi mặc định.
     */
    public InventoryAlreadyExistsException() {
        super("Mục tồn kho đã tồn tại trong hệ thống");
    }

    /**
     * Tạo ngoại lệ mới với thông báo lỗi cụ thể.
     *
     * @param message Thông báo mô tả lỗi
     */
    public InventoryAlreadyExistsException(String message) {
        super(message);
    }

    /**
     * Tạo ngoại lệ mới với thông báo lỗi và nguyên nhân.
     *
     * @param message Thông báo mô tả lỗi
     * @param cause Nguyên nhân gốc rễ của ngoại lệ
     */
    public InventoryAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Tạo ngoại lệ mới với nguyên nhân.
     *
     * @param cause Nguyên nhân gốc rễ của ngoại lệ
     */
    public InventoryAlreadyExistsException(Throwable cause) {
        super("Mục tồn kho đã tồn tại trong hệ thống", cause);
    }
}