package com.eazybytes.dto.phone;

import com.eazybytes.dto.InventoryDto;
import com.eazybytes.dto.product.ProductResponse;
import com.eazybytes.model.Phone;
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
public class PhoneResponse extends ProductResponse {
    private List<String> original_prices = new ArrayList<>();
    private List<String> current_prices = new ArrayList<>();
    private List<String> colors = new ArrayList<>();
    private List<Integer> quantities = new ArrayList<>();
    private List<String> productNames = new ArrayList<>();

    public static PhoneResponse fromPhone(Phone phone, List<InventoryDto> inventoryDtos) {
        PhoneResponse response = new PhoneResponse();

        // Thiết lập các trường cơ bản
        response.setProductId(phone.getProductId());
        response.setProductName(phone.getProductName());
        response.setDescription(phone.getDescription());
        response.setBrand(phone.getBrand());

        response.setImages(phone.getImages());
        response.setType(phone.getType());
        response.setWarrantyPeriod(phone.getWarrantyPeriod());
        response.setProductReviews(phone.getProductReviews());
        response.setPromotions(phone.getPromotions());
        response.setRelease(phone.getRelease());

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

        // Thiết lập các thông số kỹ thuật
        List<Specification> specs = new ArrayList<>();

        // Thêm thông số OS
        addSpecification(specs, "Hệ điều hành", phone.getOs());
        addSpecification(specs, "Vi xử lý", phone.getProcessor());
        addSpecification(specs, "Tốc độ chip", phone.getCpuSpeed());
        addSpecification(specs, "Chip đồ họa", phone.getGpu());
        addSpecification(specs, "RAM", phone.getRam());
        addSpecification(specs, "Dung lượng", phone.getStorage());
        addSpecification(specs, "Dung lượng khả dụng", phone.getAvailableStorage());
        addSpecification(specs, "Danh bạ", phone.getContactLimit());

        // Camera và màn hình
        addSpecification(specs, "Độ phân giải camera sau", phone.getRearCameraResolution());
        addSpecification(specs, "Quay phim camera sau", phone.getRearVideoRecording());
        addSpecification(specs, "Đèn flash", phone.getRearFlash());
        addSpecification(specs, "Tính năng camera sau", phone.getRearCameraFeatures());
        addSpecification(specs, "Độ phân giải camera trước", phone.getFrontCameraResolution());
        addSpecification(specs, "Tính năng camera trước", phone.getFrontCameraFeatures());

        addSpecification(specs, "Công nghệ màn hình", phone.getDisplayTechnology());
        addSpecification(specs, "Độ phân giải màn hình", phone.getDisplayResolution());
        addSpecification(specs, "Màn hình rộng", phone.getScreenSize());
        addSpecification(specs, "Độ sáng tối đa", phone.getMaxBrightness());
        addSpecification(specs, "Mặt kính cảm ứng", phone.getScreenProtection());

        // Pin và sạc
        addSpecification(specs, "Dung lượng pin", phone.getBatteryCapactity());
        addSpecification(specs, "Loại pin", phone.getBatteryType());
        addSpecification(specs, "Hỗ trợ sạc tối đa", phone.getMaxChargingPower());
        addSpecification(specs, "Công nghệ pin", phone.getBatteryFeatures());

        // Tiện ích
        addSpecification(specs, "Bảo mật nâng cao", phone.getSecurityFeatures());
        addSpecification(specs, "Tính năng đặc biệt", phone.getSpecialFeatures());
        addSpecification(specs, "Kháng nước, bụi", phone.getWaterResistance());
        addSpecification(specs, "Ghi âm", phone.getRecording());
        addSpecification(specs, "Xem phim", phone.getVideo());
        addSpecification(specs, "Nghe nhạc", phone.getAudio());

        // Kết nối
        addSpecification(specs, "Mạng di động", phone.getMobileNetwork());
        addSpecification(specs, "SIM", phone.getSimType());
        addSpecification(specs, "WiFi", phone.getWifi());
        addSpecification(specs, "GPS", phone.getGps());
        addSpecification(specs, "Bluetooth", phone.getBluetooth());
        addSpecification(specs, "Cổng sạc", phone.getChargingPort());
        addSpecification(specs, "Jack tai nghe", phone.getHeadphoneJack());
        addSpecification(specs, "Kết nối khác", phone.getOtherConnectivity());

        // Thiết kế và trọng lượng
        addSpecification(specs, "Kiểu thiết kế", phone.getDesignType());
        addSpecification(specs, "Chất liệu", phone.getMaterials());
        addSpecification(specs, "Kích thước, khối lượng", phone.getSizeWeight());

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