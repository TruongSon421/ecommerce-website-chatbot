package com.eazybytes.dto.laptop;

import com.eazybytes.dto.InventoryDto;
import com.eazybytes.dto.product.ProductResponse;
import com.eazybytes.model.Laptop;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class LaptopResponse extends ProductResponse {
    // Các trường bổ sung, không trùng với ProductResponse
    private List<String> original_prices = new ArrayList<>();
    private List<String> current_prices = new ArrayList<>();
    private List<String> colors = new ArrayList<>();
    private List<Integer> quantities = new ArrayList<>();
    private List<String> productNames = new ArrayList<>();

    public static LaptopResponse fromLaptop(Laptop laptop, List<InventoryDto> inventoryDtos) {
        LaptopResponse response = new LaptopResponse();

        response.setProductId(laptop.getProductId());
        response.setProductName(laptop.getProductName());
        response.setDescription(laptop.getDescription());
        response.setBrand(laptop.getBrand());
        response.setImages(laptop.getImages());
        response.setType(laptop.getType());
        response.setWarrantyPeriod(laptop.getWarrantyPeriod());
        response.setProductReviews(laptop.getProductReviews());
        response.setPromotions(laptop.getPromotions());
        response.setRelease(laptop.getRelease());

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

        // Bộ xử lý
        addSpecification(specs, "Công nghệ CPU", laptop.getProcessorModel());
        addSpecification(specs, "Số nhân", laptop.getCoreCount());
        addSpecification(specs, "Số luồng", laptop.getThreadCount());
        addSpecification(specs, "Tốc độ CPU", laptop.getCpuSpeed());
        addSpecification(specs, "Tốc độ tối đa", laptop.getMaxCpuSpeed());

        // Bộ nhớ RAM, ổ cứng
        addSpecification(specs, "RAM", laptop.getRam());
        addSpecification(specs, "Loại RAM", laptop.getRamType());
        addSpecification(specs, "Tốc độ Bus RAM", laptop.getRamBusSpeed());
        addSpecification(specs, "Hỗ trợ RAM tối đa", laptop.getMaxRam());
        addSpecification(specs, "Ổ cứng", laptop.getStorage());

        // Màn hình
        addSpecification(specs, "Kích thước màn hình", laptop.getScreenSize());
        addSpecification(specs, "Độ phân giải", laptop.getResolution());
        addSpecification(specs, "Tần số quét", laptop.getRefreshRate());
        addSpecification(specs, "Độ phủ màu", laptop.getColorGamut());
        addSpecification(specs, "Công nghệ màn hình", laptop.getDisplayTechnology());

        // Đồ họa và âm thanh
        addSpecification(specs, "Card màn hình", laptop.getGraphicCard());
        addSpecification(specs, "Công nghệ âm thanh", laptop.getAudioTechnology());
        addSpecification(specs, "Cổng giao tiếp", laptop.getPorts());
        addSpecification(specs, "Kết nối không dây", laptop.getWirelessConnectivity());
        addSpecification(specs, "Webcam", laptop.getWebcam());
        addSpecification(specs, "Tính năng khác", laptop.getOtherFeatures());
        addSpecification(specs, "Đèn bàn phím", laptop.getKeyboardBacklight());

        // Kích thước - khối lượng - pin
        addSpecification(specs, "Kích thước", laptop.getSize());
        addSpecification(specs, "Chất liệu", laptop.getMaterial());
        addSpecification(specs, "Pin", laptop.getBattery());
        addSpecification(specs, "Hệ điều hành", laptop.getOs());

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