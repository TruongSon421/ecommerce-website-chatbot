package com.eazybytes.service;

import com.eazybytes.client.InventoryClient;
import com.eazybytes.dto.*;
import com.eazybytes.model.Phone;
import com.eazybytes.model.Laptop;
import com.eazybytes.repository.LaptopRepository;
import com.eazybytes.repository.PhoneRepository;
import com.eazybytes.exception.ProductNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {
    private final PhoneRepository phoneRepository;
    private final LaptopRepository laptopRepository;
    private final InventoryClient inventoryClient;

    public PhoneResponse createPhone(PhoneWithInventoryRequest phoneWithInventoryRequest) {
        Phone phone = new Phone();

        PhoneRequest phoneRequest = phoneWithInventoryRequest.getPhoneRequest();
        List<InventoryRequest> inventoryRequests = phoneWithInventoryRequest.getInventoryRequests();

        phone.setProductName(phoneRequest.getProductName());
        phone.setDescription(phoneRequest.getDescription());

        phone.setBrand(phoneRequest.getBrand());
        phone.setImages(phoneRequest.getImages());
        phone.setWarrantyPeriod(phoneRequest.getWarrantyPeriod());
        phone.setProductReviews(phoneRequest.getProductReviews());
        phone.setPromotions(phoneRequest.getPromotions());
        phone.setRelease(phoneRequest.getRelease());

        // Thiết lập các trường riêng của Phone
        phone.setOs(phoneRequest.getOs());
        phone.setProcessor(phoneRequest.getProcessor());
        phone.setCpuSpeed(phoneRequest.getCpuSpeed());
        phone.setGpu(phoneRequest.getGpu());
        phone.setRam(phoneRequest.getRam());
        phone.setStorage(phoneRequest.getStorage());
        phone.setAvailableStorage(phoneRequest.getAvailableStorage());
        phone.setContactLimit(phoneRequest.getContactLimit());

        // Camera và màn hình
        phone.setRearCameraResolution(phoneRequest.getRearCameraResolution());
        phone.setRearVideoRecording(phoneRequest.getRearVideoRecording());
        phone.setRearFlash(phoneRequest.getRearFlash());
        phone.setRearCameraFeatures(phoneRequest.getRearCameraFeatures());
        phone.setFrontCameraResolution(phoneRequest.getFrontCameraResolution());
        phone.setFrontCameraFeatures(phoneRequest.getFrontCameraFeatures());
        phone.setDisplayTechnology(phoneRequest.getDisplayTechnology());
        phone.setDisplayResolution(phoneRequest.getDisplayResolution());
        phone.setScreenSize(phoneRequest.getScreenSize());
        phone.setMaxBrightness(phoneRequest.getMaxBrightness());
        phone.setScreenProtection(phoneRequest.getScreenProtection());

        // Pin và sạc
        phone.setBatteryCapactity(phoneRequest.getBatteryCapactity());
        phone.setBatteryType(phoneRequest.getBatteryType());
        phone.setMaxChargingPower(phoneRequest.getMaxChargingPower());
        phone.setBatteryFeatures(phoneRequest.getBatteryFeatures());

        // Tiện ích
        phone.setSecurityFeatures(phoneRequest.getSecurityFeatures());
        phone.setSpecialFeatures(phoneRequest.getSpecialFeatures());
        phone.setWaterResistance(phoneRequest.getWaterResistance());
        phone.setRecording(phoneRequest.getRecording());
        phone.setVideo(phoneRequest.getVideo());
        phone.setAudio(phoneRequest.getAudio());

        // Kết nối
        phone.setMobileNetwork(phoneRequest.getMobileNetwork());
        phone.setSimType(phoneRequest.getSimType());
        phone.setWifi(phoneRequest.getWifi());
        phone.setGps(phoneRequest.getGps());
        phone.setBluetooth(phoneRequest.getBluetooth());
        phone.setChargingPort(phoneRequest.getChargingPort());
        phone.setHeadphoneJack(phoneRequest.getHeadphoneJack());
        phone.setOtherConnectivity(phoneRequest.getOtherConnectivity());

        // Thiết kế
        phone.setDesignType(phoneRequest.getDesignType());
        phone.setMaterials(phoneRequest.getMaterials());
        phone.setSizeWeight(phoneRequest.getSizeWeight());

        phone.setColors(phoneRequest.getColors());

        Phone savedPhone = (Phone) phoneRepository.save(phone);
        List<InventoryDto> inventoryDtos = new ArrayList<>();
        for (InventoryRequest inventoryRequest : inventoryRequests) {

            InventoryDto inventoryDto = new InventoryDto();

            inventoryDto.setProductName(savedPhone.getProductName());
            inventoryDto.setProductId(savedPhone.getProductId());

            inventoryDto.setCurrentPrice(inventoryRequest.getCurrentPrice());
            inventoryDto.setOriginalPrice(inventoryRequest.getOriginalPrice());
            inventoryDto.setQuantity(inventoryRequest.getQuantity());

            inventoryDto.setColor(inventoryRequest.getColor());

            inventoryDtos.add(inventoryDto);
            inventoryClient.createInventory(inventoryDto);
        }

        log.info("Phone {} is saved", savedPhone.getProductId());
        return mapToPhoneResponse(savedPhone, inventoryDtos);
    }


    public LaptopResponse createLaptop(LaptopWithInventoryRequest laptopWithInventoryRequest) {
        Laptop laptop = new Laptop();

        LaptopRequest laptopRequest = laptopWithInventoryRequest.getLaptopRequest();
        List<InventoryRequest> inventoryRequests = laptopWithInventoryRequest.getInventoryRequests();

        laptop.setProductName(laptopRequest.getProductName());
        laptop.setDescription(laptopRequest.getDescription());

        laptop.setBrand(laptopRequest.getBrand());
        laptop.setImages(laptopRequest.getImages());
        laptop.setWarrantyPeriod(laptopRequest.getWarrantyPeriod());
        laptop.setProductReviews(laptopRequest.getProductReviews());
        laptop.setPromotions(laptopRequest.getPromotions());
        laptop.setRelease(laptopRequest.getRelease());

        // Thiết lập các trường riêng của Laptop
        laptop.setProcessorModel(laptopRequest.getProcessorModel());
        laptop.setCoreCount(laptopRequest.getCoreCount());
        laptop.setThreadCount(laptopRequest.getThreadCount());
        laptop.setCpuSpeed(laptopRequest.getCpuSpeed());
        laptop.setMaxCpuSpeed(laptopRequest.getMaxCpuSpeed());

        // RAM, ổ cứng
        laptop.setRam(laptopRequest.getRam());
        laptop.setRamType(laptopRequest.getRamType());
        laptop.setRamBusSpeed(laptopRequest.getRamBusSpeed());
        laptop.setMaxRam(laptopRequest.getMaxRam());
        laptop.setStorage(laptopRequest.getStorage());

        // Màn hình
        laptop.setScreenSize(laptopRequest.getScreenSize());
        laptop.setResolution(laptopRequest.getResolution());
        laptop.setRefreshRate(laptopRequest.getRefreshRate());
        laptop.setColorGamut(laptopRequest.getColorGamut());
        laptop.setDisplayTechnology(laptopRequest.getDisplayTechnology());

        // Đồ họa và âm thanh
        laptop.setGraphicCard(laptopRequest.getGraphicCard());
        laptop.setAudioTechnology(laptopRequest.getAudioTechnology());
        laptop.setPorts(laptopRequest.getPorts());
        laptop.setWirelessConnectivity(laptopRequest.getWirelessConnectivity());
        laptop.setWebcam(laptopRequest.getWebcam());
        laptop.setOtherFeatures(laptopRequest.getOtherFeatures());
        laptop.setKeyboardBacklight(laptopRequest.getKeyboardBacklight());

        // Kích thước - khối lượng - pin
        laptop.setSize(laptopRequest.getSize());
        laptop.setMaterial(laptopRequest.getMaterial());
        laptop.setBattery(laptopRequest.getBattery());
        laptop.setOs(laptopRequest.getOs());

        laptop.setColors(laptop.getColors());

        Laptop savedLaptop = (Laptop) laptopRepository.save(laptop);
        List<InventoryDto> inventoryDtos = new ArrayList<>();
        for (InventoryRequest inventoryRequest : inventoryRequests) {

            InventoryDto inventoryDto = new InventoryDto();

            inventoryDto.setProductName(savedLaptop.getProductName());
            inventoryDto.setProductId(savedLaptop.getProductId());

            inventoryDto.setCurrentPrice(inventoryRequest.getCurrentPrice());
            inventoryDto.setOriginalPrice(inventoryRequest.getOriginalPrice());
            inventoryDto.setQuantity(inventoryRequest.getQuantity());

            inventoryDto.setColor(inventoryRequest.getColor());

            inventoryDtos.add(inventoryDto);
            inventoryClient.createInventory(inventoryDto);
        }
        log.info("Laptop {} is saved", savedLaptop.getProductId());
        return mapToLaptopResponse(savedLaptop,inventoryDtos);
    }

    public PhoneResponse getPhoneById(String id) {
        Phone phone = phoneRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Phone not found with id: " + id));
        List<InventoryDto> variants = inventoryClient.getProductColorVariants(id).getBody();

        return mapToPhoneResponse(phone,variants);
    }

    public LaptopResponse getLaptopById(String id) {
        Laptop laptop = laptopRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Laptop not found with id: " + id));
        List<InventoryDto> variants = inventoryClient.getProductColorVariants(id).getBody();

        return mapToLaptopResponse(laptop,variants);
    }

    public String deletePhone(String id) {
        Phone phone = phoneRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Phone not found with id: " + id));
        phoneRepository.delete(phone);
        log.info("Phone {} is deleted", id);
        return "Phone with id: " + id + " has been successfully deleted";

    }

    public String deleteLaptop(String id) {
        Laptop laptop = laptopRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Laptop not found with id: " + id));
        laptopRepository.delete(laptop);
        log.info("Laptop {} is deleted", id);
        return "Laptop with id: " + id + " has been successfully deleted";

    }

    private PhoneResponse mapToPhoneResponse(Phone phone, List<InventoryDto> inventoryDtos) {
        PhoneResponse phoneResponse = PhoneResponse.fromPhone(phone,  inventoryDtos);

        return phoneResponse;
    }

    private LaptopResponse mapToLaptopResponse(Laptop laptop, List<InventoryDto> inventoryDtos) {
        LaptopResponse phoneResponse = LaptopResponse.fromLaptop(laptop,  inventoryDtos);

        return phoneResponse;
    }

    public PhoneResponse updatePhone(String id, PhoneRequest phoneRequest, List<InventoryDto> inventoryDtos) {
        Phone phone = phoneRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Phone not found with id: " + id));

        // Thiết lập các trường cơ bản của Product
        phone.setProductName(phoneRequest.getProductName());
        phone.setDescription(phoneRequest.getDescription());

        phone.setBrand(phoneRequest.getBrand());
        phone.setImages(phoneRequest.getImages());
        phone.setWarrantyPeriod(phoneRequest.getWarrantyPeriod());
        phone.setProductReviews(phoneRequest.getProductReviews());
        phone.setPromotions(phoneRequest.getPromotions());
        phone.setRelease(phoneRequest.getRelease());

        // Thiết lập các trường riêng của Phone
        phone.setOs(phoneRequest.getOs());
        phone.setProcessor(phoneRequest.getProcessor());
        phone.setCpuSpeed(phoneRequest.getCpuSpeed());
        phone.setGpu(phoneRequest.getGpu());
        phone.setRam(phoneRequest.getRam());
        phone.setStorage(phoneRequest.getStorage());
        phone.setAvailableStorage(phoneRequest.getAvailableStorage());
        phone.setContactLimit(phoneRequest.getContactLimit());

        // Camera và màn hình
        phone.setRearCameraResolution(phoneRequest.getRearCameraResolution());
        phone.setRearVideoRecording(phoneRequest.getRearVideoRecording());
        phone.setRearFlash(phoneRequest.getRearFlash());
        phone.setRearCameraFeatures(phoneRequest.getRearCameraFeatures());
        phone.setFrontCameraResolution(phoneRequest.getFrontCameraResolution());
        phone.setFrontCameraFeatures(phoneRequest.getFrontCameraFeatures());
        phone.setDisplayTechnology(phoneRequest.getDisplayTechnology());
        phone.setDisplayResolution(phoneRequest.getDisplayResolution());
        phone.setScreenSize(phoneRequest.getScreenSize());
        phone.setMaxBrightness(phoneRequest.getMaxBrightness());
        phone.setScreenProtection(phoneRequest.getScreenProtection());

        // Pin và sạc
        phone.setBatteryCapactity(phoneRequest.getBatteryCapactity());
        phone.setBatteryType(phoneRequest.getBatteryType());
        phone.setMaxChargingPower(phoneRequest.getMaxChargingPower());
        phone.setBatteryFeatures(phoneRequest.getBatteryFeatures());

        // Tiện ích
        phone.setSecurityFeatures(phoneRequest.getSecurityFeatures());
        phone.setSpecialFeatures(phoneRequest.getSpecialFeatures());
        phone.setWaterResistance(phoneRequest.getWaterResistance());
        phone.setRecording(phoneRequest.getRecording());
        phone.setVideo(phoneRequest.getVideo());
        phone.setAudio(phoneRequest.getAudio());

        // Kết nối
        phone.setMobileNetwork(phoneRequest.getMobileNetwork());
        phone.setSimType(phoneRequest.getSimType());
        phone.setWifi(phoneRequest.getWifi());
        phone.setGps(phoneRequest.getGps());
        phone.setBluetooth(phoneRequest.getBluetooth());
        phone.setChargingPort(phoneRequest.getChargingPort());
        phone.setHeadphoneJack(phoneRequest.getHeadphoneJack());
        phone.setOtherConnectivity(phoneRequest.getOtherConnectivity());

        // Thiết kế
        phone.setDesignType(phoneRequest.getDesignType());
        phone.setMaterials(phoneRequest.getMaterials());
        phone.setSizeWeight(phoneRequest.getSizeWeight());

        phone.setColors(phoneRequest.getColors());

        Phone updatedPhone = phoneRepository.save(phone);

        for (InventoryDto inventoryDto : inventoryDtos) {
            inventoryDto.setProductId(updatedPhone.getProductId());

            if (inventoryDto.getColor() == null || inventoryDto.getColor().isEmpty()) {
                inventoryDto.setColor("Default");
            }

            inventoryClient.updateProductInventory(inventoryDto);

        }

        log.info("Phone {} is updated", updatedPhone.getProductId());
        return mapToPhoneResponse(updatedPhone,inventoryDtos);
    }

    public LaptopResponse updateLaptop(String id, LaptopRequest laptopRequest, List<InventoryDto> inventoryDtos) {
        Laptop laptop = laptopRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Laptop not found with id: " + id));

        laptop.setProductName(laptopRequest.getProductName());
        laptop.setDescription(laptopRequest.getDescription());

        laptop.setBrand(laptopRequest.getBrand());
        laptop.setImages(laptopRequest.getImages());
        laptop.setWarrantyPeriod(laptopRequest.getWarrantyPeriod());
        laptop.setProductReviews(laptopRequest.getProductReviews());
        laptop.setPromotions(laptopRequest.getPromotions());
        laptop.setRelease(laptopRequest.getRelease());

        // Thiết lập các trường riêng của Laptop
        laptop.setProcessorModel(laptopRequest.getProcessorModel());
        laptop.setCoreCount(laptopRequest.getCoreCount());
        laptop.setThreadCount(laptopRequest.getThreadCount());
        laptop.setCpuSpeed(laptopRequest.getCpuSpeed());
        laptop.setMaxCpuSpeed(laptopRequest.getMaxCpuSpeed());

        // RAM, ổ cứng
        laptop.setRam(laptopRequest.getRam());
        laptop.setRamType(laptopRequest.getRamType());
        laptop.setRamBusSpeed(laptopRequest.getRamBusSpeed());
        laptop.setMaxRam(laptopRequest.getMaxRam());
        laptop.setStorage(laptopRequest.getStorage());

        // Màn hình
        laptop.setScreenSize(laptopRequest.getScreenSize());
        laptop.setResolution(laptopRequest.getResolution());
        laptop.setRefreshRate(laptopRequest.getRefreshRate());
        laptop.setColorGamut(laptopRequest.getColorGamut());
        laptop.setDisplayTechnology(laptopRequest.getDisplayTechnology());

        // Đồ họa và âm thanh
        laptop.setGraphicCard(laptopRequest.getGraphicCard());
        laptop.setAudioTechnology(laptopRequest.getAudioTechnology());
        laptop.setPorts(laptopRequest.getPorts());
        laptop.setWirelessConnectivity(laptopRequest.getWirelessConnectivity());
        laptop.setWebcam(laptopRequest.getWebcam());
        laptop.setOtherFeatures(laptopRequest.getOtherFeatures());
        laptop.setKeyboardBacklight(laptopRequest.getKeyboardBacklight());

        // Kích thước - khối lượng - pin
        laptop.setSize(laptopRequest.getSize());
        laptop.setMaterial(laptopRequest.getMaterial());
        laptop.setBattery(laptopRequest.getBattery());
        laptop.setOs(laptopRequest.getOs());

        Laptop updatedLaptop = laptopRepository.save(laptop);

        for (InventoryDto inventoryDto : inventoryDtos) {
            inventoryDto.setProductId(updatedLaptop.getProductId());

            if (inventoryDto.getColor() == null || inventoryDto.getColor().isEmpty()) {
                inventoryDto.setColor("Default");
            }

            inventoryClient.updateProductInventory(inventoryDto);

        }
        log.info("Laptop {} is updated", updatedLaptop.getProductId());
        return mapToLaptopResponse(updatedLaptop,inventoryDtos);
    }
}