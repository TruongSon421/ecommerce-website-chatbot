package com.eazybytes.controller;

import com.eazybytes.dto.AddressDTO;
import com.eazybytes.dto.UserDTO;
import com.eazybytes.dto.CreateUserDTO;
import com.eazybytes.dto.BulkUserActionDTO;
import com.eazybytes.dto.UserStatisticsDTO;
import com.eazybytes.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    // ==================== USER SELF-MANAGEMENT APIs ====================
    
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

    // ==================== ADMIN USER MANAGEMENT APIs ====================

    // Get all users with pagination and search
    @GetMapping
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<Page<UserDTO>> getAllUsers(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String status, // ACTIVE, INACTIVE, ALL
            Pageable pageable) {
        Page<UserDTO> users = userService.getAllUsers(search, status, pageable);
        return ResponseEntity.ok(users);
    }

    // Get user by ID (for admin to view specific user details)
    @GetMapping("/{userId}")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long userId) {
        UserDTO userDTO = userService.getUserWithAddresses(userId);
        return ResponseEntity.ok(userDTO);
    }

    // Update user by admin (can update all fields including email, status)
    @PutMapping("/{userId}")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateUserByAdmin(
            @PathVariable Long userId,
            @Valid @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.updateUserByAdmin(userId, userDTO);
        return ResponseEntity.ok(updatedUser);
    }

    // Delete user by admin
    @DeleteMapping("/{userId}")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    // Deactivate user (soft delete)
    @PutMapping("/{userId}/deactivate")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<UserDTO> deactivateUser(@PathVariable Long userId) {
        UserDTO updatedUser = userService.deactivateUser(userId);
        return ResponseEntity.ok(updatedUser);
    }

    // Activate user
    @PutMapping("/{userId}/activate")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<UserDTO> activateUser(@PathVariable Long userId) {
        UserDTO updatedUser = userService.activateUser(userId);
        return ResponseEntity.ok(updatedUser);
    }

    // Reset user password (admin can reset password for any user)
    @PostMapping("/{userId}/reset-password")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<String> resetUserPassword(@PathVariable Long userId) {
        String newPassword = userService.resetUserPassword(userId);
        return ResponseEntity.ok("Password reset successfully. New password: " + newPassword);
    }

    // Get user statistics for admin dashboard
    @GetMapping("/statistics")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<UserStatisticsDTO> getUserStatistics() {
        UserStatisticsDTO statistics = userService.getUserStatistics();
        return ResponseEntity.ok(statistics);
    }

    // Bulk operations for admin
    @PostMapping("/bulk-action")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<String> bulkUserAction(
            @RequestBody BulkUserActionDTO bulkActionDTO) {
        String result = userService.performBulkAction(bulkActionDTO);
        return ResponseEntity.ok(result);
    }
}