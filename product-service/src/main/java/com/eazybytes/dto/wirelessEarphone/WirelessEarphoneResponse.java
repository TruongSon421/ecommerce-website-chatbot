package com.eazybytes.dto.wirelessEarphone;

import com.eazybytes.dto.InventoryDto;
import com.eazybytes.dto.product.ProductResponse;
import com.eazybytes.model.WirelessEarphone;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)

public class WirelessEarphoneResponse extends ProductResponse {
    private List<Integer> original_prices = new ArrayList<>();
    private List<Integer> current_prices = new ArrayList<>();
    private List<String> colors = new ArrayList<>();
    private List<Integer> quantities = new ArrayList<>();
    private List<String> productNames = new ArrayList<>();

    public static WirelessEarphoneResponse fromWirelessEarphone(WirelessEarphone wirelessEarphone, List<InventoryDto> inventoryDtos) {
        WirelessEarphoneResponse response = new WirelessEarphoneResponse();

        // Thiết lập các trường cơ bản
        response.setProductId(wirelessEarphone.getProductId());
        response.setProductName(wirelessEarphone.getProductName());
        response.setDescription(wirelessEarphone.getDescription());
        response.setBrand(wirelessEarphone.getBrand());

        response.setImages(wirelessEarphone.getImages());
        response.setType(wirelessEarphone.getType());
        response.setWarrantyPeriod(wirelessEarphone.getWarrantyPeriod());
        response.setProductReviews(wirelessEarphone.getProductReviews());
        response.setPromotions(wirelessEarphone.getPromotions());
        response.setRelease(wirelessEarphone.getRelease());

        // Thiết lập danh sách màu sắc, giá và số lượng
        List<Integer> originalPrices = new ArrayList<>();
        List<Integer> currentPrices = new ArrayList<>();
        List<Integer> quantities = new ArrayList<>();
        List<String> productNames = new ArrayList<>();
        List<String> colors = new ArrayList<>();

        for (InventoryDto inventoryDto : inventoryDtos) {
            originalPrices.add(inventoryDto.getOriginalPrice());
            currentPrices.add(inventoryDto.getCurrentPrice());
            quantities.add(inventoryDto.getQuantity());
            productNames.add(inventoryDto.getProductName());
            colors.add(inventoryDto.getColor());
        }

        response.setOriginal_prices(originalPrices);
        response.setCurrent_prices(currentPrices);
        response.setQuantities(quantities);
        response.setProductNames(productNames);
        response.setColors(colors);

        List<Specification> specs = new ArrayList<>();
        addSpecification(specs, "Thời lượng pin tai nghe", wirelessEarphone.getBatteryLife());
        addSpecification(specs, "Thời lượng pin hộp sạc", wirelessEarphone.getChargingCaseBatteryLife());
        addSpecification(specs, "Cổng sạc", wirelessEarphone.getChargingPort());
        addSpecification(specs, "Công nghệ âm thanh", wirelessEarphone.getAudioTechnology());
        addSpecification(specs, "Tương thích", wirelessEarphone.getCompatibility());
        addSpecification(specs, "Ứng dụng kết nối", wirelessEarphone.getConnectionApp());
        addSpecification(specs, "Tiện ích", wirelessEarphone.getFeatures());
        addSpecification(specs, "Kết nối cùng lúc", wirelessEarphone.getSimultaneousConnections());
        addSpecification(specs, "Công nghệ kết nối", wirelessEarphone.getConnectionTechnology());
        addSpecification(specs, "Điều khiển", wirelessEarphone.getControlType());
        addSpecification(specs, "Phím điều khiển", wirelessEarphone.getControlButtons());
        addSpecification(specs, "Kích thước", wirelessEarphone.getSize());
        addSpecification(specs, "Khối lượng", wirelessEarphone.getWeight());
        addSpecification(specs, "Thương hiệu của", wirelessEarphone.getBrandOrigin());
        addSpecification(specs, "Sản xuất tại", wirelessEarphone.getManufactured());


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
