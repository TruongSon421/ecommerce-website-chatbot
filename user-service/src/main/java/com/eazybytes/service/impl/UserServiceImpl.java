package com.eazybytes.service.impl;

import com.eazybytes.model.ERole;
import com.eazybytes.model.Role;
import com.eazybytes.repository.RoleRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.eazybytes.dto.UserDTO;
import com.eazybytes.model.User;
import com.eazybytes.repository.UserRepository;
import com.eazybytes.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;  // thêm passwordEncoder
    private final RoleRepository roleRepository;
    @Override
    @Transactional
    public UserDTO createUser(UserDTO userDTO) {
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        Set<Role> roles = new HashSet<>();
        userDTO.getRoles().forEach(roleName -> {
            Role role = roleRepository.findByName(ERole.valueOf(roleName))
                    .orElseThrow(() -> new RuntimeException("Error: Role " + roleName + " is not found."));
            roles.add(role);
        });

        User user = User.builder()
                .username(userDTO.getUsername())
                .email(userDTO.getEmail())
                .password(passwordEncoder.encode(userDTO.getPassword()))
                .firstName(userDTO.getFirstName())
                .lastName(userDTO.getLastName())
                .phoneNumber(userDTO.getPhoneNumber())
                .roles(roles)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }


    @Override
    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setPhoneNumber(userDTO.getPhoneNumber());

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    @Override
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    @Override
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user);
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .roles(user.getRoles().stream()  // Convert Set<Role> to List<String>
                        .map(role -> role.getName().name())
                        .collect(Collectors.toList()))
                .isActive(user.getIsActive())
                .build();
    }
}
