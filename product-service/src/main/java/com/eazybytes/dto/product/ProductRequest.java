package com.eazybytes.dto.product;

import com.eazybytes.dto.wiredEarphone.WiredEarphoneRequest;
import com.eazybytes.dto.wirelessEarphone.WirelessEarphoneRequest;
import com.eazybytes.dto.backupCharger.BackupChargerRequest;
import com.eazybytes.dto.cableChargerHub.CableChargerHubRequest;
import com.eazybytes.dto.headphone.HeadphoneRequest;
import com.eazybytes.dto.laptop.LaptopRequest;
import com.eazybytes.dto.phone.PhoneRequest;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;
import java.util.Map;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = PhoneRequest.class, name = "PHONE"),
        @JsonSubTypes.Type(value = LaptopRequest.class, name = "LAPTOP"),
        @JsonSubTypes.Type(value = BackupChargerRequest.class, name = "BACKUP_CHARGER"),
        @JsonSubTypes.Type(value = CableChargerHubRequest.class, name = "CABLE_CHARGER_HUB"),
        @JsonSubTypes.Type(value = WirelessEarphoneRequest.class, name = "WIRELESS_EARPHONE"),
        @JsonSubTypes.Type(value = WiredEarphoneRequest.class, name = "WIRED_EARPHONE"),
        @JsonSubTypes.Type(value = HeadphoneRequest.class, name = "HEADPHONE")


})
public class ProductRequest {
    private String productName;
    private String description;

    private String brand;
    private Map<String,List<Map<String,String>>> images;
    private String type;  // "PHONE" or "LAPTOP" or "BACKUP_CHARGER" or "CABLE_CHARGER_HUB"
    private String warrantyPeriod; // thời gian bảo hành
        private List<Map<String,String>> productReviews; // bài đánh giá sản phẩm [{'title':'...','content':'...'}]
    private List<String> promotions; // chương trình khuyến mãi
    private String release; // thời điểm ra mắt
}