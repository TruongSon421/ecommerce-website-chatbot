package com.eazybytes.controller;

import com.eazybytes.dto.AddressDTO;
import com.eazybytes.dto.UserDTO;
import com.eazybytes.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void getUserDetails_ShouldReturnUserDTO_WhenValidUserId() throws Exception {
        // Given
        Long userId = 1L;
        UserDTO userDTO = createTestUserDTO();
        when(userService.getUserWithAddresses(userId)).thenReturn(userDTO);

        // When & Then
        mockMvc.perform(get("/api/users/me")
                .header("X-Auth-UserId", userId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(userDTO.getId()))
                .andExpect(jsonPath("$.username").value(userDTO.getUsername()))
                .andExpect(jsonPath("$.email").value(userDTO.getEmail()))
                .andExpect(jsonPath("$.firstName").value(userDTO.getFirstName()))
                .andExpect(jsonPath("$.lastName").value(userDTO.getLastName()))
                .andExpect(jsonPath("$.addresses").isArray())
                .andExpect(jsonPath("$.addresses[0].province").value("Ho Chi Minh"));

        verify(userService, times(1)).getUserWithAddresses(userId);
    }


    @Test
    void updateUser_ShouldReturnUpdatedUser_WhenValidRequest() throws Exception {
        // Given
        Long userId = 1L;
        UserDTO inputUserDTO = createTestUserDTO();
        UserDTO updatedUserDTO = createTestUserDTO();
        updatedUserDTO.setFirstName("Updated Name");

        when(userService.updateUser(eq(userId), any(UserDTO.class))).thenReturn(updatedUserDTO);

        // When & Then
        mockMvc.perform(put("/api/users/me")
                .header("X-Auth-UserId", userId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inputUserDTO)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.firstName").value("Updated Name"));

        verify(userService, times(1)).updateUser(eq(userId), any(UserDTO.class));
    }

    @Test
    void addAddress_ShouldReturnNewAddress_WhenValidRequest() throws Exception {
        // Given
        Long userId = 1L;
        AddressDTO inputAddressDTO = createTestAddressDTO();
        AddressDTO savedAddressDTO = createTestAddressDTO();
        savedAddressDTO.setId(10L);

        when(userService.addAddress(eq(userId), any(AddressDTO.class))).thenReturn(savedAddressDTO);

        // When & Then
        mockMvc.perform(post("/api/users/me/addresses")
                .header("X-Auth-UserId", userId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inputAddressDTO)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.province").value("Ho Chi Minh"))
                .andExpect(jsonPath("$.receiverName").value("John Doe"));

        verify(userService, times(1)).addAddress(eq(userId), any(AddressDTO.class));
    }

    @Test
    void updateAddress_ShouldReturnUpdatedAddress_WhenValidRequest() throws Exception {
        // Given
        Long userId = 1L;
        Long addressId = 5L;
        AddressDTO inputAddressDTO = createTestAddressDTO();
        AddressDTO updatedAddressDTO = createTestAddressDTO();
        updatedAddressDTO.setId(addressId);
        updatedAddressDTO.setReceiverName("Updated Receiver");

        when(userService.updateAddress(eq(userId), eq(addressId), any(AddressDTO.class)))
                .thenReturn(updatedAddressDTO);

        // When & Then
        mockMvc.perform(put("/api/users/me/addresses/{addressId}", addressId)
                .header("X-Auth-UserId", userId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inputAddressDTO)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(addressId))
                .andExpect(jsonPath("$.receiverName").value("Updated Receiver"));

        verify(userService, times(1)).updateAddress(eq(userId), eq(addressId), any(AddressDTO.class));
    }


    @Test
    void deleteAddress_ShouldReturnNoContent_WhenValidRequest() throws Exception {
        // Given
        Long userId = 1L;
        Long addressId = 5L;

        doNothing().when(userService).deleteAddress(userId, addressId);

        // When & Then
        mockMvc.perform(delete("/api/users/me/addresses/{addressId}", addressId)
                .header("X-Auth-UserId", userId))
                .andExpect(status().isNoContent());

        verify(userService, times(1)).deleteAddress(userId, addressId);
    }

    @Test
    void getUserDetails_ShouldReturnBadRequest_WhenMissingUserIdHeader() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(userService);
    }

    @Test
    void updateUser_ShouldReturnBadRequest_WhenMissingUserIdHeader() throws Exception {
        // Given
        UserDTO userDTO = createTestUserDTO();

        // When & Then
        mockMvc.perform(put("/api/users/me")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userDTO)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(userService);
    }

    @Test
    void addAddress_ShouldReturnBadRequest_WhenMissingUserIdHeader() throws Exception {
        // Given
        AddressDTO addressDTO = createTestAddressDTO();

        // When & Then
        mockMvc.perform(post("/api/users/me/addresses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addressDTO)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(userService);
    }

    @Test
    void updateAddress_ShouldReturnBadRequest_WhenMissingUserIdHeader() throws Exception {
        // Given
        AddressDTO addressDTO = createTestAddressDTO();

        // When & Then
        mockMvc.perform(put("/api/users/me/addresses/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addressDTO)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(userService);
    }

    @Test
    void deleteAddress_ShouldReturnBadRequest_WhenMissingUserIdHeader() throws Exception {
        // When & Then
        mockMvc.perform(delete("/api/users/me/addresses/1"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(userService);
    }

    @Test
    void addAddress_ShouldReturnBadRequest_WhenEmptyRequestBody() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/users/me/addresses")
                .header("X-Auth-UserId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(userService);
    }

    @Test
    void updateAddress_ShouldReturnBadRequest_WhenEmptyRequestBody() throws Exception {
        // When & Then
        mockMvc.perform(put("/api/users/me/addresses/1")
                .header("X-Auth-UserId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(userService);
    }

    @Test
    void updateUser_ShouldHandleInvalidJson() throws Exception {
        // When & Then
        mockMvc.perform(put("/api/users/me")
                .header("X-Auth-UserId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("invalid json"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(userService);
    }

    @Test
    void addAddress_ShouldHandleInvalidJson() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/users/me/addresses")
                .header("X-Auth-UserId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("invalid json"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(userService);
    }

    // Helper methods
    private UserDTO createTestUserDTO() {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(1L);
        userDTO.setUsername("testuser");
        userDTO.setEmail("test@example.com");
        userDTO.setFirstName("John");
        userDTO.setLastName("Doe");
        userDTO.setPhoneNumber("0123456789");
        userDTO.setIsActive(true);
        userDTO.setAddresses(Arrays.asList(createTestAddressDTO()));
        return userDTO;
    }

    private AddressDTO createTestAddressDTO() {
        AddressDTO addressDTO = new AddressDTO();
        addressDTO.setId(1L);
        addressDTO.setProvince("Ho Chi Minh");
        addressDTO.setDistrict("District 1");
        addressDTO.setWard("Ward 1");
        addressDTO.setStreet("123 Test Street");
        addressDTO.setAddressType("HOME");
        addressDTO.setReceiverName("John Doe");
        addressDTO.setReceiverPhone("0123456789");
        addressDTO.setIsDefault(true);
        return addressDTO;
    }
}