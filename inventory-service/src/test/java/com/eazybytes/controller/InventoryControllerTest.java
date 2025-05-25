package com.eazybytes.controller;

import com.eazybytes.dto.InventoryDto;
import com.eazybytes.dto.VariantDto;
import com.eazybytes.exception.InventoryAlreadyExistsException;
import com.eazybytes.model.ProductInventory;
import com.eazybytes.service.GroupService;
import com.eazybytes.service.InventoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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

    @Autowired
    private ObjectMapper objectMapper;

    private InventoryDto inventoryDto;
    private ProductInventory productInventory;
    private VariantDto variantDto;

    @BeforeEach
    void setUp() {
        inventoryDto = InventoryDto.builder()
                .inventoryId(1)
                .productId("prod1")
                .productName("Test Product")
                .color("Red")
                .quantity(10)
                .originalPrice(100)
                .currentPrice(90)
                .build();

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
    @WithMockUser(roles = "ADMIN")
    void createInventory_Success() throws Exception {
        when(inventoryService.createInventory(any(InventoryDto.class))).thenReturn(productInventory);

        mockMvc.perform(post("/api/inventory/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inventoryDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productId").value("prod1"))
                .andExpect(jsonPath("$.color").value("Red"));

        verify(inventoryService).createInventory(any(InventoryDto.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createInventory_Conflict() throws Exception {
        when(inventoryService.createInventory(any(InventoryDto.class)))
                .thenThrow(new InventoryAlreadyExistsException("Inventory already exists"));

        mockMvc.perform(post("/api/inventory/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inventoryDto)))
                .andExpect(status().isConflict());

        verify(inventoryService).createInventory(any(InventoryDto.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateInventory_Success() throws Exception {
        when(inventoryService.updateInventory(any(InventoryDto.class))).thenReturn(productInventory);

        mockMvc.perform(put("/api/inventory/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inventoryDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value("prod1"))
                .andExpect(jsonPath("$.color").value("Red"));

        verify(inventoryService).updateInventory(any(InventoryDto.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void decreaseProductQuantity_Success() throws Exception {
        when(inventoryService.decreaseProductQuantity("prod1", "Red", 5)).thenReturn(productInventory);

        mockMvc.perform(post("/api/inventory/decrease")
                        .param("productId", "prod1")
                        .param("color", "Red")
                        .param("quantity", "5")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value("prod1"))
                .andExpect(jsonPath("$.quantity").value(10));

        verify(inventoryService).decreaseProductQuantity("prod1", "Red", 5);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void increaseProductQuantity_Success() throws Exception {
        when(inventoryService.increaseProductQuantity("prod1", "Red", 5)).thenReturn(productInventory);

        mockMvc.perform(post("/api/inventory/increase")
                        .param("productId", "prod1")
                        .param("color", "Red")
                        .param("quantity", "5")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value("prod1"))
                .andExpect(jsonPath("$.quantity").value(10));

        verify(inventoryService).increaseProductQuantity("prod1", "Red", 5);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteInventoriesByProductId_Success() throws Exception {
        doNothing().when(inventoryService).deleteAllByProductId("prod1");

        mockMvc.perform(delete("/api/inventory/delete/prod1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(inventoryService).deleteAllByProductId("prod1");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteInventory_Success() throws Exception {
        doNothing().when(inventoryService).deleteInventory("prod1", "Red");

        mockMvc.perform(delete("/api/inventory/delete")
                        .param("productId", "prod1")
                        .param("color", "Red")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(inventoryService).deleteInventory("prod1", "Red");
    }

    @Test
    void createInventory_Unauthorized() throws Exception {
        mockMvc.perform(post("/api/inventory/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inventoryDto)))
                .andExpect(status().isForbidden());
    }
}