package com.eazybytes.dto;

public class BlacklistCheckResponse {
    private boolean blacklisted;

    public BlacklistCheckResponse() {
    }

    public BlacklistCheckResponse(boolean blacklisted) {
        this.blacklisted = blacklisted;
    }

    public boolean isBlacklisted() {
        return blacklisted;
    }

    public void setBlacklisted(boolean blacklisted) {
        this.blacklisted = blacklisted;
    }
}