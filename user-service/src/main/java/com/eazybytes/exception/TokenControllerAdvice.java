package com.eazybytes.exception;

import com.eazybytes.dto.MessageResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class TokenControllerAdvice {

    @ExceptionHandler(TokenRefreshException.class)
    public ResponseEntity<?> handleTokenRefreshException(TokenRefreshException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(new MessageResponse(ex.getMessage()));
    }
}