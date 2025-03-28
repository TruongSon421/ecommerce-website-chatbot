package com.eazybytes.dto.wiredEarphone;

import com.eazybytes.dto.InventoryDto;
import com.eazybytes.dto.product.ProductResponse;
import com.eazybytes.model.WiredEarphone;
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
public class WiredEarphoneResponse extends ProductResponse {
    private List<String> original_prices = new ArrayList<>();
    private List<String> current_prices = new ArrayList<>();
    private List<String> colors = new ArrayList<>();
    private List<Integer> quantities = new ArrayList<>();
    private List<String> productNames = new ArrayList<>();

    public static WiredEarphoneResponse fromWiredEarphone(WiredEarphone wiredEarphone, List<InventoryDto> inventoryDtos) {
        WiredEarphoneResponse response = new WiredEarphoneResponse();

        // Thiết lập các trường cơ bản
        response.setProductId(wiredEarphone.getProductId());
        response.setProductName(wiredEarphone.getProductName());
        response.setDescription(wiredEarphone.getDescription());
        response.setBrand(wiredEarphone.getBrand());

        response.setImages(wiredEarphone.getImages());
        response.setType(wiredEarphone.getType());
        response.setWarrantyPeriod(wiredEarphone.getWarrantyPeriod());
        response.setProductReviews(wiredEarphone.getProductReviews());
        response.setPromotions(wiredEarphone.getPromotions());
        response.setRelease(wiredEarphone.getRelease());

        // Thiết lập danh sách màu sắc, giá và số lượng
        List<String> originalPrices = new ArrayList<>();
        List<String> currentPrices = new ArrayList<>();
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
        addSpecification(specs, "Tương thích", wiredEarphone.getCompatibility());
        addSpecification(specs, "Jack cắm", wiredEarphone.getAudioJack());
        addSpecification(specs, "Độ dài dây", wiredEarphone.getCableLength());
        addSpecification(specs, "Tiện ích", wiredEarphone.getFeatures());
        addSpecification(specs, "Kết nối cùng lúc", wiredEarphone.getSimultaneousConnections());
        addSpecification(specs, "Điều khiển", wiredEarphone.getControlType());
        addSpecification(specs, "Phím điều khiển", wiredEarphone.getControlButtons());
        addSpecification(specs, "Khối lượng", wiredEarphone.getWeight());
        addSpecification(specs, "Thương hiệu của", wiredEarphone.getBrandOrigin());
        addSpecification(specs, "Sản xuất tại", wiredEarphone.getManufactured());


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

