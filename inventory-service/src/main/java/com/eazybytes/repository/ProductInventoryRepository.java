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

    @Query(value = "SELECT * FROM product_inventory WHERE product_id = :productId AND (color IS NULL OR color = '')", nativeQuery = true)
    Optional<ProductInventory> findByProductIdAndColorIsNullOrEmpty(@Param("productId") String productId);

    Optional<ProductInventory> deleteByProductIdAndColor(String productId, String color);

    List<ProductInventory> findAllByProductIdIn(List<String> productIds);

    @Modifying
    @Transactional
    void deleteAllByProductId(String productId);
    
    @Modifying
    @jakarta.transaction.Transactional
    @Query(value = "UPDATE product_inventory SET quantity = :quantity WHERE product_id = :productId AND " +
            "CASE WHEN :color = 'default' THEN (color IS NULL OR color = '') ELSE color = :color END", nativeQuery = true)
    int updateInventoryQuantity(@Param("productId") String productId, @Param("color") String color, @Param("quantity") Integer quantity);

    Optional<ProductInventory> findFirstByProductId(String productId);

    List<ProductInventory> findByProductId(String productId);
}