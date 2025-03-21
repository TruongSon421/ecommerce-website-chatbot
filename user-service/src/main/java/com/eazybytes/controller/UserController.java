// src/main/java/com/eazybytes/controller/UserController.java
package com.eazybytes.controller;

import com.eazybytes.dto.CreateUserRequest;
import com.eazybytes.dto.UserDTO;
import com.eazybytes.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserDTO userDTO = UserDTO.builder()
                .username(request.getUsername())
                .password(request.getPassword())
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .roles(Collections.singletonList(request.getRole())) // Thay role thành roles
                .isActive(true)
                .build();
        return new ResponseEntity<>(userService.createUser(userDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("#authUserId.equals(#id.toString())")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO,
                                              @RequestHeader(value = "X-Auth-UserId") String authUserId) {

        return ResponseEntity.ok(userService.updateUser(id, userDTO));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@roleChecker.hasRole('ADMIN') or #authUserId.equals(#id.toString())")
    public ResponseEntity<UserDTO> getUserById(
            @PathVariable Long id,
            @RequestHeader(value = "X-Auth-UserId") String authUserId) {

        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }
}