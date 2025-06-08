package com.eazybytes.converter;

import com.eazybytes.model.AddressType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class AddressTypeConverter implements AttributeConverter<AddressType, String> {
    
    @Override
    public String convertToDatabaseColumn(AddressType addressType) {
        if (addressType == null) {
            return null;
        }
        return addressType.getDisplayName();
    }
    
    @Override
    public AddressType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return AddressType.NHA_RIENG; // default
        }
        return AddressType.fromDisplayName(dbData);
    }
}