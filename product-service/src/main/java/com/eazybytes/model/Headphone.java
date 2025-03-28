package com.eazybytes.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@AllArgsConstructor
@SuperBuilder
public class Headphone extends BaseProduct{
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

    public Headphone(){
        setType("HEADPHONE");
    }
}
