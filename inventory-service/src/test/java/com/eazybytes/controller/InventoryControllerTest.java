package com.eazybytes.controller;

import com.eazybytes.dto.InventoryDto;
import com.eazybytes.dto.VariantDto;
import com.eazybytes.exception.InventoryAlreadyExistsException;
import com.eazybytes.model.ProductInventory;
import com.eazybytes.security.RoleChecker;
import com.eazybytes.service.GroupService;
import com.eazybytes.service.InventoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InventoryController.class)
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InventoryService inventoryService;

    @MockBean
    private GroupService groupService;

    @MockBean
    private RoleChecker roleChecker;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private WebApplicationContext context;

    private InventoryDto inventoryDto;
    private ProductInventory productInventory;
    private VariantDto variantDto;

    @BeforeEach
    void setUp() {
        // Initialize MockMvc
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();

        // Set up RequestContextHolder for RoleChecker (optional, as we mock roleChecker)
        HttpServletRequest mockRequest = mock(HttpServletRequest.class);
        ServletRequestAttributes attributes = new ServletRequestAttributes(mockRequest);
        RequestContextHolder.setRequestAttributes(attributes);

        // Initialize test data
        inventoryDto = new InventoryDto();
        inventoryDto.setInventoryId(1);
        inventoryDto.setProductId("prod1");
        inventoryDto.setProductName("Test Product");
        inventoryDto.setColor("Red");
        inventoryDto.setQuantity(10);
        inventoryDto.setOriginalPrice(100);
        inventoryDto.setCurrentPrice(90);

        productInventory = new ProductInventory();
        productInventory.setInventoryId(1);
        productInventory.setProductId("prod1");
        productInventory.setProductName("Test Product");
        productInventory.setColor("Red");
        productInventory.setQuantity(10);
        productInventory.setOriginalPrice(100);
        productInventory.setCurrentPrice(90);

        variantDto = new VariantDto();
        variantDto.setProductId("prod2");
        variantDto.setVariant("Blue");
    }

    // Helper methods to set roles
    private MockHttpServletRequestBuilder withAdminRole(MockHttpServletRequestBuilder request) {
        when(roleChecker.hasRole("ADMIN")).thenReturn(true);
        return request.header("X-Auth-Roles", "ROLE_ADMIN");
    }

    private MockHttpServletRequestBuilder withoutAdminRole(MockHttpServletRequestBuilder request) {
        when(roleChecker.hasRole("ADMIN")).thenReturn(false);
        return request.header("X-Auth-Roles", "ROLE_USER");
    }

    private MockHttpServletRequestBuilder withoutHeader(MockHttpServletRequestBuilder request) {
        when(roleChecker.hasRole("ADMIN")).thenReturn(false);
        return request;
    }

    @Test
    void getProductColorVariants_Success() throws Exception {
        List<InventoryDto> variants = List.of(inventoryDto);
        when(inventoryService.findAllColorVariantsByProductId("prod1")).thenReturn(variants);

        mockMvc.perform(get("/api/inventory/productColorVariants/prod1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].productId").value("prod1"))
                .andExpect(jsonPath("$[0].color").value("Red"));

        verify(inventoryService).findAllColorVariantsByProductId("prod1");
    }

    @Test
    void getProductColorVariants_NotFound() throws Exception {
        when(inventoryService.findAllColorVariantsByProductId("prod1")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/inventory/productColorVariants/prod1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(inventoryService).findAllColorVariantsByProductId("prod1");
    }

    @Test
    void getRelatedProducts_Success() throws Exception {
        List<VariantDto> relatedProducts = List.of(variantDto);
        when(groupService.findAllProductsInSameGroup("prod1")).thenReturn(relatedProducts);

        mockMvc.perform(get("/api/inventory/related/prod1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].productId").value("prod2"))
                .andExpect(jsonPath("$[0].variant").value("Blue"));

        verify(groupService).findAllProductsInSameGroup("prod1");
    }

    @Test
    void getInventory_Success() throws Exception {
        when(inventoryService.getProductInventory("prod1", "Red")).thenReturn(productInventory);

        mockMvc.perform(get("/api/inventory/product")
                .param("productId", "prod1")
                .param("color", "Red")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value("prod1"))
                .andExpect(jsonPath("$.color").value("Red"));

        verify(inventoryService).getProductInventory("prod1", "Red");
    }

    @Test
    void getInventory_NoColor_Success() throws Exception {
        when(inventoryService.getProductInventory("prod1", null)).thenReturn(productInventory);

        mockMvc.perform(get("/api/inventory/product")
                .param("productId", "prod1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value("prod1"))
                .andExpect(jsonPath("$.color").value("Red"));

        verify(inventoryService).getProductInventory("prod1", null);
    }

    @Test
    void createInventory_Success() throws Exception {
        when(inventoryService.createInventory(any(InventoryDto.class))).thenReturn(productInventory);

        mockMvc.perform(withAdminRole(post("/api/inventory/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inventoryDto))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productId").value("prod1"))
                .andExpect(jsonPath("$.color").value("Red"));

        verify(inventoryService).createInventory(any(InventoryDto.class));
    }

    @Test
    void createInventory_Conflict() throws Exception {
        when(inventoryService.createInventory(any(InventoryDto.class)))
                .thenThrow(new InventoryAlreadyExistsException("Inventory already exists"));

        mockMvc.perform(withAdminRole(post("/api/inventory/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inventoryDto))))
                .andExpect(status().isConflict());

        verify(inventoryService).createInventory(any(InventoryDto.class));
    }

    @Test
    void createInventory_InvalidInput() throws Exception {
        InventoryDto invalidDto = new InventoryDto();
        invalidDto.setProductId(""); // Invalid due to @NotBlank
        invalidDto.setProductName("Test Product");
        invalidDto.setColor("Red");
        invalidDto.setQuantity(10);
        invalidDto.setOriginalPrice(100);
        invalidDto.setCurrentPrice(90);

        mockMvc.perform(withAdminRole(post("/api/inventory/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDto))))
                .andExpect(status().isBadRequest());

        verify(inventoryService, never()).createInventory(any(InventoryDto.class));
    }

    @Test
    void updateInventory_Success() throws Exception {
        when(inventoryService.updateInventory(any(InventoryDto.class))).thenReturn(productInventory);

        mockMvc.perform(withAdminRole(put("/api/inventory/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inventoryDto))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value("prod1"))
                .andExpect(jsonPath("$.color").value("Red"));

        verify(inventoryService).updateInventory(any(InventoryDto.class));
    }

    @Test
    void updateInventory_InvalidInput() throws Exception {
        InventoryDto invalidDto = new InventoryDto();
        invalidDto.setProductId(""); // Invalid due to @NotBlank
        invalidDto.setProductName("Test Product");
        invalidDto.setColor("Red");
        invalidDto.setQuantity(10);
        invalidDto.setOriginalPrice(100);
        invalidDto.setCurrentPrice(90);

        mockMvc.perform(withAdminRole(put("/api/inventory/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDto))))
                .andExpect(status().isBadRequest());

        verify(inventoryService, never()).updateInventory(any(InventoryDto.class));
    }

    @Test
    void decreaseProductQuantity_Success() throws Exception {
        when(inventoryService.decreaseProductQuantity("prod1", "Red", 5)).thenReturn(productInventory);

        mockMvc.perform(withAdminRole(post("/api/inventory/decrease")
                .param("productId", "prod1")
                .param("color", "Red")
                .param("quantity", "5")
                .contentType(MediaType.APPLICATION_JSON)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value("prod1"))
                .andExpect(jsonPath("$.quantity").value(10));

        verify(inventoryService).decreaseProductQuantity("prod1", "Red", 5);
    }

    @Test
    void increaseProductQuantity_Success() throws Exception {
        when(inventoryService.increaseProductQuantity("prod1", "Red", 5)).thenReturn(productInventory);

        mockMvc.perform(withAdminRole(post("/api/inventory/increase")
                .param("productId", "prod1")
                .param("color", "Red")
                .param("quantity", "5")
                .contentType(MediaType.APPLICATION_JSON)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value("prod1"))
                .andExpect(jsonPath("$.quantity").value(10));

        verify(inventoryService).increaseProductQuantity("prod1", "Red", 5);
    }

    

    @Test
    void deleteInventoriesByProductId_Success() throws Exception {
        doNothing().when(inventoryService).deleteAllByProductId("prod1");

        mockMvc.perform(withAdminRole(delete("/api/inventory/delete/prod1")
                .contentType(MediaType.APPLICATION_JSON)))
                .andExpect(status().isNoContent());

        verify(inventoryService).deleteAllByProductId("prod1");
    }

    @Test
    void deleteInventory_Success() throws Exception {
        doNothing().when(inventoryService).deleteInventory("prod1", "Red");

        mockMvc.perform(withAdminRole(delete("/api/inventory/delete")
                .param("productId", "prod1")
                .param("color", "Red")
                .contentType(MediaType.APPLICATION_JSON)))
                .andExpect(status().isNoContent());

        verify(inventoryService).deleteInventory("prod1", "Red");
    }

}