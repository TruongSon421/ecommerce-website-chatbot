package com.eazybytes.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class LaptopWithInventoryRequest {
    private LaptopRequest laptopRequest;
    private List<InventoryRequest> inventoryRequests;

}