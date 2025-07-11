package com.eazybytes.repository;

import com.eazybytes.model.BaseProduct;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends MongoRepository<BaseProduct, String> {
    List<BaseProduct> findByType(String type);
    List<BaseProduct> findByBrand(String brand);
    boolean existsByProductName(String name);
}