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
    private List<Integer> original_prices = new ArrayList<>();
    private List<Integer> current_prices = new ArrayList<>();
    private List<String> colors = new ArrayList<>();
    private List<Integer> quantities = new ArrayList<>();
    private List<String> productNames = new ArrayList<>();

    public static PhoneResponse fromPhone(Phone phone, List<InventoryDto> inventoryDtos) {
        PhoneResponse response = new PhoneResponse();

        // Set basic fields
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

        // Set lists for prices, quantities, and colors
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

        // Set specifications with original variable names
        List<Specification> specs = new ArrayList<>();

        // Add OS specification
        addSpecification(specs, "os", "Hệ điều hành", phone.getOs());
        addSpecification(specs, "processor", "Vi xử lý", phone.getProcessor());
        addSpecification(specs, "cpuSpeed", "Tốc độ chip", phone.getCpuSpeed());
        addSpecification(specs, "gpu", "Chip đồ họa", phone.getGpu());
        addSpecification(specs, "ram", "RAM", phone.getRam());
        addSpecification(specs, "storage", "Dung lượng", phone.getStorage());
        addSpecification(specs, "availableStorage", "Dung lượng khả dụng", phone.getAvailableStorage());
        addSpecification(specs, "contactLimit", "Danh bạ", phone.getContactLimit());

        // Camera and display
        addSpecification(specs, "rearCameraResolution", "Độ phân giải camera sau", phone.getRearCameraResolution());
        addSpecification(specs, "rearVideoRecording", "Quay phim camera sau", phone.getRearVideoRecording());
        addSpecification(specs, "rearFlash", "Đèn flash", phone.getRearFlash());
        addSpecification(specs, "rearCameraFeatures", "Tính năng camera sau", phone.getRearCameraFeatures());
        addSpecification(specs, "frontCameraResolution", "Độ phân giải camera trước", phone.getFrontCameraResolution());
        addSpecification(specs, "frontCameraFeatures", "Tính năng camera trước", phone.getFrontCameraFeatures());

        addSpecification(specs, "displayTechnology", "Công nghệ màn hình", phone.getDisplayTechnology());
        addSpecification(specs, "displayResolution", "Độ phân giải màn hình", phone.getDisplayResolution());
        addSpecification(specs, "screenSize", "Màn hình rộng", phone.getScreenSize());
        addSpecification(specs, "maxBrightness", "Độ sáng tối đa", phone.getMaxBrightness());
        addSpecification(specs, "screenProtection", "Mặt kính cảm ứng", phone.getScreenProtection());

        // Battery and charging
        addSpecification(specs, "batteryCapacity", "Dung lượng pin", phone.getBatteryCapacity());
        addSpecification(specs, "batteryType", "Loại pin", phone.getBatteryType());
        addSpecification(specs, "maxChargingPower", "Hỗ trợ sạc tối đa", phone.getMaxChargingPower());
        addSpecification(specs, "batteryFeatures", "Công nghệ pin", phone.getBatteryFeatures());

        // Features
        addSpecification(specs, "securityFeatures", "Bảo mật nâng cao", phone.getSecurityFeatures());
        addSpecification(specs, "specialFeatures", "Tính năng đặc biệt", phone.getSpecialFeatures());
        addSpecification(specs, "waterResistance", "Kháng nước, bụi", phone.getWaterResistance());
        addSpecification(specs, "recording", "Ghi âm", phone.getRecording());
        addSpecification(specs, "video", "Xem phim", phone.getVideo());
        addSpecification(specs, "audio", "Nghe nhạc", phone.getAudio());

        // Connectivity
        addSpecification(specs, "mobileNetwork", "Mạng di động", phone.getMobileNetwork());
        addSpecification(specs, "simType", "SIM", phone.getSimType());
        addSpecification(specs, "wifi", "WiFi", phone.getWifi());
        addSpecification(specs, "gps", "GPS", phone.getGps());
        addSpecification(specs, "bluetooth", "Bluetooth", phone.getBluetooth());
        addSpecification(specs, "chargingPort", "Cổng sạc", phone.getChargingPort());
        addSpecification(specs, "headphoneJack", "Jack tai nghe", phone.getHeadphoneJack());
        addSpecification(specs, "otherConnectivity", "Kết nối khác", phone.getOtherConnectivity());

        // Design and weight
        addSpecification(specs, "designType", "Kiểu thiết kế", phone.getDesignType());
        addSpecification(specs, "materials", "Chất liệu", phone.getMaterials());
        addSpecification(specs, "sizeWeight", "Kích thước, khối lượng", phone.getSizeWeight());

        response.setSpecifications(specs);

        return response;
    }

    private static void addSpecification(List<Specification> specs, String ori_name, String name, Object value) {
        if (value != null) {
            specs.add(Specification.builder()
                    .ori_name(ori_name)
                    .name(name)
                    .value(value)
                    .build());
        }
    }
}