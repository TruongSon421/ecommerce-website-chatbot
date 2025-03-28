package com.eazybytes.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@AllArgsConstructor
@SuperBuilder
public class CableChargerHub extends BaseProduct {

    private String model;
    private List<String> features; // thoi gian sac day pin
    private List<String> input; // nguon vao
    private List<String> output; // nguon ra
    private String maximumCharging; // dong sac toi da
    private String size; // kich thuoc
    private List<String> technologyFeatures; // cong nghe / tien ich
    private String manufactured; // san xuat tai
    private String brandOrigin; // thuong hieu cua
    private List<String> connectionJack; // jack ket noi
    private String maximumPower; // cong suat toi da
    private String length;

    public CableChargerHub() {
        setType("CABLE_CHARGER_HUB");
    }
}