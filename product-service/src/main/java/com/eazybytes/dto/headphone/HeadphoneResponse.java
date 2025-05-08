package com.eazybytes.dto.headphone;

import com.eazybytes.dto.InventoryDto;
import com.eazybytes.dto.product.ProductResponse;
import com.eazybytes.model.Headphone;
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

public class HeadphoneResponse extends ProductResponse {
    private List<Integer> original_prices = new ArrayList<>();
    private List<Integer> current_prices = new ArrayList<>();
    private List<String> colors = new ArrayList<>();
    private List<Integer> quantities = new ArrayList<>();
    private List<String> productNames = new ArrayList<>();

    public static HeadphoneResponse fromHeadphone(Headphone headphone, List<InventoryDto> inventoryDtos) {
        HeadphoneResponse response = new HeadphoneResponse();

        // Thiết lập các trường cơ bản
        response.setProductId(headphone.getProductId());
        response.setProductName(headphone.getProductName());
        response.setDescription(headphone.getDescription());
        response.setBrand(headphone.getBrand());

        response.setImages(headphone.getImages());
        response.setType(headphone.getType());
        response.setWarrantyPeriod(headphone.getWarrantyPeriod());
        response.setProductReviews(headphone.getProductReviews());
        response.setPromotions(headphone.getPromotions());
        response.setRelease(headphone.getRelease());

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
        addSpecification(specs, "Thời lượng pin tai nghe", headphone.getBatteryLife());
        addSpecification(specs, "Cổng sạc", headphone.getChargingPort());
        addSpecification(specs, "Tương thích", headphone.getCompatibility());
        addSpecification(specs, "Jack cắm", headphone.getAudioJack());
        addSpecification(specs, "Độ dài dây", headphone.getCableLength());
        addSpecification(specs, "Tiện ích", headphone.getFeatures());
        addSpecification(specs, "Kết nối cùng lúc", headphone.getSimultaneousConnections());
        addSpecification(specs, "Công nghệ kết nối", headphone.getConnectionTechnology());
        addSpecification(specs, "Điều khiển", headphone.getControlType());
        addSpecification(specs, "Phím điều khiển", headphone.getControlButtons());
        addSpecification(specs, "Kích thước", headphone.getSize());
        addSpecification(specs, "Khối lượng", headphone.getWeight());
        addSpecification(specs, "Thương hiệu của", headphone.getBrandOrigin());
        addSpecification(specs, "Sản xuất tại", headphone.getManufactured());


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
