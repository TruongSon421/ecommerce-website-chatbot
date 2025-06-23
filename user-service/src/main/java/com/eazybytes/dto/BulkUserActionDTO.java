package com.eazybytes.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BulkUserActionDTO {
    @NotEmpty(message = "User IDs list cannot be empty")
    private List<Long> userIds;
    
    @NotNull(message = "Action type is required")
    private BulkActionType actionType;
    
    public enum BulkActionType {
        ACTIVATE,
        DEACTIVATE,
        DELETE,
        RESET_PASSWORD
    }
}