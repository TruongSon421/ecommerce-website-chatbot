// AddressNotFoundException.java
package com.eazybytes.exception;

public class AddressNotFoundException extends RuntimeException {
    public AddressNotFoundException(String message) {
        super(message);
    }
    
    public AddressNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}