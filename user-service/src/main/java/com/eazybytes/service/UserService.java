// UserService.java (optimized version with original DTO)
package com.eazybytes.service;

import com.eazybytes.dto.*;
import com.eazybytes.model.User;
import com.eazybytes.model.Address;
import com.eazybytes.model.AddressType;
import com.eazybytes.model.Role;
import com.eazybytes.model.ERole;
import com.eazybytes.repository.UserRepository;
import com.eazybytes.repository.AddressRepository;
import com.eazybytes.repository.RoleRepository;
import com.eazybytes.exception.UserNotFoundException;
import com.eazybytes.exception.AddressNotFoundException;
import com.eazybytes.exception.BusinessException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==================== OPTIMIZED UPDATE METHOD ====================
    
    /**
     * ✅ FIX: Optimized updateUser method - chỉ load basic info, không load relationships
     */
    @Transactional(timeout = 30, rollbackFor = Exception.class)
    public UserDTO updateUser(Long userId, UserDTO userDTO) {
        try {
            log.debug("Updating user with ID: {}", userId);
            
            // ✅ FIX: Sử dụng basic query thay vì findById để tránh load relationships
            User user = userRepository.findBasicUserById(userId)
                    .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

            boolean hasChanges = false;
            
            // Update chỉ các field được cho phép cho regular users
            if (userDTO.getFirstName() != null && 
                !userDTO.getFirstName().equals(user.getFirstName())) {
                user.setFirstName(userDTO.getFirstName().trim());
                hasChanges = true;
            }
            
            if (userDTO.getLastName() != null && 
                !userDTO.getLastName().equals(user.getLastName())) {
                user.setLastName(userDTO.getLastName().trim());
                hasChanges = true;
            }
            
            if (userDTO.getPhoneNumber() != null && 
                !userDTO.getPhoneNumber().equals(user.getPhoneNumber())) {
                user.setPhoneNumber(userDTO.getPhoneNumber());
                hasChanges = true;
            }

            // ✅ FIX: Chỉ save khi có thay đổi thực sự
            if (hasChanges) {
                user.setUpdatedAt(LocalDateTime.now());
                
                // ✅ FIX: Sử dụng saveAndFlush để ensure immediate commit
                user = userRepository.saveAndFlush(user);
                
                log.debug("User updated successfully: {}", userId);
            } else {
                log.debug("No changes detected for user: {}", userId);
            }

            // ✅ FIX: Return DTO without loading relationships
            return convertToBasicUserDTO(user);
            
        } catch (Exception e) {
            log.error("Error updating user with id: {} - Error: {}", userId, e.getMessage(), e);
            
            // ✅ DEBUG: Check if it's transaction or entity related
            if (e.getMessage().contains("transaction")) {
                log.error("Transaction related error detected");
            }
            if (e.getMessage().contains("could not commit")) {
                log.error("Commit failure detected");
            }
            
            throw new RuntimeException("Failed to update user: " + e.getMessage(), e);
        }
    }

    // ==================== EXISTING METHODS (KEEP AS IS) ====================
    
    public UserDTO createUser(CreateUserDTO createUserDTO) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(createUserDTO.getUsername())) {
            throw new BusinessException("Username already exists");
        }
        if (userRepository.existsByEmail(createUserDTO.getEmail())) {
            throw new BusinessException("Email already exists");
        }

        User user = User.builder()
                .username(createUserDTO.getUsername())
                .email(createUserDTO.getEmail())
                .firstName(createUserDTO.getFirstName())
                .lastName(createUserDTO.getLastName())
                .phoneNumber(createUserDTO.getPhoneNumber())
                .password(passwordEncoder.encode(createUserDTO.getPassword()))
                .isActive(true)
                .roles(new HashSet<>())
                .build();
        
        if (createUserDTO.getRoleNames() != null && !createUserDTO.getRoleNames().isEmpty()) {
            for (String roleName : createUserDTO.getRoleNames()) {
                try {
                    ERole eRole = ERole.valueOf(roleName);
                    Role role = roleRepository.findByName(eRole)
                            .orElseThrow(() -> new BusinessException("Role not found: " + roleName));
                    user.getRoles().add(role);
                } catch (IllegalArgumentException e) {
                    throw new BusinessException("Invalid role: " + roleName);
                }
            }
        } else {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new BusinessException("Default role not found"));
            user.getRoles().add(userRole);
        }

        User savedUser = userRepository.save(user);
        return convertToUserDTO(savedUser);
    }

    /**
     * ✅ FIX: Method để get user với addresses (khi thực sự cần)
     */
    @Transactional(readOnly = true, timeout = 30)
    public UserDTO getUserWithAddresses(Long userId) {
        // Sử dụng basic query để load user, sau đó load addresses riêng
        User user = userRepository.findBasicUserById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        return convertToUserDTO(user);
    }

    public AddressDTO addAddress(Long userId, AddressDTO addressDTO) {
        User user = userRepository.findBasicUserById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        // ✅ FIX: Check if this is the first address
        List<Address> existingAddresses = addressRepository.findByUserIdOrderByIsDefaultDesc(userId);
        boolean isFirstAddress = existingAddresses.isEmpty();
        
        // ✅ FIX: If this is the first address, force it to be default
        boolean shouldBeDefault = isFirstAddress || (addressDTO.getIsDefault() != null && addressDTO.getIsDefault());
        
        // ✅ FIX: If setting as default and there are existing addresses, clear current default
        if (shouldBeDefault && !isFirstAddress) {
            addressRepository.clearDefaultAddressForUser(userId);
        }

        Address address = Address.builder()
                .user(user)
                .province(addressDTO.getProvince())
                .district(addressDTO.getDistrict())
                .ward(addressDTO.getWard())
                .street(addressDTO.getStreet())
                .addressType(addressDTO.getAddressType() != null ? addressDTO.getAddressType() : AddressType.NHA_RIENG)
                .receiverName(addressDTO.getReceiverName())
                .receiverPhone(addressDTO.getReceiverPhone())
                .isDefault(shouldBeDefault) // ✅ FIX: Always set boolean value
                .build();

        Address savedAddress = addressRepository.save(address);
        return convertToAddressDTO(savedAddress);
    }

    public AddressDTO updateAddress(Long userId, Long addressId, AddressDTO addressDTO) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new AddressNotFoundException("Address not found"));

        // ✅ FIX: Handle default logic properly
        boolean shouldBeDefault = addressDTO.getIsDefault() != null && addressDTO.getIsDefault();
        
        // ✅ FIX: If setting as default and it's not currently default, clear other defaults
        if (shouldBeDefault && !address.getIsDefault()) {
            addressRepository.clearDefaultAddressForUser(userId);
        }

        // ✅ FIX: Update all fields
        address.setProvince(addressDTO.getProvince());
        address.setDistrict(addressDTO.getDistrict());
        address.setWard(addressDTO.getWard());
        address.setStreet(addressDTO.getStreet());
        address.setAddressType(addressDTO.getAddressType() != null ? addressDTO.getAddressType() : address.getAddressType());
        address.setReceiverName(addressDTO.getReceiverName());
        address.setReceiverPhone(addressDTO.getReceiverPhone());
        address.setIsDefault(shouldBeDefault);

        Address updatedAddress = addressRepository.save(address);
        return convertToAddressDTO(updatedAddress);
    }

    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new AddressNotFoundException("Address not found"));

        boolean wasDefault = address.getIsDefault();
        addressRepository.delete(address);

        // ✅ FIX: If deleted address was default, set the most recent remaining address as default
        if (wasDefault) {
            List<Address> remainingAddresses = addressRepository.findByUserIdOrderByCreatedAtDesc(userId);
            if (!remainingAddresses.isEmpty()) {
                Address newDefault = remainingAddresses.get(0); // Get most recent address
                newDefault.setIsDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    // ==================== ADMIN METHODS ====================

    /**
     * ✅ FIX: Optimized getAllUsers với proper JOIN FETCH
     */
    public Page<UserDTO> getAllUsers(String search, String status, Pageable pageable) {
        List<User> allUsers;
        
        if (search != null && !search.trim().isEmpty()) {
            allUsers = userRepository.findAllWithAddressesBySearch(search.trim());
        } else {
            allUsers = userRepository.findAllWithAddresses();
        }
        
        // Apply status filter
        if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            boolean isActive = "ACTIVE".equalsIgnoreCase(status);
            allUsers = allUsers.stream()
                .filter(user -> user.getIsActive() != null && user.getIsActive() == isActive)
                .collect(Collectors.toList());
        }
        
        // Convert to DTOs
        List<UserDTO> userDTOs = allUsers.stream()
            .map(this::convertToUserDTOWithAddresses)
            .collect(Collectors.toList());
        
        // Apply pagination manually
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), userDTOs.size());
        
        if (start >= userDTOs.size()) {
            return new PageImpl<>(List.of(), pageable, userDTOs.size());
        }
        
        List<UserDTO> pageContent = userDTOs.subList(start, end);
        
        return new PageImpl<>(pageContent, pageable, userDTOs.size());
    }

    public UserDTO updateUserByAdmin(Long userId, UserDTO userDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        // Admin can update all fields
        if (userDTO.getUsername() != null) user.setUsername(userDTO.getUsername());
        if (userDTO.getEmail() != null) user.setEmail(userDTO.getEmail());
        if (userDTO.getFirstName() != null) user.setFirstName(userDTO.getFirstName());
        if (userDTO.getLastName() != null) user.setLastName(userDTO.getLastName());
        if (userDTO.getPhoneNumber() != null) user.setPhoneNumber(userDTO.getPhoneNumber());
        if (userDTO.getIsActive() != null) user.setIsActive(userDTO.getIsActive());

        User updatedUser = userRepository.save(user);
        return convertToUserDTO(updatedUser);
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        addressRepository.deleteByUserId(userId);
        userRepository.delete(user);
    }

    public UserDTO deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        user.setIsActive(false);
        
        User updatedUser = userRepository.save(user);
        return convertToUserDTO(updatedUser);
    }

    public UserDTO activateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        user.setIsActive(true);
        
        User updatedUser = userRepository.save(user);
        return convertToUserDTO(updatedUser);
    }

    public String resetUserPassword(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        String newPassword = generateRandomPassword();
        user.setPassword(passwordEncoder.encode(newPassword));
        
        userRepository.save(user);
        
        return newPassword;
    }

    public UserStatisticsDTO getUserStatistics() {
        Long totalUsers = userRepository.count();
        Long activeUsers = userRepository.countByIsActive(true);
        Long inactiveUsers = userRepository.countByIsActive(false);
        
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        
        Long newUsersThisMonth = userRepository.countByCreatedAtAfter(startOfMonth);
        Long newUsersToday = userRepository.countByCreatedAtAfter(startOfDay);
        
        Double averageAddressesPerUser = totalUsers > 0 ? 
            (double) addressRepository.count() / totalUsers : 0.0;

        return new UserStatisticsDTO(
            totalUsers,
            activeUsers,
            inactiveUsers,
            newUsersThisMonth,
            newUsersToday,
            averageAddressesPerUser
        );
    }

    public String performBulkAction(BulkUserActionDTO bulkActionDTO) {
        List<User> users = userRepository.findAllById(bulkActionDTO.getUserIds());
        
        if (users.size() != bulkActionDTO.getUserIds().size()) {
            throw new UserNotFoundException("Some users not found");
        }

        switch (bulkActionDTO.getActionType()) {
            case ACTIVATE:
                users.forEach(user -> user.setIsActive(true));
                userRepository.saveAll(users);
                return "Successfully activated " + users.size() + " users";

            case DEACTIVATE:
                users.forEach(user -> user.setIsActive(false));
                userRepository.saveAll(users);
                return "Successfully deactivated " + users.size() + " users";

            case DELETE:
                users.forEach(user -> addressRepository.deleteByUserId(user.getId()));
                userRepository.deleteAll(users);
                return "Successfully deleted " + users.size() + " users";

            case RESET_PASSWORD:
                users.forEach(user -> {
                    String newPassword = generateRandomPassword();
                    user.setPassword(passwordEncoder.encode(newPassword));
                });
                userRepository.saveAll(users);
                return "Successfully reset passwords for " + users.size() + " users";

            default:
                throw new BusinessException("Invalid bulk action type");
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * ✅ FIX: Basic DTO conversion - không load relationships
     */
    private UserDTO convertToBasicUserDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());
        userDTO.setFirstName(user.getFirstName());
        userDTO.setLastName(user.getLastName());
        userDTO.setPhoneNumber(user.getPhoneNumber());
        userDTO.setIsActive(user.getIsActive());
        
        // Set role to default if not loaded
        userDTO.setRole("ROLE_USER");
        
        // Don't load addresses để tránh N+1
        userDTO.setAddresses(List.of());
        
        return userDTO;
    }

    /**
     * ✅ FIX: Full DTO conversion - load relationships khi cần
     */
    private UserDTO convertToUserDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());
        userDTO.setFirstName(user.getFirstName());
        userDTO.setLastName(user.getLastName());
        userDTO.setPhoneNumber(user.getPhoneNumber());
        userDTO.setIsActive(user.getIsActive());
        
        // Map roles - sử dụng helper method
        userDTO.setRole(user.getPrimaryRoleAsString());
        
        // Load addresses từ database nếu chưa có
        List<Address> addresses = addressRepository.findByUserIdOrderByIsDefaultDesc(user.getId());
        userDTO.setAddresses(addresses.stream()
            .map(this::convertToAddressDTO)
            .collect(Collectors.toList()));
        
        return userDTO;
    }

    /**
     * ✅ FIX: Conversion với addresses đã được load từ JOIN FETCH
     */
    private UserDTO convertToUserDTOWithAddresses(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setIsActive(user.getIsActive());
        
        // Set role sử dụng helper method
        dto.setRole(user.getPrimaryRoleAsString());
        
        // Convert addresses nếu đã được load
        if (user.getAddresses() != null) {
            List<AddressDTO> addressDTOs = user.getAddresses().stream()
                .sorted((a1, a2) -> Boolean.compare(a2.getIsDefault(), a1.getIsDefault()))
                .map(this::convertToAddressDTO)
                .collect(Collectors.toList());
            dto.setAddresses(addressDTOs);
        } else {
            dto.setAddresses(List.of());
        }
        
        return dto;
    }

    private AddressDTO convertToAddressDTO(Address address) {
        AddressDTO addressDTO = new AddressDTO();
        addressDTO.setId(address.getId());
        addressDTO.setProvince(address.getProvince());
        addressDTO.setDistrict(address.getDistrict());
        addressDTO.setWard(address.getWard());
        addressDTO.setStreet(address.getStreet());
        
        if (address.getAddressType() != null) {
            addressDTO.setAddressType((address.getAddressType()));
        } else {
            addressDTO.setAddressType(AddressType.NHA_RIENG);
        }
        
        addressDTO.setReceiverName(address.getReceiverName());
        
        // ✅ FIX: Handle phone conversion based on entity type
        if (address.getReceiverPhone() != null) {
            // If entity uses String
            addressDTO.setReceiverPhone(address.getReceiverPhone());
            
            // If entity uses Long, convert:
            // addressDTO.setReceiverPhone(address.getReceiverPhone().toString());
        }
        
        addressDTO.setIsDefault(address.getIsDefault());
        addressDTO.setCreatedAt(address.getCreatedAt());
        addressDTO.setUpdatedAt(address.getUpdatedAt());
        return addressDTO;
    }

    private String generateRandomPassword() {
        return "TempPass" + UUID.randomUUID().toString().substring(0, 8);
    }

    private boolean hasRole(User user, ERole role) {
        return user.getRoles().stream()
                .anyMatch(r -> r.getName() == role);
    }

    private void addRoleToUser(User user, ERole roleName) {
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new BusinessException("Role not found: " + roleName));
        user.getRoles().add(role);
    }

    private void removeRoleFromUser(User user, ERole roleName) {
        user.getRoles().removeIf(role -> role.getName() == roleName);
    }
}