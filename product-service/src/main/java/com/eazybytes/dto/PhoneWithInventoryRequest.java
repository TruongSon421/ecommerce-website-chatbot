package com.eazybytes.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PhoneWithInventoryRequest {
    private PhoneRequest phoneRequest;
    private List<InventoryRequest> inventoryRequests;

}