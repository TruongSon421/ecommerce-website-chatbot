package com.eazybytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO class để biểu diễn thông tin sắp xếp
 * 
 * Ví dụ sử dụng:
 * SortField sortField = SortField.builder()
 *     .field("ram")          // Tên field cần sort
 *     .order("desc")         // Thứ tự: "asc" hoặc "desc"  
 *     .priority(1)           // Độ ưu tiên (1 = cao nhất)
 *     .build();
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SortField {
    /**
     * Tên field cần sắp xếp (ví dụ: "ram", "price", "batteryLife")
     */
    private String field;
    
    /**
     * Thứ tự sắp xếp: "asc" (tăng dần) hoặc "desc" (giảm dần)
     */
    private String order;
    
    /**
     * Độ ưu tiên khi có nhiều field sort (1 = cao nhất, 2 = thấp hơn, ...)
     */
    private int priority;
}