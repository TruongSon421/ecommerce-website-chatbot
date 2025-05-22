

package com.eazybytes.controller;

import com.eazybytes.dto.AddressDTO;
import com.eazybytes.dto.UserDTO;
import com.eazybytes.dto.CreateUserDTO;
import com.eazybytes.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;
    
    @PostMapping
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody CreateUserDTO createUserDTO) {
        UserDTO newUser = userService.createUser(createUserDTO);
        return ResponseEntity.status(201).body(newUser);
    }

    // Get user details including addresses
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getUserDetails(@RequestHeader("X-Auth-UserId") Long userId) {
        UserDTO userDTO = userService.getUserWithAddresses(userId);
        return ResponseEntity.ok(userDTO);
    }

    // Update user personal information
    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateUser(
            @RequestHeader("X-Auth-UserId") Long userId,
            @Valid @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.updateUser(userId, userDTO);
        return ResponseEntity.ok(updatedUser);
    }

    // Add new address
    @PostMapping("/me/addresses")
    public ResponseEntity<AddressDTO> addAddress(
            @RequestHeader("X-Auth-UserId") Long userId,
            @Valid @RequestBody AddressDTO addressDTO) {
        AddressDTO newAddress = userService.addAddress(userId, addressDTO);
        return ResponseEntity.ok(newAddress);
    }

    // Update existing address
    @PutMapping("/me/addresses/{addressId}")
    public ResponseEntity<AddressDTO> updateAddress(
            @RequestHeader("X-Auth-UserId") Long userId,
            @PathVariable Long addressId,
            @Valid @RequestBody AddressDTO addressDTO) {
        AddressDTO updatedAddress = userService.updateAddress(userId, addressId, addressDTO);
        return ResponseEntity.ok(updatedAddress);
    }

    // Delete address
    @DeleteMapping("/me/addresses/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @RequestHeader("X-Auth-UserId") Long userId,
            @PathVariable Long addressId) {
        userService.deleteAddress(userId, addressId);
        return ResponseEntity.noContent().build();
    }
}