package com.eazybytes.dto.backupCharger;

import com.eazybytes.dto.InventoryDto;
import com.eazybytes.dto.product.ProductResponse;
import com.eazybytes.model.BackupCharger;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class BackupChargerResponse extends ProductResponse {
    // Các trường bổ sung, không trùng với ProductResponse
    private List<String> original_prices = new ArrayList<>();
    private List<String> current_prices = new ArrayList<>();
    private List<String> colors = new ArrayList<>();
    private List<Integer> quantities = new ArrayList<>();
    private List<String> productNames = new ArrayList<>();

    public static BackupChargerResponse fromBackupCharger(BackupCharger backupCharger, List<InventoryDto> inventoryDtos) {
        BackupChargerResponse response = new BackupChargerResponse();

        response.setProductId(backupCharger.getProductId());
        response.setProductName(backupCharger.getProductName());
        response.setDescription(backupCharger.getDescription());
        response.setBrand(backupCharger.getBrand());
        response.setImages(backupCharger.getImages());
        response.setType(backupCharger.getType());
        response.setWarrantyPeriod(backupCharger.getWarrantyPeriod());
        response.setProductReviews(backupCharger.getProductReviews());
        response.setPromotions(backupCharger.getPromotions());
        response.setRelease(backupCharger.getRelease());

        List<String> originalPrices = new ArrayList<>();
        List<String> currentPrices = new ArrayList<>();
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

        addSpecification(specs, "Dung lượng pin", backupCharger.getBatteryCapactity());
        addSpecification(specs, "Hiệu suất sạc", backupCharger.getChargingEfficiency());
        addSpecification(specs, "Lõi pin", backupCharger.getBatteryCellType());
        addSpecification(specs, "Công nghệ/ Tiện ích", backupCharger.getTechnologyFeatures());
        addSpecification(specs, "Thời gian sạc đầy pin", backupCharger.getChargingTime());
        addSpecification(specs, "Nguồn ra", backupCharger.getOutput());
        addSpecification(specs, "Nguồn vào", backupCharger.getInput());
        addSpecification(specs, "Kích thước", backupCharger.getSize());
        addSpecification(specs, "Khối lượng", backupCharger.getWeight());
        addSpecification(specs, "Thương hiệu của", backupCharger.getBrandOrigin());
        addSpecification(specs, "Sản xuất tại", backupCharger.getManufactured());

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