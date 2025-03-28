package com.eazybytes.dto.backupCharger;

import com.eazybytes.dto.product.ProductRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class BackupChargerRequest extends ProductRequest {
    private String batteryCapactity; // dung lượng pin
    private String chargingEfficiency; // hieu suat sac
    private String batteryCellType; // loi pin
    private List<String> technologyFeatures; // cong nghe / tien ich
    private List<String> chargingTime; // thoi gian sac day pin
    private List<String> output; // nguon ra
    private List<String> input; // nguon vao
    private String size; // kich thuoc
    private String weight; // khoi luong
    private String brandOrigin;
    private String manufactured; // san xuat tai
}
