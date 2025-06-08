// UserService.java (final fixed version)
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.HashSet;

import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==================== EXISTING METHODS ====================
    
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
                .roles(new HashSet<>()) // Initialize roles set
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
            // Default to USER role if no roles specified
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new BusinessException("Default role not found"));
            user.getRoles().add(userRole);
        }

        User savedUser = userRepository.save(user);
        return convertToUserDTO(savedUser);
    }

    public UserDTO getUserWithAddresses(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        return convertToUserDTO(user);
    }

    public UserDTO updateUser(Long userId, UserDTO userDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        // Regular users can only update limited fields
        if (userDTO.getFirstName() != null) {
            user.setFirstName(userDTO.getFirstName());
        }
        if (userDTO.getLastName() != null) {
            user.setLastName(userDTO.getLastName());
        }
        if (userDTO.getPhoneNumber() != null) {
            user.setPhoneNumber(userDTO.getPhoneNumber());
        }

        User updatedUser = userRepository.save(user);
        return convertToUserDTO(updatedUser);
    }

    public AddressDTO addAddress(Long userId, AddressDTO addressDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        // If this is set as default, clear other default addresses
        if (addressDTO.getIsDefault() != null && addressDTO.getIsDefault()) {
            addressRepository.clearDefaultAddressForUser(userId);
        }

        Address address = new Address();
        address.setUser(user);
        address.setProvince(addressDTO.getProvince());
        address.setDistrict(addressDTO.getDistrict());
        address.setWard(addressDTO.getWard());
        address.setStreet(addressDTO.getStreet());
        
        // Handle AddressType conversion
        if (addressDTO.getAddressType() != null) {
            address.setAddressType((addressDTO.getAddressType()));
        } else {
            address.setAddressType(AddressType.NHA_RIENG); // Default
        }
        
        address.setReceiverName(addressDTO.getReceiverName());
        address.setReceiverPhone(addressDTO.getReceiverPhone());
        address.setIsDefault(addressDTO.getIsDefault() != null ? addressDTO.getIsDefault() : false);

        Address savedAddress = addressRepository.save(address);
        return convertToAddressDTO(savedAddress);
    }

    public AddressDTO updateAddress(Long userId, Long addressId, AddressDTO addressDTO) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new AddressNotFoundException("Address not found"));

        // If this is set as default, clear other default addresses
        if (addressDTO.getIsDefault() != null && addressDTO.getIsDefault() && !address.getIsDefault()) {
            addressRepository.clearDefaultAddressForUser(userId);
        }

        address.setProvince(addressDTO.getProvince());
        address.setDistrict(addressDTO.getDistrict());
        address.setWard(addressDTO.getWard());
        address.setStreet(addressDTO.getStreet());
        
        // Handle AddressType conversion
        if (addressDTO.getAddressType() != null) {
            address.setAddressType((addressDTO.getAddressType()));
        }
        
        address.setReceiverName(addressDTO.getReceiverName());
        address.setReceiverPhone(addressDTO.getReceiverPhone());
        address.setIsDefault(addressDTO.getIsDefault() != null ? addressDTO.getIsDefault() : address.getIsDefault());

        Address updatedAddress = addressRepository.save(address);
        return convertToAddressDTO(updatedAddress);
    }

    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new AddressNotFoundException("Address not found"));

        boolean wasDefault = address.getIsDefault();
        addressRepository.delete(address);

        // If deleted address was default, set another address as default
        if (wasDefault) {
            List<Address> remainingAddresses = addressRepository.findByUserIdOrderByIsDefaultDesc(userId);
            if (!remainingAddresses.isEmpty()) {
                Address newDefault = remainingAddresses.get(0);
                newDefault.setIsDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    // ==================== ADMIN METHODS (NO SPECIFICATION) ====================

    public Page<UserDTO> getAllUsers(String search, String status, Pageable pageable) {
        // Sử dụng query với JOIN FETCH
        List<User> allUsers = userRepository.findAllWithAddresses();
        
        // Apply search filter
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            allUsers = allUsers.stream()
                .filter(user -> 
                    (user.getUsername() != null && user.getUsername().toLowerCase().contains(searchLower)) ||
                    (user.getEmail() != null && user.getEmail().toLowerCase().contains(searchLower)) ||
                    (user.getFirstName() != null && user.getFirstName().toLowerCase().contains(searchLower)) ||
                    (user.getLastName() != null && user.getLastName().toLowerCase().contains(searchLower)) ||
                    (user.getPhoneNumber() != null && user.getPhoneNumber().toString().contains(search))
                )
                .collect(Collectors.toList());
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
            .map(this::convertToUserDTOWithAddresses) // Sử dụng method có load addresses
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

        // Delete all addresses first
        addressRepository.deleteByUserId(userId);
        
        // Delete user
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

        // Generate new random password
        String newPassword = generateRandomPassword();
        user.setPassword(passwordEncoder.encode(newPassword));
        
        userRepository.save(user);
        
        return newPassword;
    }

    public UserStatisticsDTO getUserStatistics() {
        Long totalUsers = userRepository.count();
        
        // Use simple counting methods
        Long activeUsers = 0L;
        Long inactiveUsers = 0L;
        
        try {
            activeUsers = userRepository.countByIsActive(true);
            inactiveUsers = userRepository.countByIsActive(false);
        } catch (Exception e) {
            // Fallback to manual counting
            List<User> allUsers = userRepository.findAll();
            activeUsers = allUsers.stream()
                .filter(user -> user.getIsActive() != null && user.getIsActive())
                .count();
            inactiveUsers = totalUsers - activeUsers;
        }
        
        // For time-based stats, use manual calculation to avoid query issues
        Long newUsersThisMonth = 0L;
        Long newUsersToday = 0L;
        
        try {
            // Only try this if you have createdAt field properly mapped
            LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
            
            // Check if User entity has createdAt field
            List<User> allUsers = userRepository.findAll();
            newUsersThisMonth = allUsers.stream()
                .filter(user -> user.getCreatedAt() != null && user.getCreatedAt().isAfter(startOfMonth))
                .count();
                
            newUsersToday = allUsers.stream()
                .filter(user -> user.getCreatedAt() != null && user.getCreatedAt().isAfter(startOfDay))
                .count();
        } catch (Exception e) {
            // If createdAt field doesn't exist or has issues, set to 0
            newUsersThisMonth = 0L;
            newUsersToday = 0L;
        }
        
        // Calculate average addresses per user
        Double averageAddressesPerUser = 0.0;
        try {
            Long totalAddresses = addressRepository.count();
            averageAddressesPerUser = totalUsers > 0 ? (double) totalAddresses / totalUsers : 0.0;
        } catch (Exception e) {
            averageAddressesPerUser = 0.0;
        }

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
                // Delete addresses first
                users.forEach(user -> addressRepository.deleteByUserId(user.getId()));
                
                // Delete users
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

    private UserDTO convertToUserDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());
        userDTO.setFirstName(user.getFirstName());
        userDTO.setLastName(user.getLastName());
        userDTO.setPhoneNumber(user.getPhoneNumber());
        userDTO.setIsActive(user.getIsActive());
        
        // Map roles from Set<Role> to String - get primary role or first role
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            // Find admin role first, otherwise use first role
            Role primaryRole = user.getRoles().stream()
                .filter(role -> role.getName() == ERole.ROLE_ADMIN)
                .findFirst()
                .orElse(user.getRoles().iterator().next());
            userDTO.setRole(primaryRole.getName().toString());
        } else {
            userDTO.setRole("ROLE_USER"); // Default role
        }
        
        // Load addresses (use existing addresses from entity if available)
        if (user.getAddresses() != null && !user.getAddresses().isEmpty()) {
            userDTO.setAddresses(user.getAddresses().stream()
                .sorted((a1, a2) -> Boolean.compare(a2.getIsDefault(), a1.getIsDefault()))
                .map(this::convertToAddressDTO)
                .collect(Collectors.toList()));
        } else {
            // Fallback to repository query
            List<Address> addresses = addressRepository.findByUserIdOrderByIsDefaultDesc(user.getId());
            userDTO.setAddresses(addresses.stream().map(this::convertToAddressDTO).collect(Collectors.toList()));
        }
        
        return userDTO;
    }

    private UserDTO convertToUserDTOWithAddresses(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setIsActive(user.getIsActive());
        
        // Convert addresses
        if (user.getAddresses() != null) {
            List<AddressDTO> addressDTOs = user.getAddresses().stream()
                .map(this::convertToAddressDTO)
                .collect(Collectors.toList());
            dto.setAddresses(addressDTOs);
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
        
        // Convert AddressType enum to String safely
        if (address.getAddressType() != null) {
            addressDTO.setAddressType((address.getAddressType()));
        } else {
            addressDTO.setAddressType(AddressType.NHA_RIENG);
        }
        
        addressDTO.setReceiverName(address.getReceiverName());
        addressDTO.setReceiverPhone(address.getReceiverPhone());
        addressDTO.setIsDefault(address.getIsDefault());
        return addressDTO;
    }

    private String generateRandomPassword() {
        return "TempPass" + UUID.randomUUID().toString().substring(0, 8);
    }

    // Helper method to check if user has specific role
    private boolean hasRole(User user, ERole role) {
        return user.getRoles().stream()
                .anyMatch(r -> r.getName() == role);
    }

    // Helper method to add role to user
    private void addRoleToUser(User user, ERole roleName) {
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new BusinessException("Role not found: " + roleName));
        user.getRoles().add(role);
    }

    // Helper method to remove role from user
    private void removeRoleFromUser(User user, ERole roleName) {
        user.getRoles().removeIf(role -> role.getName() == roleName);
    }
}