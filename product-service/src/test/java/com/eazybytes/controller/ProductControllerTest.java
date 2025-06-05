package com.eazybytes.service;

import com.eazybytes.client.InventoryClient;
import com.eazybytes.dto.InventoryDto;
import com.eazybytes.dto.ProductWithInventoryRequest;
import com.eazybytes.dto.laptop.LaptopRequest;
import com.eazybytes.dto.laptop.LaptopResponse;
import com.eazybytes.dto.phone.PhoneRequest;
import com.eazybytes.dto.phone.PhoneResponse;
import com.eazybytes.model.Laptop;
import com.eazybytes.model.Phone;
import com.eazybytes.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private InventoryClient inventoryClient;

    @InjectMocks
    private ProductService productService;

    private PhoneRequest phoneRequest;
    private LaptopRequest laptopRequest;
    private ProductWithInventoryRequest phoneWithInventoryRequest;
    private ProductWithInventoryRequest laptopWithInventoryRequest;
    private List<InventoryDto> inventoryDtos;
    private Phone phoneEntity;
    private Laptop laptopEntity;

    @BeforeEach
    void setUp() {
        setupPhoneRequest();
        setupLaptopRequest();
        setupInventoryDtos();
        setupProductWithInventoryRequests();
        setupEntities();
    }

    private void setupPhoneRequest() {
        phoneRequest = PhoneRequest.builder()
                .productName("iPhone 15 Pro")
                .description("Apple iPhone 15 Pro với chip A17 Pro mạnh mẽ")
                .brand("Apple")
                .type("phone")
                .warrantyPeriod("12 tháng")
                .release("2023-09-22")
                .images(createImageMap())
                .productReviews(createReviews())
                .promotions(Arrays.asList("Giảm 10%", "Tặng ốp lưng"))
                .os("iOS 17")
                .processor("Apple A17 Pro")
                .cpuSpeed("3.78 GHz")
                .gpu("Apple GPU 6-core")
                .ram("8GB")
                .storage("256GB")
                .availableStorage("240GB")
                .contactLimit("Không giới hạn")
                .rearCameraResolution("48MP")
                .rearVideoRecording(Arrays.asList("4K@60fps", "1080p@240fps"))
                .rearFlash("True Tone flash")
                .rearCameraFeatures(Arrays.asList("Night mode", "Portrait mode"))
                .frontCameraResolution("12MP")
                .frontCameraFeatures(Arrays.asList("Portrait mode", "Night mode"))
                .displayTechnology("Super Retina XDR OLED")
                .displayResolution("2556 x 1179")
                .screenSize("6.1 inch")
                .maxBrightness("2000 nits")
                .screenProtection("Ceramic Shield")
                .batteryCapacity("3274 mAh")
                .batteryType("Li-Ion")
                .maxChargingPower("27W")
                .batteryFeatures(Arrays.asList("MagSafe wireless charging"))
                .securityFeatures(Arrays.asList("Face ID"))
                .specialFeatures(Arrays.asList("Dynamic Island", "Action Button"))
                .waterResistance("IP68")
                .recording(Arrays.asList("Dolby Digital"))
                .video(Arrays.asList("HDR10"))
                .audio(Arrays.asList("Spatial Audio"))
                .mobileNetwork("5G")
                .simType("nano-SIM và eSIM")
                .wifi(Arrays.asList("Wi-Fi 6E"))
                .gps(Arrays.asList("GPS", "GLONASS"))
                .bluetooth(Arrays.asList("Bluetooth 5.3"))
                .chargingPort("USB-C")
                .headphoneJack("Không")
                .otherConnectivity(Arrays.asList("NFC"))
                .designType("Nguyên khối")
                .materials("Titanium")
                .sizeWeight("146.6 x 70.6 x 8.25 mm, 187g")
                .build();
    }

    private void setupLaptopRequest() {
        laptopRequest = LaptopRequest.builder()
                .productName("MacBook Pro 16-inch M3 Max")
                .description("MacBook Pro 16-inch với chip M3 Max mạnh mẽ")
                .brand("Apple")
                .type("laptop")
                .warrantyPeriod("12 tháng")
                .release("2023-10-30")
                .images(createImageMap())
                .productReviews(createReviews())
                .promotions(Arrays.asList("Giảm 5%", "Tặng túi xách"))
                .processorModel("Apple M3 Max")
                .coreCount("16-core CPU")
                .threadCount("16 threads")
                .cpuSpeed("4.05 GHz")
                .maxCpuSpeed("4.05 GHz")
                .ram("36GB")
                .ramType("Unified Memory")
                .ramBusSpeed("800GB/s")
                .maxRam("128GB")
                .storage(Arrays.asList("1TB SSD"))
                .screenSize("16.2 inch")
                .resolution("3456 x 2234")
                .refreshRate("120Hz ProMotion")
                .colorGamut(Arrays.asList("P3 wide color"))
                .displayTechnology(Arrays.asList("Liquid Retina XDR"))
                .touchScreen(Arrays.asList("Không hỗ trợ"))
                .graphicCard("40-core GPU")
                .audioTechnology(Arrays.asList("Six-speaker system"))
                .ports(Arrays.asList("3x Thunderbolt 4", "HDMI"))
                .wirelessConnectivity(Arrays.asList("Wi-Fi 6E"))
                .webcam("1080p FaceTime HD camera")
                .otherFeatures(Arrays.asList("Touch ID"))
                .keyboardBacklight("Có")
                .size("35.57 x 24.81 x 1.68 cm")
                .material("Aluminum")
                .battery("100Wh lithium-polymer")
                .os("macOS Sonoma")
                .build();
    }

    private void setupInventoryDtos() {
        inventoryDtos = Arrays.asList(
                InventoryDto.builder()
                        .groupId(1)
                        .productId("PROD001")
                        .productName("iPhone 15 Pro")
                        .color("Natural Titanium")
                        .quantity(50)
                        .originalPrice(29990000)
                        .currentPrice(26990000)
                        .build(),
                InventoryDto.builder()
                        .groupId(1)
                        .productId("PROD001")
                        .productName("iPhone 15 Pro")
                        .color("Blue Titanium")
                        .quantity(30)
                        .originalPrice(29990000)
                        .currentPrice(26990000)
                        .build()
        );
    }

    private void setupProductWithInventoryRequests() {
        phoneWithInventoryRequest = ProductWithInventoryRequest.builder()
                .productRequest(phoneRequest)
                .inventoryRequests(Arrays.asList(
                        InventoryDto.builder()
                                .groupId(1)
                                .productId("PROD001_PHONE")
                                .productName("iPhone 15 Pro")
                                .color("Natural Titanium")
                                .quantity(50)
                                .originalPrice(29990000)
                                .currentPrice(26990000)
                                .build(),
                        InventoryDto.builder()
                                .groupId(1)
                                .productId("PROD001_PHONE")
                                .productName("iPhone 15 Pro")
                                .color("Blue Titanium")
                                .quantity(30)
                                .originalPrice(29990000)
                                .currentPrice(26990000)
                                .build()
                ))
                .build();

        laptopWithInventoryRequest = ProductWithInventoryRequest.builder()
                .productRequest(laptopRequest)
                .inventoryRequests(Arrays.asList(
                        InventoryDto.builder()
                                .groupId(1)
                                .productId("PROD002_LAPTOP")
                                .productName("MacBook Pro 16-inch M3 Max")
                                .color("Natural Titanium")
                                .quantity(50)
                                .originalPrice(29990000)
                                .currentPrice(26990000)
                                .build(),
                        InventoryDto.builder()
                                .groupId(1)
                                .productId("PROD002_LAPTOP")
                                .productName("MacBook Pro 16-inch M3 Max")
                                .color("Blue Titanium")
                                .quantity(30)
                                .originalPrice(29990000)
                                .currentPrice(26990000)
                                .build()
                ))
                .build();
    }

    private void setupEntities() {
        phoneEntity = new Phone();
        phoneEntity.setProductId("PROD001");
        phoneEntity.setProductName("iPhone 15 Pro");
        phoneEntity.setType("phone");
        phoneEntity.setBrand("Apple");
        phoneEntity.setOs("iOS 17");
        phoneEntity.setProcessor("Apple A17 Pro");
        phoneEntity.setRam("8GB");
        phoneEntity.setScreenSize("6.1 inch");

        laptopEntity = new Laptop();
        laptopEntity.setProductId("PROD002");
        laptopEntity.setProductName("MacBook Pro 16-inch M3 Max");
        laptopEntity.setType("laptop");
        laptopEntity.setBrand("Apple");
        laptopEntity.setProcessorModel("Apple M3 Max");
        laptopEntity.setRam("36GB");
        laptopEntity.setScreenSize("16.2 inch");
        laptopEntity.setOs("macOS Sonoma");
    }

    private Map<String, List<Map<String, String>>> createImageMap() {
        Map<String, List<Map<String, String>>> images = new HashMap<>();
        List<Map<String, String>> mainImages = Arrays.asList(
                Map.of("url", "https://example.com/image1.jpg", "alt", "Product image 1"),
                Map.of("url", "https://example.com/image2.jpg", "alt", "Product image 2")
        );
        images.put("main", mainImages);
        return images;
    }

    private List<Map<String, String>> createReviews() {
        return Arrays.asList(
                Map.of("title", "Sản phẩm tuyệt vời", "content", "Chất lượng xuất sắc"),
                Map.of("title", "Đáng tiền", "content", "Hiệu năng mạnh mẽ")
        );
    }

    // Tests for getProductById
    @Test
    void testGetPhoneProduct_Success() {
        when(productRepository.findById("PROD001")).thenReturn(Optional.of(phoneEntity));
        when(inventoryClient.getProductColorVariants("PROD001"))
                .thenReturn(new ResponseEntity<>(inventoryDtos, HttpStatus.OK));

        PhoneResponse response = (PhoneResponse) productService.getProductById("phone", "PROD001");

        assertNotNull(response);
        assertEquals("PROD001", response.getProductId());
        assertEquals("phone", response.getType());
        assertEquals("iPhone 15 Pro", response.getProductName());
        verify(productRepository).findById("PROD001");
        verify(inventoryClient).getProductColorVariants("PROD001");
    }

    @Test
    void testGetLaptopProduct_Success() {
        when(productRepository.findById("PROD002")).thenReturn(Optional.of(laptopEntity));
        when(inventoryClient.getProductColorVariants("PROD002"))
                .thenReturn(new ResponseEntity<>(inventoryDtos, HttpStatus.OK));

        LaptopResponse response = (LaptopResponse) productService.getProductById("laptop", "PROD002");

        assertNotNull(response);
        assertEquals("PROD002", response.getProductId());
        assertEquals("laptop", response.getType());
        assertEquals("MacBook Pro 16-inch M3 Max", response.getProductName());
        verify(productRepository).findById("PROD002");
        verify(inventoryClient).getProductColorVariants("PROD002");
    }

    @Test
    void testGetProduct_NotFound() {
        when(productRepository.findById("INVALID")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> productService.getProductById("phone", "INVALID"));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("Product not found with id: INVALID", exception.getReason());
        verify(productRepository).findById("INVALID");
    }

    @Test
    void testGetProduct_WrongType() {
        when(productRepository.findById("PROD001")).thenReturn(Optional.of(phoneEntity));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> productService.getProductById("laptop", "PROD001"));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Invalid product type: laptop", exception.getReason());
        verify(productRepository).findById("PROD001");
        verify(inventoryClient, never()).getProductColorVariants(anyString());
    }

    // Tests for createProduct
    @Test
    void testCreatePhoneProduct_Success() {
        when(productRepository.save(any(Phone.class))).thenReturn(phoneEntity);
        when(inventoryClient.createInventory(any())).thenReturn(new ResponseEntity<>(inventoryDtos.get(0), HttpStatus.OK));

        PhoneResponse response = (PhoneResponse) productService.createProduct(phoneWithInventoryRequest);

        assertNotNull(response);
        assertEquals("PROD001", response.getProductId());
        assertEquals("phone", response.getType());
        assertEquals("iPhone 15 Pro", response.getProductName());
        verify(productRepository).save(any(Phone.class));
        verify(inventoryClient, times(2)).createInventory(any());
    }

    @Test
    void testCreateLaptopProduct_Success() {
        when(productRepository.save(any(Laptop.class))).thenReturn(laptopEntity);
        when(inventoryClient.createInventory(any())).thenReturn(new ResponseEntity<>(inventoryDtos.get(0), HttpStatus.OK));

        LaptopResponse response = (LaptopResponse) productService.createProduct(laptopWithInventoryRequest);

        assertNotNull(response);
        assertEquals("PROD002", response.getProductId());
        assertEquals("laptop", response.getType());
        assertEquals("MacBook Pro 16-inch M3 Max", response.getProductName());
        verify(productRepository).save(any(Laptop.class));
        verify(inventoryClient, times(2)).createInventory(any());
    }

    // Tests for updateProduct
    @Test
    void testUpdatePhoneProduct_Success() {
        when(productRepository.findById("PROD001")).thenReturn(Optional.of(phoneEntity));
        when(productRepository.save(any(Phone.class))).thenReturn(phoneEntity);
        when(inventoryClient.deleteInventoriesByProductId("PROD001"))
                .thenReturn(new ResponseEntity<>(HttpStatus.NO_CONTENT));
        when(inventoryClient.createInventory(any())).thenReturn(new ResponseEntity<>(inventoryDtos.get(0), HttpStatus.OK));

        PhoneResponse response = (PhoneResponse) productService.updateProduct("PROD001", phoneWithInventoryRequest);

        assertNotNull(response);
        assertEquals("PROD001", response.getProductId());
        assertEquals("phone", response.getType());
        verify(productRepository).findById("PROD001");
        verify(productRepository).save(any(Phone.class));
        verify(inventoryClient).deleteInventoriesByProductId("PROD001");
        verify(inventoryClient, times(2)).createInventory(any());
    }

    @Test
    void testUpdateLaptopProduct_Success() {
        when(productRepository.findById("PROD002")).thenReturn(Optional.of(laptopEntity));
        when(productRepository.save(any(Laptop.class))).thenReturn(laptopEntity);
        when(inventoryClient.deleteInventoriesByProductId("PROD002"))
                .thenReturn(new ResponseEntity<>(HttpStatus.NO_CONTENT));
        when(inventoryClient.createInventory(any())).thenReturn(new ResponseEntity<>(inventoryDtos.get(0), HttpStatus.OK));

        LaptopResponse response = (LaptopResponse) productService.updateProduct("PROD002", laptopWithInventoryRequest);

        assertNotNull(response);
        assertEquals("PROD002", response.getProductId());
        assertEquals("laptop", response.getType());
        verify(productRepository).findById("PROD002");
        verify(productRepository).save(any(Laptop.class));
        verify(inventoryClient).deleteInventoriesByProductId("PROD002");
        verify(inventoryClient, times(2)).createInventory(any());
    }

    @Test
    void testUpdateProduct_NotFound() {
        when(productRepository.findById("INVALID")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> productService.updateProduct("INVALID", phoneWithInventoryRequest));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(productRepository).findById("INVALID");
        verify(productRepository, never()).save(any());
        verify(inventoryClient, never()).deleteInventoriesByProductId(anyString());
    }

    @Test
    void testUpdateProduct_WrongType() {
        ProductWithInventoryRequest wrongTypeRequest = ProductWithInventoryRequest.builder()
                .productRequest(phoneRequest)
                .inventoryRequests(inventoryDtos)
                .build();

        when(productRepository.findById("PROD002")).thenReturn(Optional.of(laptopEntity));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> productService.updateProduct("PROD002", wrongTypeRequest));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Product type mismatch: expected laptop, got phone", exception.getReason());
        verify(productRepository).findById("PROD002");
        verify(productRepository, never()).save(any());
    }

    // Tests for deleteProduct
    @Test
    void testDeleteProduct_Success() {
        when(productRepository.existsById("PROD001")).thenReturn(true);
        doNothing().when(productRepository).deleteById("PROD001");

        productService.deleteProduct("PROD001");

        verify(productRepository).existsById("PROD001");
        verify(productRepository).deleteById("PROD001");
    }

    @Test
    void testDeleteProduct_NotFound() {
        when(productRepository.existsById("INVALID")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> productService.deleteProduct("INVALID"));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("Product not found with id: INVALID", exception.getReason());
        verify(productRepository).existsById("INVALID");
        verify(productRepository, never()).deleteById(anyString());
    }
}
