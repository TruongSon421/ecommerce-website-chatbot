package com.eazybytes.dto.cableChargerHub;

import com.eazybytes.dto.InventoryDto;
import com.eazybytes.dto.product.ProductResponse;
import com.eazybytes.model.CableChargerHub;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class CableChargerHubResponse extends ProductResponse {
    // Các trường bổ sung, không trùng với ProductResponse
    private List<Integer> original_prices = new ArrayList<>();
    private List<Integer> current_prices = new ArrayList<>();
    private List<String> colors = new ArrayList<>();
    private List<Integer> quantities = new ArrayList<>();
    private List<String> productNames = new ArrayList<>();

    public static CableChargerHubResponse fromCableChargerHub(CableChargerHub cableChargerHub, List<InventoryDto> inventoryDtos) {
        CableChargerHubResponse response = new CableChargerHubResponse();

        response.setProductId(cableChargerHub.getProductId());
        response.setProductName(cableChargerHub.getProductName());
        response.setDescription(cableChargerHub.getDescription());
        response.setBrand(cableChargerHub.getBrand());
        response.setImages(cableChargerHub.getImages());
        response.setType(cableChargerHub.getType());
        response.setWarrantyPeriod(cableChargerHub.getWarrantyPeriod());
        response.setProductReviews(cableChargerHub.getProductReviews());
        response.setPromotions(cableChargerHub.getPromotions());
        response.setRelease(cableChargerHub.getRelease());

        List<Integer> originalPrices = new ArrayList<>();
        List<Integer> currentPrices = new ArrayList<>();
        List<Integer> quantities = new ArrayList<>();
        List<String> productNames = new ArrayList<>();

        for (InventoryDto inventoryDto : inventoryDtos) {
            originalPrices.add(inventoryDto.getOriginalPrice());
            currentPrices.add(inventoryDto.getCurrentPrice());
            quantities.add(inventoryDto.getQuantity());
            productNames.add(inventoryDto.getProductName());
        }

        response.setOriginal_prices(originalPrices);
        response.setCurrent_prices(currentPrices);
        response.setQuantities(quantities);
        response.setProductNames(productNames);

        List<Specification> specs = new ArrayList<>();

        addSpecification(specs, "Model", cableChargerHub.getModel());
        addSpecification(specs, "Chức năng", cableChargerHub.getFeatures());
        addSpecification(specs, "Đầu vào", cableChargerHub.getInput());
        addSpecification(specs, "Đầu ra", cableChargerHub.getOutput());
        addSpecification(specs, "Độ dài dây", cableChargerHub.getLength());
        addSpecification(specs, "Công suất tối đa", cableChargerHub.getMaximumPower());
        addSpecification(specs, "Sản xuất tại", cableChargerHub.getManufactured());
        addSpecification(specs, "Thương hiệu của", cableChargerHub.getBrandOrigin());
        addSpecification(specs, "Công nghệ/Tiện ích", cableChargerHub.getTechnologyFeatures());
        addSpecification(specs, "Dòng sạc tối đa", cableChargerHub.getMaximumCharging());
        addSpecification(specs, "Jack kết nối", cableChargerHub.getConnectionJack());

        response.setSpecifications(specs);

        return response;
    }

    private static void addSpecification(List<Specification> specs, String name, Object value) {
        if (value != null) {
            specs.add(Specification.builder()
                    .name(name)
                    .value(value)
                    .build());
        }
    }
}