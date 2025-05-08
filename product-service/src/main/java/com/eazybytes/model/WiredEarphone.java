package com.eazybytes.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@AllArgsConstructor
@SuperBuilder
public class WiredEarphone extends BaseProduct{
    private List<String> compatibility;
    private String audioJack;
    private String cableLength;
    private List<String> features;
    private String simultaneousConnections;
    private List<String> controlType;
    private List<String> controlButtons;
    private String weight;
    private String brandOrigin;
    private String manufactured;


    public WiredEarphone(){
        setType("wired_earphone");
    }
}
