package com.eazybytes.repository;

import com.eazybytes.model.ProductInventory;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductInventoryRepository extends JpaRepository<ProductInventory, Integer> {

    List<ProductInventory> findAllByProductId(String productId);

    Optional<ProductInventory> findByProductIdAndColor(String productId, String color);

    Optional<ProductInventory> deleteByProductIdAndColor(String productId, String color);

    List<ProductInventory> findAllByProductIdIn(List<String> productIds);

    @Modifying
    @Transactional
    void deleteAllByProductId(String productId);
}