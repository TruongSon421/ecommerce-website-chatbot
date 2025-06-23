package com.eazybytes.dto.headphone;

import com.eazybytes.dto.product.ProductRequest;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;


@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class HeadphoneRequest extends ProductRequest {
    private String batteryLife;
    private String chargingPort;
    private List<String> compatibility;
    private String audioJack;
    private String cableLength;
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
