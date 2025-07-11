package com.eazybytes.dto.cableChargerHub;

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
public class CableChargerHubRequest extends ProductRequest {
    private String model; // cong nghe / tien ich
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
    private String length; // do dai day

}
