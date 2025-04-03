package com.eazybytes.dto;

public class GetCartRequest {
    private String userId;

    public GetCartRequest(String userId) {
        this.userId = userId;
    }

    public String getUserId() {
        return userId;
    }
}