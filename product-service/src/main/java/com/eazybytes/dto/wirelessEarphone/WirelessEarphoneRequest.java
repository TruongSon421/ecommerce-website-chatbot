package com.eazybytes.dto.wirelessEarphone;

import com.eazybytes.dto.product.ProductRequest;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor

public class WirelessEarphoneRequest extends ProductRequest {
    private String batteryLife;
    private String chargingCaseBatteryLife;
    private List<String> chargingPort;
    private List<String> audioTechnology;

    private List<String> compatibility;
    private List<String> connectionApp;
    private List<String> features;

    private String simultaneousConnections;
    private List<String> connectionTechnology;
    private List<String> controlType;

    private List<String> controlButtons;

    private String size;
    private String weight;
    private String brandOrigin;
    private String manufactured;
}
