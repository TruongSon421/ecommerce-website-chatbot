package com.eazybytes.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@AllArgsConstructor
@SuperBuilder
public class BackupCharger extends BaseProduct {
    private String batteryCapacity; // dung lượng pin
    private String chargingEfficiency; // hieu suat sac
    private String batteryCellType; // loi pin
    private List<String> technologyFeatures; // cong nghe / tien ich
    private List<String> chargingTime; // thoi gian sac day pin
    private List<String> output; // nguon ra
    private List<String> input; // nguon vao
    private String size; // kich thuoc
    private String weight; // khoi luong
    private String brandOrigin; // thuong hieu cua
    private String manufactured; // san xuat tai

    public BackupCharger() {
        setType("backup_charger");
    }
}