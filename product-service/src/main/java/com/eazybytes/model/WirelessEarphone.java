package com.eazybytes.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@AllArgsConstructor
@SuperBuilder
public class WirelessEarphone extends BaseProduct{
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

    public WirelessEarphone(){
        setType("wireless_earphone");
    }
}
