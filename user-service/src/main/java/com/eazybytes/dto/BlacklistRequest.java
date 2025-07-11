// src/main/java/com/eazybytes/dto/BlacklistRequest.java
package com.eazybytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BlacklistRequest {
    private String token;
}