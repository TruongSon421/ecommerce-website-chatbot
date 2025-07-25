package com.eazybytes.service;

import com.eazybytes.client.InventoryClient;
import com.eazybytes.dto.*;
import com.eazybytes.dto.backupCharger.BackupChargerRequest;
import com.eazybytes.dto.backupCharger.BackupChargerResponse;
import com.eazybytes.dto.cableChargerHub.CableChargerHubRequest;
import com.eazybytes.dto.cableChargerHub.CableChargerHubResponse;
import com.eazybytes.dto.headphone.HeadphoneRequest;
import com.eazybytes.dto.headphone.HeadphoneResponse;
import com.eazybytes.dto.laptop.LaptopRequest;
import com.eazybytes.dto.laptop.LaptopResponse;
import com.eazybytes.dto.phone.PhoneRequest;
import com.eazybytes.dto.phone.PhoneResponse;
import com.eazybytes.dto.product.ProductRequest;
import com.eazybytes.dto.product.ProductResponse;
import com.eazybytes.dto.wiredEarphone.WiredEarphoneRequest;
import com.eazybytes.dto.wiredEarphone.WiredEarphoneResponse;
import com.eazybytes.dto.wirelessEarphone.WirelessEarphoneRequest;
import com.eazybytes.dto.wirelessEarphone.WirelessEarphoneResponse;
import com.eazybytes.model.*;
import com.eazybytes.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {
    private final ProductRepository productRepository;
    private final InventoryClient inventoryClient;

    // Product type constants
    private static final String PHONE_TYPE = "phone";
    private static final String LAPTOP_TYPE = "laptop";
    private static final String BACKUP_CHARGER_TYPE = "backup_charger";
    private static final String CABLE_CHARGER_HUB_TYPE = "cable_charger_hub";
    private static final String WIRELESS_EARPHONE_TYPE = "wireless_earphone";
    private static final String WIRED_EARPHONE_TYPE = "wired_earphone";
    private static final String HEADPHONE_TYPE = "headphone";

    public ProductResponse getProductById(String type, String id) {
        BaseProduct product = findProductById(id);
        if (!product.getType().equals(type)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid product type: " + type);
        }
        
        List<InventoryDto> inventoryDtos;
        try {
            inventoryDtos = inventoryClient.getProductColorVariants(id).getBody();
            if (inventoryDtos == null) {
                inventoryDtos = new ArrayList<>();
            }
        } catch (Exception e) {
            log.warn("Failed to get inventory data for product {}: {}. Using empty inventory.", id, e.getMessage());
            inventoryDtos = new ArrayList<>();
        }

        return mapToProductResponse(type, product, inventoryDtos);
    }

    private BaseProduct findProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found with id: " + id));
    }



    private String determineProductType(ProductRequest request) {
        if (request instanceof PhoneRequest) return PHONE_TYPE;
        if (request instanceof LaptopRequest) return LAPTOP_TYPE;
        if (request instanceof BackupChargerRequest) return BACKUP_CHARGER_TYPE;
        if (request instanceof CableChargerHubRequest) return CABLE_CHARGER_HUB_TYPE;
        if (request instanceof WirelessEarphoneRequest) return WIRELESS_EARPHONE_TYPE;
        if (request instanceof WiredEarphoneRequest) return WIRED_EARPHONE_TYPE;
        if (request instanceof HeadphoneRequest) return HEADPHONE_TYPE;

        throw new IllegalArgumentException("Unknown product request type");
    }

    @Transactional
    public ProductResponse createProduct(ProductWithInventoryRequest request) {
        ProductRequest productRequest = request.getProductRequest();
        List<InventoryDto> inventoryRequests = request.getInventoryRequests();

        BaseProduct product;
        try {
            // Xác định loại sản phẩm
            if (productRequest instanceof PhoneRequest) {
                product = createPhoneFromRequest((PhoneRequest) productRequest);
            } else if (productRequest instanceof LaptopRequest) {
                product = createLaptopFromRequest((LaptopRequest) productRequest);
            } else if (productRequest instanceof BackupChargerRequest) {
                product = createBackupChargerFromRequest((BackupChargerRequest) productRequest);
            } else if (productRequest instanceof CableChargerHubRequest) {
                product = createCableChargerHubFromRequest((CableChargerHubRequest) productRequest);
            } else if (productRequest instanceof WirelessEarphoneRequest) {
                product = createWirelessEarphoneFromRequest((WirelessEarphoneRequest) productRequest);
            } else if (productRequest instanceof WiredEarphoneRequest) {
                product = createWiredEarphoneFromRequest((WiredEarphoneRequest) productRequest);
            } else if (productRequest instanceof HeadphoneRequest) {
                product = createHeadphoneFromRequest((HeadphoneRequest) productRequest);
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid product type");
            }

            // Lưu product vào database
            BaseProduct savedProduct = productRepository.save(product);

            // Tạo inventory và xử lý rollback nếu có lỗi
            List<InventoryDto> inventoryDtos;
            try {
                inventoryDtos = createInventories(savedProduct, inventoryRequests);
            } catch (Exception e) {
                // Rollback product đã lưu trong database
                productRepository.delete(savedProduct);
                throw e; // Ném lại exception để thông báo lỗi
            }

            // Trả về response
            String productType = determineProductType(productRequest);
            return mapToProductResponse(productType, savedProduct, inventoryDtos);

        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to create product: " + e.getMessage(),
                    e
            );
        }
    }

    private void setBaseProductFields(BaseProduct product, ProductRequest request) {
        product.setProductName(request.getProductName());
        product.setDescription(request.getDescription());
        product.setBrand(request.getBrand());
        product.setImages(request.getImages());
        product.setWarrantyPeriod(request.getWarrantyPeriod());
        product.setProductReviews(request.getProductReviews());
        product.setPromotions(request.getPromotions());
        product.setRelease(request.getRelease());
        product.setType(request.getType());
    }


    private List<InventoryDto> createInventories(BaseProduct product, List<InventoryDto> requests) {
        List<InventoryDto> inventoryDtos = new ArrayList<>();
        List<InventoryDto> createdInventories = new ArrayList<>(); // Lưu các inventory đã tạo để rollback nếu cần

        try {
            for (InventoryDto request : requests) {
                InventoryDto dto = new InventoryDto();
                dto.setProductName(product.getProductName());
                dto.setProductId(product.getProductId());
                dto.setCurrentPrice(request.getCurrentPrice());
                dto.setOriginalPrice(request.getOriginalPrice());
                dto.setQuantity(request.getQuantity());
                dto.setColor(request.getColor());

                // Gọi external API để tạo inventory
                inventoryClient.createInventory(dto); // Giả sử API trả về thành công nếu không có exception
                createdInventories.add(dto); // Lưu lại để rollback nếu cần
                inventoryDtos.add(dto); // Thêm vào danh sách trả về
            }
            return inventoryDtos;
        } catch (Exception e) {
            // Rollback các inventory đã tạo trên external API
            rollbackInventories(createdInventories);
            throw new RuntimeException("Failed to create inventories: " + e.getMessage(), e);
        }
    }

    private void rollbackInventories(List<InventoryDto> createdInventories) {
        for (InventoryDto inventory : createdInventories) {
            try {
                // Giả sử inventoryClient có phương thức deleteInventory để xóa inventory
                inventoryClient.deleteInventory(inventory.getProductId(), inventory.getColor());
            } catch (Exception rollbackException) {
                // Log lỗi rollback nếu cần, nhưng không ném exception để tránh che lấp lỗi chính
                System.err.println("Failed to rollback inventory: " + rollbackException.getMessage());
            }
        }
    }

    public BaseProduct updateProduct(String id, ProductRequest productRequest) {
        BaseProduct product = findProductById(id);
        String productType = product.getType();

        // Update product fields based on type
        switch (productType) {
            case PHONE_TYPE:
                updatePhoneFields((Phone) product, (PhoneRequest) productRequest);
                break;
            case LAPTOP_TYPE:
                updateLaptopFields((Laptop) product, (LaptopRequest) productRequest);
                break;
            case BACKUP_CHARGER_TYPE:
                updateBackupChargerFields((BackupCharger) product, (BackupChargerRequest) productRequest);
                break;
            case CABLE_CHARGER_HUB_TYPE:
                updateCableChargerHubFields((CableChargerHub) product, (CableChargerHubRequest) productRequest);
                break;
            case WIRELESS_EARPHONE_TYPE:
                updateWirelessEarphoneFields((WirelessEarphone) product, (WirelessEarphoneRequest) productRequest);
                break;
            case WIRED_EARPHONE_TYPE:
                updateWiredEarphoneFields((WiredEarphone) product, (WiredEarphoneRequest) productRequest);
                break;
            case HEADPHONE_TYPE:
                updateHeadphoneFields((Headphone) product, (HeadphoneRequest) productRequest);
                break;

            default:
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid product type: " + productType);
        }

        BaseProduct updatedProduct = productRepository.save(product);

        return updatedProduct;
    }



    private void updateBaseProductFields(BaseProduct product, ProductRequest request) {
        if (request.getProductName() != null) product.setProductName(request.getProductName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getBrand() != null) product.setBrand(request.getBrand());
        if (request.getImages() != null) product.setImages(request.getImages());
        if (request.getWarrantyPeriod() != null) product.setWarrantyPeriod(request.getWarrantyPeriod());
        if (request.getProductReviews() != null) product.setProductReviews(request.getProductReviews());
        if (request.getPromotions() != null) product.setPromotions(request.getPromotions());
        if (request.getRelease() != null) product.setRelease(request.getRelease());
    }

    public void deleteProduct(String id) {
        try {
            // Step 1: Xóa inventory trước
            try {
                inventoryClient.deleteInventoriesByProductId(id);
                log.info("Successfully deleted inventories for product: {}", id);
            } catch (Exception e) {
                log.warn("Failed to delete inventories for product {}: {}", id, e.getMessage());
                // Continue với product deletion dù inventory deletion failed
            }
            
            // Step 2: Xóa product từ MongoDB
            productRepository.deleteById(id);
            log.info("Successfully deleted product from MongoDB: {}", id);
        } catch (Exception e) {
            log.error("Error deleting product ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to delete product: " + id, e);
        }
    }
    
    public DeleteGroupDto deleteProductGroup(DeleteGroupDto request) {
        Integer groupId = request.getGroupId();
        List<String> productIds = request.getProductIds();
        try {
            
            if (!productIds.isEmpty()) {
                // 2. Xóa tất cả inventories
                inventoryClient.deleteInventoriesByProductIds(productIds);
                log.info("Successfully deleted inventories for group ID: {}", groupId);
                
                // 3. Xóa tất cả products
                productRepository.deleteAllById(productIds);
                log.info("Successfully deleted {} products for group ID: {}", productIds.size(), groupId);
            }
            
            // 4. Xóa tất cả liên kết GroupProduct
            inventoryClient.deleteGroupProductsByGroupId(groupId);
            log.info("Successfully deleted group-product links for group ID: {}", groupId);
            
            // 5. Xóa Group (sẽ được xử lý ở Group Service nếu cần)
            log.info("Successfully completed group deletion process for group ID: {}", groupId);
            
        } catch (Exception e) {
            log.error("Error in deleteProductGroup for group ID {}: {}", groupId, e.getMessage());
            throw new RuntimeException("Failed to delete product group: " + groupId, e);
        }
        return request;
    }

    private ProductResponse mapToProductResponse(String type, BaseProduct product, List<InventoryDto> inventoryDtos) {
        switch (type) {
            case PHONE_TYPE:
                return PhoneResponse.fromPhone((Phone) product, inventoryDtos);
            case LAPTOP_TYPE:
                return LaptopResponse.fromLaptop((Laptop) product, inventoryDtos);
            case BACKUP_CHARGER_TYPE:
                return BackupChargerResponse.fromBackupCharger((BackupCharger) product, inventoryDtos);
            case CABLE_CHARGER_HUB_TYPE:
                return CableChargerHubResponse.fromCableChargerHub((CableChargerHub) product, inventoryDtos);
            case WIRELESS_EARPHONE_TYPE:
                return WirelessEarphoneResponse.fromWirelessEarphone((WirelessEarphone) product, inventoryDtos);
            case WIRED_EARPHONE_TYPE:
                return WiredEarphoneResponse.fromWiredEarphone((WiredEarphone) product, inventoryDtos);
            case HEADPHONE_TYPE:
                return HeadphoneResponse.fromHeadphone((Headphone) product, inventoryDtos);
            default:
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid product type: " + type);
        }
    }

    // Phone methods
    private Phone createPhoneFromRequest(PhoneRequest request) {
        Phone phone = new Phone();

        // Thiết lập các trường cơ bản
        setBaseProductFields(phone, request);

        // Thiết lập các trường riêng của Phone
        phone.setOs(request.getOs());
        phone.setProcessor(request.getProcessor());
        phone.setCpuSpeed(request.getCpuSpeed());
        phone.setGpu(request.getGpu());
        phone.setRam(request.getRam());
        phone.setStorage(request.getStorage());
        phone.setAvailableStorage(request.getAvailableStorage());
        phone.setContactLimit(request.getContactLimit());

        // Camera và màn hình
        phone.setRearCameraResolution(request.getRearCameraResolution());
        phone.setRearVideoRecording(request.getRearVideoRecording());
        phone.setRearFlash(request.getRearFlash());
        phone.setRearCameraFeatures(request.getRearCameraFeatures());
        phone.setFrontCameraResolution(request.getFrontCameraResolution());
        phone.setFrontCameraFeatures(request.getFrontCameraFeatures());
        phone.setDisplayTechnology(request.getDisplayTechnology());
        phone.setDisplayResolution(request.getDisplayResolution());
        phone.setScreenSize(request.getScreenSize());
        phone.setMaxBrightness(request.getMaxBrightness());
        phone.setScreenProtection(request.getScreenProtection());

        // Pin và sạc
        phone.setBatteryCapacity(request.getBatteryCapacity());
        phone.setBatteryType(request.getBatteryType());
        phone.setMaxChargingPower(request.getMaxChargingPower());
        phone.setBatteryFeatures(request.getBatteryFeatures());

        // Tiện ích
        phone.setSecurityFeatures(request.getSecurityFeatures());
        phone.setSpecialFeatures(request.getSpecialFeatures());
        phone.setWaterResistance(request.getWaterResistance());
        phone.setRecording(request.getRecording());
        phone.setVideo(request.getVideo());
        phone.setAudio(request.getAudio());

        // Kết nối
        phone.setMobileNetwork(request.getMobileNetwork());
        phone.setSimType(request.getSimType());
        phone.setWifi(request.getWifi());
        phone.setGps(request.getGps());
        phone.setBluetooth(request.getBluetooth());
        phone.setChargingPort(request.getChargingPort());
        phone.setHeadphoneJack(request.getHeadphoneJack());
        phone.setOtherConnectivity(request.getOtherConnectivity());

        // Thiết kế
        phone.setDesignType(request.getDesignType());
        phone.setMaterials(request.getMaterials());
        phone.setSizeWeight(request.getSizeWeight());

        return phone;
    }

    private void updatePhoneFields(Phone phone, PhoneRequest request) {
        // Update base fields
        updateBaseProductFields(phone, request);

        phone.setOs(request.getOs());
        phone.setProcessor(request.getProcessor());
        phone.setCpuSpeed(request.getCpuSpeed());
        phone.setGpu(request.getGpu());
        phone.setRam(request.getRam());
        phone.setStorage(request.getStorage());
        phone.setAvailableStorage(request.getAvailableStorage());
        phone.setContactLimit(request.getContactLimit());

        // Camera và màn hình
        phone.setRearCameraResolution(request.getRearCameraResolution());
        phone.setRearVideoRecording(request.getRearVideoRecording());
        phone.setRearFlash(request.getRearFlash());
        phone.setRearCameraFeatures(request.getRearCameraFeatures());
        phone.setFrontCameraResolution(request.getFrontCameraResolution());
        phone.setFrontCameraFeatures(request.getFrontCameraFeatures());
        phone.setDisplayTechnology(request.getDisplayTechnology());
        phone.setDisplayResolution(request.getDisplayResolution());
        phone.setScreenSize(request.getScreenSize());
        phone.setMaxBrightness(request.getMaxBrightness());
        phone.setScreenProtection(request.getScreenProtection());

        // Pin và sạc
        phone.setBatteryCapacity(request.getBatteryCapacity());
        phone.setBatteryType(request.getBatteryType());
        phone.setMaxChargingPower(request.getMaxChargingPower());
        phone.setBatteryFeatures(request.getBatteryFeatures());

        // Tiện ích
        phone.setSecurityFeatures(request.getSecurityFeatures());
        phone.setSpecialFeatures(request.getSpecialFeatures());
        phone.setWaterResistance(request.getWaterResistance());
        phone.setRecording(request.getRecording());
        phone.setVideo(request.getVideo());
        phone.setAudio(request.getAudio());

        // Kết nối
        phone.setMobileNetwork(request.getMobileNetwork());
        phone.setSimType(request.getSimType());
        phone.setWifi(request.getWifi());
        phone.setGps(request.getGps());
        phone.setBluetooth(request.getBluetooth());
        phone.setChargingPort(request.getChargingPort());
        phone.setHeadphoneJack(request.getHeadphoneJack());
        phone.setOtherConnectivity(request.getOtherConnectivity());

        // Thiết kế
        phone.setDesignType(request.getDesignType());
        phone.setMaterials(request.getMaterials());
        phone.setSizeWeight(request.getSizeWeight());


    }

    // Laptop methods
    private Laptop createLaptopFromRequest(LaptopRequest request) {
        Laptop laptop = new Laptop();

        // Thiết lập các trường cơ bản
        setBaseProductFields(laptop, request);

        // Thiết lập các trường riêng của Laptop
        laptop.setProcessorModel(request.getProcessorModel());
        laptop.setCoreCount(request.getCoreCount());
        laptop.setThreadCount(request.getThreadCount());
        laptop.setCpuSpeed(request.getCpuSpeed());
        laptop.setMaxCpuSpeed(request.getMaxCpuSpeed());

        // RAM, ổ cứng
        laptop.setRam(request.getRam());
        laptop.setRamType(request.getRamType());
        laptop.setRamBusSpeed(request.getRamBusSpeed());
        laptop.setMaxRam(request.getMaxRam());
        laptop.setStorage(request.getStorage());

        // Màn hình
        laptop.setScreenSize(request.getScreenSize());
        laptop.setResolution(request.getResolution());
        laptop.setRefreshRate(request.getRefreshRate());
        laptop.setColorGamut(request.getColorGamut());
        laptop.setDisplayTechnology(request.getDisplayTechnology());
        laptop.setTouchScreen(request.getTouchScreen());

        // Đồ họa và âm thanh
        laptop.setGraphicCard(request.getGraphicCard());
        laptop.setAudioTechnology(request.getAudioTechnology());
        laptop.setPorts(request.getPorts());
        laptop.setWirelessConnectivity(request.getWirelessConnectivity());
        laptop.setWebcam(request.getWebcam());
        laptop.setOtherFeatures(request.getOtherFeatures());
        laptop.setKeyboardBacklight(request.getKeyboardBacklight());

        // Kích thước - khối lượng - pin
        laptop.setSize(request.getSize());
        laptop.setMaterial(request.getMaterial());
        laptop.setBattery(request.getBattery());
        laptop.setOs(request.getOs());

        return laptop;
    }

    private void updateLaptopFields(Laptop laptop, LaptopRequest request) {
        // Update base fields
        updateBaseProductFields(laptop, request);

        // Update Laptop specific fields
        laptop.setProcessorModel(request.getProcessorModel());
        laptop.setCoreCount(request.getCoreCount());
        laptop.setThreadCount(request.getThreadCount());
        laptop.setCpuSpeed(request.getCpuSpeed());
        laptop.setMaxCpuSpeed(request.getMaxCpuSpeed());

        // RAM, ổ cứng
        laptop.setRam(request.getRam());
        laptop.setRamType(request.getRamType());
        laptop.setRamBusSpeed(request.getRamBusSpeed());
        laptop.setMaxRam(request.getMaxRam());
        laptop.setStorage(request.getStorage());

        // Màn hình
        laptop.setScreenSize(request.getScreenSize());
        laptop.setResolution(request.getResolution());
        laptop.setRefreshRate(request.getRefreshRate());
        laptop.setColorGamut(request.getColorGamut());
        laptop.setDisplayTechnology(request.getDisplayTechnology());
        laptop.setTouchScreen(request.getTouchScreen());

        // Đồ họa và âm thanh
        laptop.setGraphicCard(request.getGraphicCard());
        laptop.setAudioTechnology(request.getAudioTechnology());
        laptop.setPorts(request.getPorts());
        laptop.setWirelessConnectivity(request.getWirelessConnectivity());
        laptop.setWebcam(request.getWebcam());
        laptop.setOtherFeatures(request.getOtherFeatures());
        laptop.setKeyboardBacklight(request.getKeyboardBacklight());

        // Kích thước - khối lượng - pin
        laptop.setSize(request.getSize());
        laptop.setMaterial(request.getMaterial());
        laptop.setBattery(request.getBattery());
        laptop.setOs(request.getOs());
    }

    // BackupCharger methods
    private BackupCharger createBackupChargerFromRequest(BackupChargerRequest request) {
        BackupCharger backupCharger = new BackupCharger();

        // Thiết lập các trường cơ bản
        setBaseProductFields(backupCharger, request);

        // Thiết lập các trường riêng của BackupCharger
        backupCharger.setBatteryCapacity(request.getBatteryCapacity());
        backupCharger.setChargingTime(request.getChargingTime());
        backupCharger.setBatteryCellType(request.getBatteryCellType());
        backupCharger.setTechnologyFeatures(request.getTechnologyFeatures());
        backupCharger.setChargingTime(request.getChargingTime());
        backupCharger.setOutput(request.getOutput());
        backupCharger.setInput(request.getInput());
        backupCharger.setSize(request.getSize());
        backupCharger.setWeight(request.getWeight());
        backupCharger.setBrandOrigin(request.getBrandOrigin());
        backupCharger.setManufactured(request.getManufactured());

        return backupCharger;
    }

    private void updateBackupChargerFields(BackupCharger backupCharger, BackupChargerRequest request) {
        // Update base fields
        updateBaseProductFields(backupCharger, request);

        // Update BackupCharger specific fields
        backupCharger.setBatteryCapacity(request.getBatteryCapacity());
        backupCharger.setChargingTime(request.getChargingTime());
        backupCharger.setBatteryCellType(request.getBatteryCellType());
        backupCharger.setTechnologyFeatures(request.getTechnologyFeatures());
        backupCharger.setChargingTime(request.getChargingTime());
        backupCharger.setOutput(request.getOutput());
        backupCharger.setInput(request.getInput());
        backupCharger.setSize(request.getSize());
        backupCharger.setWeight(request.getWeight());
        backupCharger.setBrandOrigin(request.getBrandOrigin());
        backupCharger.setManufactured(request.getManufactured());
    }

    // CableChargerHub methods
    private CableChargerHub createCableChargerHubFromRequest(CableChargerHubRequest request) {
        CableChargerHub cableChargerHub = new CableChargerHub();

        // Thiết lập các trường cơ bản
        setBaseProductFields(cableChargerHub, request);

        // Thiết lập các trường riêng của CableChargerHub
        cableChargerHub.setFeatures(request.getFeatures());
        cableChargerHub.setModel(request.getModel());
        cableChargerHub.setTechnologyFeatures(request.getTechnologyFeatures());
        cableChargerHub.setMaximumCharging(request.getMaximumCharging());
        cableChargerHub.setOutput(request.getOutput());
        cableChargerHub.setInput(request.getInput());
        cableChargerHub.setSize(request.getSize());
        cableChargerHub.setBrandOrigin(request.getBrandOrigin());
        cableChargerHub.setManufactured(request.getManufactured());
        cableChargerHub.setLength(request.getLength());
        cableChargerHub.setConnectionJack(request.getConnectionJack());

        return cableChargerHub;
    }

    private void updateCableChargerHubFields(CableChargerHub cableChargerHub, CableChargerHubRequest request) {
        // Update base fields
        updateBaseProductFields(cableChargerHub, request);

        // Update CableChargerHub specific fields
        cableChargerHub.setFeatures(request.getFeatures());
        cableChargerHub.setModel(request.getModel());
        cableChargerHub.setTechnologyFeatures(request.getTechnologyFeatures());
        cableChargerHub.setMaximumCharging(request.getMaximumCharging());
        cableChargerHub.setOutput(request.getOutput());
        cableChargerHub.setInput(request.getInput());
        cableChargerHub.setSize(request.getSize());
        cableChargerHub.setBrandOrigin(request.getBrandOrigin());
        cableChargerHub.setManufactured(request.getManufactured());
        cableChargerHub.setLength(request.getLength());
        cableChargerHub.setConnectionJack(request.getConnectionJack());
    }
    // WirelessEarphone methods
    private WirelessEarphone createWirelessEarphoneFromRequest(WirelessEarphoneRequest request) {
        WirelessEarphone wirelessEarphone = new WirelessEarphone();

        // Thiết lập các trường cơ bản
        setBaseProductFields(wirelessEarphone, request);

        // Thiết lập các trường riêng của WirelessEarphone
        wirelessEarphone.setBatteryLife(request.getBatteryLife());
        wirelessEarphone.setChargingCaseBatteryLife(request.getChargingCaseBatteryLife());
        wirelessEarphone.setChargingPort(request.getChargingPort());
        wirelessEarphone.setAudioTechnology(request.getAudioTechnology());
        wirelessEarphone.setCompatibility(request.getCompatibility());
        wirelessEarphone.setConnectionApp(request.getConnectionApp());
        wirelessEarphone.setFeatures(request.getFeatures());
        wirelessEarphone.setSimultaneousConnections(request.getSimultaneousConnections());
        wirelessEarphone.setConnectionTechnology(request.getConnectionTechnology());
        wirelessEarphone.setControlType(request.getControlType());
        wirelessEarphone.setControlButtons(request.getControlButtons());
        wirelessEarphone.setSize(request.getSize());
        wirelessEarphone.setBrandOrigin(request.getBrandOrigin());
        wirelessEarphone.setManufactured(request.getManufactured());

        return wirelessEarphone;
    }

    private void updateWirelessEarphoneFields(WirelessEarphone wirelessEarphone, WirelessEarphoneRequest request) {
        // Update base fields
        updateBaseProductFields(wirelessEarphone, request);

        // Update WirelessEarphone specific fields
        wirelessEarphone.setBatteryLife(request.getBatteryLife());
        wirelessEarphone.setChargingCaseBatteryLife(request.getChargingCaseBatteryLife());
        wirelessEarphone.setChargingPort(request.getChargingPort());
        wirelessEarphone.setAudioTechnology(request.getAudioTechnology());
        wirelessEarphone.setCompatibility(request.getCompatibility());
        wirelessEarphone.setConnectionApp(request.getConnectionApp());
        wirelessEarphone.setFeatures(request.getFeatures());
        wirelessEarphone.setSimultaneousConnections(request.getSimultaneousConnections());
        wirelessEarphone.setConnectionTechnology(request.getConnectionTechnology());
        wirelessEarphone.setControlType(request.getControlType());
        wirelessEarphone.setControlButtons(request.getControlButtons());
        wirelessEarphone.setSize(request.getSize());
        wirelessEarphone.setBrandOrigin(request.getBrandOrigin());
        wirelessEarphone.setManufactured(request.getManufactured());
        wirelessEarphone.setWeight(request.getWeight());
    }

    // WiredEarphone methods

    private WiredEarphone createWiredEarphoneFromRequest(WiredEarphoneRequest request) {
        WiredEarphone wiredEarphone = new WiredEarphone();

        // Thiết lập các trường cơ bản
        setBaseProductFields(wiredEarphone, request);

        // Thiết lập các trường riêng của WiredEarphone
        wiredEarphone.setCompatibility(request.getCompatibility());
        wiredEarphone.setAudioJack(request.getAudioJack());
        wiredEarphone.setFeatures(request.getFeatures());
        wiredEarphone.setSimultaneousConnections(request.getSimultaneousConnections());
        wiredEarphone.setCableLength(request.getCableLength());
        wiredEarphone.setControlType(request.getControlType());
        wiredEarphone.setControlButtons(request.getControlButtons());
        wiredEarphone.setWeight(request.getWeight());
        wiredEarphone.setBrandOrigin(request.getBrandOrigin());
        wiredEarphone.setManufactured(request.getManufactured());

        return wiredEarphone;
    }

    private void updateWiredEarphoneFields(WiredEarphone wiredEarphone, WiredEarphoneRequest request) {
        // Update base fields
        updateBaseProductFields(wiredEarphone, request);

        // Update WiredEarphone specific fields
        wiredEarphone.setCompatibility(request.getCompatibility());
        wiredEarphone.setAudioJack(request.getAudioJack());
        wiredEarphone.setFeatures(request.getFeatures());
        wiredEarphone.setSimultaneousConnections(request.getSimultaneousConnections());
        wiredEarphone.setCableLength(request.getCableLength());
        wiredEarphone.setControlType(request.getControlType());
        wiredEarphone.setControlButtons(request.getControlButtons());
        wiredEarphone.setWeight(request.getWeight());
        wiredEarphone.setBrandOrigin(request.getBrandOrigin());
        wiredEarphone.setManufactured(request.getManufactured());
    }

    // Headphone methods
    private Headphone createHeadphoneFromRequest(HeadphoneRequest request) {
        Headphone headphone = new Headphone();

        // Thiết lập các trường cơ bản
        setBaseProductFields(headphone, request);

        // Thiết lập các trường riêng của Headphone
        headphone.setBatteryLife(request.getBatteryLife());
        headphone.setChargingPort(request.getChargingPort());
        headphone.setChargingPort(request.getChargingPort());
        headphone.setAudioJack(request.getAudioJack()  );
        headphone.setCompatibility(request.getCompatibility());
        headphone.setWeight(request.getWeight());
        headphone.setFeatures(request.getFeatures());
        headphone.setSimultaneousConnections(request.getSimultaneousConnections());
        headphone.setConnectionTechnology(request.getConnectionTechnology());
        headphone.setControlType(request.getControlType());
        headphone.setControlButtons(request.getControlButtons());
        headphone.setSize(request.getSize());
        headphone.setBrandOrigin(request.getBrandOrigin());
        headphone.setManufactured(request.getManufactured());

        return headphone;
    }

    private void updateHeadphoneFields(Headphone headphone, HeadphoneRequest request) {
        // Update base fields
        updateBaseProductFields(headphone, request);

        // Update Headphone specific fields
        headphone.setBatteryLife(request.getBatteryLife());
        headphone.setChargingPort(request.getChargingPort());
        headphone.setChargingPort(request.getChargingPort());
        headphone.setAudioJack(request.getAudioJack()   );
        headphone.setCompatibility(request.getCompatibility());
        headphone.setWeight(request.getWeight());
        headphone.setFeatures(request.getFeatures());
        headphone.setSimultaneousConnections(request.getSimultaneousConnections());
        headphone.setConnectionTechnology(request.getConnectionTechnology());
        headphone.setControlType(request.getControlType());
        headphone.setControlButtons(request.getControlButtons());
        headphone.setSize(request.getSize());
        headphone.setBrandOrigin(request.getBrandOrigin());
        headphone.setManufactured(request.getManufactured());
    }

    @Transactional(timeout = 300)
    public BulkGroupCreateResponse createBulkProductGroup(BulkGroupCreateRequest request) {
        log.info("=== Starting bulk product group creation for: {} ===", request.getGroupName());
        log.info("Group details - Brand: {}, Type: {}, Products count: {}", 
                request.getBrand(), request.getType(), request.getProducts().size());
        
        List<String> createdProductIds = new ArrayList<>();
        List<String> failedProducts = new ArrayList<>();
        List<String> variants = new ArrayList<>();
        List<String> productNames = new ArrayList<>();
        List<Integer> defaultOriginalPrices = new ArrayList<>();
        List<Integer> defaultCurrentPrices = new ArrayList<>();
        List<String> defaultColors = new ArrayList<>();
        
        long startTime = System.currentTimeMillis();
        
        try {
            // Step 1: Tạo từng sản phẩm
            for (ProductWithInventoryRequest productRequest : request.getProducts()) {
                try {
                    ProductResponse productResponse = createProduct(productRequest);
                    createdProductIds.add(productResponse.getProductId());
                    
                    // Tạo variant từ productName hoặc description
                    String variant = productResponse.getProductName();
                    if (variant == null || variant.isEmpty()) {
                        variant = productResponse.getDescription();
                    }
                    variants.add(variant);
                    productNames.add(productResponse.getProductName());
                    
                    // Lấy giá từ inventory đầu tiên
                    if (!productResponse.getOriginal_prices().isEmpty()) {
                        defaultOriginalPrices.add(productResponse.getOriginal_prices().get(0).intValue());
                        defaultCurrentPrices.add(productResponse.getCurrent_prices().get(0).intValue());
                        defaultColors.add(productResponse.getColors().get(0));
                    } else {
                        defaultOriginalPrices.add(0);
                        defaultCurrentPrices.add(0);
                        defaultColors.add(null);
                    }
                    
                    log.info("Successfully created product: {}", productResponse.getProductId());
                } catch (Exception e) {
                    failedProducts.add(productRequest.getProductRequest().getProductName());
                    log.error("Failed to create product {}: {}", 
                            productRequest.getProductRequest().getProductName(), e.getMessage());
                }
            }
            
            // Nếu không có sản phẩm nào được tạo thành công
            if (createdProductIds.isEmpty()) {
                return BulkGroupCreateResponse.builder()
                        .success(false)
                        .productIds(createdProductIds)
                        .failedProducts(failedProducts)
                        .message("Failed to create any products")
                        .build();
            }
            
            // Step 2: Tạo group variant
            try {
                Map<String, Object> groupRequest = new HashMap<>();
                groupRequest.put("productIds", createdProductIds);
                groupRequest.put("variants", variants);
                groupRequest.put("productNames", productNames);
                groupRequest.put("defaultOriginalPrices", defaultOriginalPrices);
                groupRequest.put("defaultCurrentPrices", defaultCurrentPrices);
                groupRequest.put("defaultColors", defaultColors);
                groupRequest.put("groupName", request.getGroupName());
                groupRequest.put("brand", request.getBrand());
                groupRequest.put("type", request.getType());
                groupRequest.put("image", request.getImage());
                
                // Gọi inventory-service để tạo group
                ResponseEntity<Map<String, Integer>> response = inventoryClient.createGroupVariant(groupRequest);
                Integer groupId = response.getBody().get("groupId");
                
                long endTime = System.currentTimeMillis();
                log.info("Successfully created group {} with {} products in {}ms", 
                        groupId, createdProductIds.size(), (endTime - startTime));
                
                return BulkGroupCreateResponse.builder()
                        .success(true)
                        .groupId(groupId)
                        .productIds(createdProductIds)
                        .failedProducts(failedProducts.isEmpty() ? null : failedProducts)
                        .message(String.format("Successfully created group '%s' with %d products%s in %dms", 
                                request.getGroupName(), 
                                createdProductIds.size(),
                                failedProducts.isEmpty() ? "" : " (" + failedProducts.size() + " failed)",
                                (endTime - startTime)))
                        .build();
                        
            } catch (Exception e) {
                log.error("Failed to create group, rolling back products: {}", e.getMessage());
                // Rollback: xóa các sản phẩm đã tạo
                rollbackProducts(createdProductIds);
                
                return BulkGroupCreateResponse.builder()
                        .success(false)
                        .productIds(new ArrayList<>())
                        .failedProducts(failedProducts)
                        .message("Failed to create group: " + e.getMessage())
                        .build();
            }
            
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            log.error("=== Unexpected error during bulk creation for group {} after {}ms: {} ===", 
                    request.getGroupName(), (endTime - startTime), e.getMessage(), e);
            
            // Rollback any created products
            if (!createdProductIds.isEmpty()) {
                log.warn("Rolling back {} products due to unexpected error", createdProductIds.size());
                rollbackProducts(createdProductIds);
            }
            
            return BulkGroupCreateResponse.builder()
                    .success(false)
                    .productIds(new ArrayList<>())
                    .failedProducts(failedProducts)
                    .message("Unexpected error: " + e.getMessage())
                    .build();
        }
    }
    
    private void rollbackProducts(List<String> productIds) {
        log.info("Starting rollback for {} products", productIds.size());
        
        // Step 1: Xóa tất cả inventories trước (bulk operation)
        try {
            inventoryClient.deleteInventoriesByProductIds(productIds);
            log.info("Successfully deleted inventories for {} products during rollback", productIds.size());
        } catch (Exception e) {
            log.error("Failed to delete inventories during rollback: {}", e.getMessage());
            // Continue với product deletion dù inventory deletion failed
        }
        
        // Step 2: Xóa từng product từ MongoDB
        for (String productId : productIds) {
            try {
                productRepository.deleteById(productId);
                log.info("Successfully rolled back product from MongoDB: {}", productId);
            } catch (Exception e) {
                log.error("Failed to rollback product {} from MongoDB: {}", productId, e.getMessage());
            }
        }
        
        log.info("Completed rollback process for {} products", productIds.size());
    }
}