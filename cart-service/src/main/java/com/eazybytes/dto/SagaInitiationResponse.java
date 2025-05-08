package com.eazybytes.dto;

import lombok.Data;

@Data
public class SagaInitiationResponse {
    private String transactionId;
    private String message;

    public SagaInitiationResponse(String transactionId, String message) {
        this.transactionId = transactionId;
        this.message = message;
    }
}