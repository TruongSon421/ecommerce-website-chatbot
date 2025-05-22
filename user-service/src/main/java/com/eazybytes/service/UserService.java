package com.eazybytes.service;

import com.eazybytes.dto.AddressDTO;
import com.eazybytes.dto.UserDTO;
import com.eazybytes.dto.CreateUserDTO;
import com.eazybytes.model.Address;
import com.eazybytes.model.User;
import com.eazybytes.model.Role;

import com.eazybytes.repository.AddressRepository;
import com.eazybytes.repository.UserRepository;
import com.eazybytes.repository.RoleRepository;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public UserDTO createUser(CreateUserDTO createUserDTO) {
        // Check for duplicate username or email
        if (userRepository.existsByUsername(createUserDTO.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(createUserDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setUsername(createUserDTO.getUsername());
        user.setEmail(createUserDTO.getEmail());
        user.setPassword(passwordEncoder.encode(createUserDTO.getPassword()));
        user.setFirstName(createUserDTO.getFirstName());
        user.setLastName(createUserDTO.getLastName());
        user.setPhoneNumber(createUserDTO.getPhoneNumber());
        user.setIsActive(createUserDTO.getIsActive() != null ? createUserDTO.getIsActive() : true);

        // Assign roles
        if (createUserDTO.getRoleNames() != null && !createUserDTO.getRoleNames().isEmpty()) {
            Set<Role> roles = createUserDTO.getRoleNames().stream()
                    .map(roleName -> roleRepository.findByName(roleName)
                            .orElseThrow(() -> new EntityNotFoundException("Role not found: " + roleName)))
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }

        // Add addresses if provided
        if (createUserDTO.getAddresses() != null && !createUserDTO.getAddresses().isEmpty()) {
            List<Address> addresses = createUserDTO.getAddresses().stream()
                    .map(this::mapToAddress)
                    .collect(Collectors.toList());

            // Ensure exactly one default address
            boolean hasDefault = addresses.stream().anyMatch(Address::getIsDefault);
            if (!hasDefault && !addresses.isEmpty()) {
                addresses.get(0).setIsDefault(true); // Set first address as default if none specified
            } else if (addresses.stream().filter(Address::getIsDefault).count() > 1) {
                // If multiple defaults are specified, keep only the first one
                boolean firstDefaultSet = false;
                for (Address address : addresses) {
                    if (address.getIsDefault() && !firstDefaultSet) {
                        firstDefaultSet = true;
                    } else {
                        address.setIsDefault(false);
                    }
                }
            }

            addresses.forEach(user::addAddress);
        }

        userRepository.save(user);
        return mapToUserDTO(user);
    }

    public UserDTO getUserWithAddresses(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return mapToUserDTO(user);
    }

    @Transactional
    public UserDTO updateUser(Long userId, UserDTO userDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setPhoneNumber(userDTO.getPhoneNumber());
        user.setEmail(userDTO.getEmail());
        userRepository.save(user);
        return mapToUserDTO(user);
    }

    @Transactional
    public AddressDTO addAddress(Long userId, AddressDTO addressDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Address address = mapToAddress(addressDTO);
        List<Address> existingAddresses = user.getAddresses();

        // If this is the first address, set it as default
        if (existingAddresses.isEmpty()) {
            address.setIsDefault(true);
        } else if (addressDTO.getIsDefault() != null && addressDTO.getIsDefault()) {
            // If the new address is set as default, unset the current default
            unsetCurrentDefaultAddress(existingAddresses);
            address.setIsDefault(true);
        } else {
            // Ensure isDefault is set to false if not specified or explicitly false
            address.setIsDefault(false);
        }

        user.addAddress(address);
        addressRepository.save(address);
        return mapToAddressDTO(address);
    }

    @Transactional
    public AddressDTO updateAddress(Long userId, Long addressId, AddressDTO addressDTO) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Address not found or not associated with user"));

        User user = address.getUser();
        List<Address> existingAddresses = user.getAddresses();

        // Handle default address logic
        if (addressDTO.getIsDefault() != null) {
            if (addressDTO.getIsDefault() && !address.getIsDefault()) {
                // If setting this address as default, unset the current default
                unsetCurrentDefaultAddress(existingAddresses);
                address.setIsDefault(true);
            } else if (!addressDTO.getIsDefault() && address.getIsDefault()) {
                // If unsetting the default address, assign default to another address
                if (existingAddresses.size() > 1) {
                    // Find another address to set as default
                    Address newDefault = existingAddresses.stream()
                            .filter(a -> !a.getId().equals(addressId))
                            .findFirst()
                            .orElseThrow(() -> new IllegalStateException("At least one address must be default"));
                    newDefault.setIsDefault(true);
                    addressRepository.save(newDefault);
                } else {
                    throw new IllegalStateException("Cannot unset default address when only one address exists");
                }
                address.setIsDefault(false);
            }
        }

        // Update other address fields
        address.setProvince(addressDTO.getProvince());
        address.setDistrict(addressDTO.getDistrict());
        address.setWard(addressDTO.getWard());
        address.setStreet(addressDTO.getStreet());
        address.setAddressType(addressDTO.getAddressType());
        address.setReceiverName(addressDTO.getReceiverName());
        address.setReceiverPhone(addressDTO.getReceiverPhone());
        addressRepository.save(address);
        return mapToAddressDTO(address);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Address not found or not associated with user"));

        User user = address.getUser();
        List<Address> existingAddresses = user.getAddresses();

        // If the address being deleted is the default, assign default to another address
        if (address.getIsDefault() && existingAddresses.size() > 1) {
            Address newDefault = existingAddresses.stream()
                    .filter(a -> !a.getId().equals(addressId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("At least one address must be default"));
            newDefault.setIsDefault(true);
            addressRepository.save(newDefault);
        }

        user.removeAddress(address);
        addressRepository.delete(address);
    }

    private void unsetCurrentDefaultAddress(List<Address> addresses) {
        addresses.stream()
                .filter(Address::getIsDefault)
                .findFirst()
                .ifPresent(currentDefault -> {
                    currentDefault.setIsDefault(false);
                    addressRepository.save(currentDefault);
                });
    }

    private UserDTO mapToUserDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());
        userDTO.setFirstName(user.getFirstName());
        userDTO.setLastName(user.getLastName());
        userDTO.setPhoneNumber(user.getPhoneNumber());
        userDTO.setIsActive(user.getIsActive());
        userDTO.setAddresses(user.getAddresses().stream()
                .map(this::mapToAddressDTO)
                .collect(Collectors.toList()));
        return userDTO;
    }

    private AddressDTO mapToAddressDTO(Address address) {
        AddressDTO addressDTO = new AddressDTO();
        addressDTO.setId(address.getId());
        addressDTO.setProvince(address.getProvince());
        addressDTO.setDistrict(address.getDistrict());
        addressDTO.setWard(address.getWard());
        addressDTO.setStreet(address.getStreet());
        addressDTO.setAddressType(address.getAddressType());
        addressDTO.setReceiverName(address.getReceiverName());
        addressDTO.setReceiverPhone(address.getReceiverPhone());
        addressDTO.setIsDefault(address.getIsDefault());
        return addressDTO;
    }

    private Address mapToAddress(AddressDTO addressDTO) {
        Address address = new Address();
        address.setProvince(addressDTO.getProvince());
        address.setDistrict(addressDTO.getDistrict());
        address.setWard(addressDTO.getWard());
        address.setStreet(addressDTO.getStreet());
        address.setAddressType(addressDTO.getAddressType());
        address.setReceiverName(addressDTO.getReceiverName());
        address.setReceiverPhone(addressDTO.getReceiverPhone());
        address.setIsDefault(addressDTO.getIsDefault() != null ? addressDTO.getIsDefault() : false);
        return address;
    }
}