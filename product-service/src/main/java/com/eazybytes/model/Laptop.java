package com.eazybytes.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@AllArgsConstructor
@SuperBuilder
public class Laptop extends BaseProduct {

    // Bộ xử lý
    private String processorModel; // công nghệ cpu
    private String coreCount; // số core
    private String threadCount; // số luồng
    private String cpuSpeed; // tốc độ cpu
    private String maxCpuSpeed; // tốc độ tối đa

    //Bộ nhớ ram, ổ cứng
    private String ram;
    private String ramType;
    private String ramBusSpeed;
    private String maxRam;
    private List<String> storage;

    //Màn hình
    private String screenSize;
    private String resolution;
    private String refreshRate;// tần số quét
    private List<String> colorGamut; // độ phủ màu
    private List<String> displayTechnology; // công nghệ màn hình
    private List<String> touchScreen;

    //Đồ họa và âm thanh
    private String graphicCard; // card màn hình
    private List<String> audioTechnology; // công nghệ âm thanh
    private List<String> ports; // cổng giao tiếp
    private List<String> wirelessConnectivity; // kết nối không dây
    private String webcam;
    private List<String> otherFeatures;
    private String keyboardBacklight;

    //Kích thước - khối lượng - pin
    private String size;
    private String material;
    private String battery;
    private String os;


    public Laptop() {
        setType("laptop");
    }
}