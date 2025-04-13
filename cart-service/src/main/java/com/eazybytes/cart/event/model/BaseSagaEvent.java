package com.eazybytes.cart.event.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter 
@ToString
@NoArgsConstructor 
@SuperBuilder(toBuilder = true)
public abstract class BaseSagaEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    // Các trường chung
    private final UUID eventId = UUID.randomUUID();
    private final LocalDateTime timestamp = LocalDateTime.now();
    private String transactionId;      
    private String userId;             

    // Constructor cơ bản
    protected BaseSagaEvent(String transactionId, String userId) {
        this.transactionId = transactionId;
        this.userId = userId;
    }

}