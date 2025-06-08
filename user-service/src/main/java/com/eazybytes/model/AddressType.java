package com.eazybytes.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum AddressType {
    NHA_RIENG("Nhà riêng"),
    VAN_PHONG("Văn phòng");
    
    private final String displayName;
    
    AddressType(String displayName) {
        this.displayName = displayName;
    }
    
    @JsonValue
    public String getDisplayName() {
        return displayName;
    }
    
    // Custom method to find enum by display name
    @JsonCreator
    public static AddressType fromDisplayName(String displayName) {
        if (displayName == null) {
            return NHA_RIENG; // default value
        }
        
        for (AddressType type : AddressType.values()) {
            if (type.displayName.equals(displayName)) {
                return type;
            }
        }
        
        // If not found by display name, try by enum name
        try {
            return AddressType.valueOf(displayName);
        } catch (IllegalArgumentException e) {
            return NHA_RIENG; // default fallback
        }
    }
    
    // Override toString for better display
    @Override
    public String toString() {
        return displayName;
    }
}