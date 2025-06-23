package com.eazybytes.event.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Getter
@ToString
@NoArgsConstructor
@SuperBuilder(toBuilder = true)
public class BaseSagaEvent {
    private String transactionId;
    private String userId;
    private String eventId;
    private List<Integer> timestamp;

    public BaseSagaEvent(String transactionId, String userId) {
        this.transactionId = transactionId;
        this.userId = userId;
    }
}