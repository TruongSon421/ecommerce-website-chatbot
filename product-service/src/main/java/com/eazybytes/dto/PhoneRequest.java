package com.eazybytes.dto;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class PhoneRequest extends ProductRequest{
    private String os;
    private String processor; // chip
    private String cpuSpeed; // tốc độ chip
    private String gpu; // chip đồ họa
    private String ram;
    private String storage;
    private String availableStorage;
    private String contactLimit; // danh bạ

    // Camera và màn hình
    private String rearCameraResolution ; // độ phân giải cam sau
    private List<String> rearVideoRecording; // quay phim cam sau
    private String rearFlash; // flash cam sau
    private List<String>  rearCameraFeatures; // tính năng cam sau
    private String frontCameraResolution; // độ phân giải cam trước
    private List<String> frontCameraFeatures; // tính năng cam trước

    private String displayTechnology; // công nghệ màn hình
    private String displayResolution; // độ phân giải màn hình
    private String screenSize; // màn hình rộng
    private String maxBrightness; // độ sáng tối đa
    private String screenProtection; // mặt kính cảm ứng

    //Pin và sạc
    private String batteryCapactity; // dung lượng pin
    private String batteryType; // loại pin
    private String maxChargingPower; // hỗ trợ sạc tối đa
    private List<String> batteryFeatures; // công nghệ pin

    //Tiện ích
    private List<String> securityFeatures; // bảo mật nâng cao
    private List<String> specialFeatures; // tính năng đặc biệt
    private String waterResistance;
    private List<String> recording; // ghi âm
    private List<String> video; // xem phim
    private List<String> audio; // nghe nhạc

    //Kết nối
    private String mobileNetwork; // mạng di động
    private String simType; // sim
    private List<String> wifi; // wifi
    private List<String> gps;
    private List<String> bluetooth;
    private String chargingPort;
    private String headphoneJack;
    private List<String> otherConnectivity;

    //Thiết kế và chất lượng
    private String designType; // kiểu thiết kế
    private String materials; // nguyên liệu
    private String sizeWeight; // kích thước khối lượng

    private List<String> colors;

}

