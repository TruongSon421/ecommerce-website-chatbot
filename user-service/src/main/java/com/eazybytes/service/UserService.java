package com.eazybytes.service;

import com.eazybytes.dto.UserDTO;
import com.eazybytes.model.User;
import java.util.List;

public interface UserService {
    UserDTO createUser(UserDTO userDTO);
    UserDTO updateUser(Long id, UserDTO userDTO);
    UserDTO getUserById(Long id);
    List<UserDTO> getAllUsers();
    void deleteUser(Long id);
    UserDTO getUserByEmail(String email);
}