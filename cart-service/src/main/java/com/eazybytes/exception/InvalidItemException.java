package com.eazybytes.exception;

public class InvalidItemException extends RuntimeException {
    public InvalidItemException(String message) {
        super(message);
    }
}
