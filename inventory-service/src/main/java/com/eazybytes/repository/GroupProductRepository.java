package com.eazybytes.repository;

import com.eazybytes.model.Group;
import com.eazybytes.model.GroupProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GroupProductRepository extends JpaRepository<GroupProduct, Integer> {

    @Query("SELECT g.groupId FROM GroupProduct g WHERE g.productId = :productId")
    Optional<Integer> findGroupIdByProductId(@Param("productId") String productId);
    
    List<GroupProduct> findByProductNameContainingIgnoreCase(String query);

    @Query("SELECT gp FROM GroupProduct gp " +
            "WHERE gp.productName LIKE %:query% " +
            "GROUP BY gp.groupId " +
            "ORDER BY MIN(gp.orderNumber)")
    List<GroupProduct> findUniqueProductsByNameGrouped(@Param("query") String query);

    @Query("SELECT g.productId FROM GroupProduct g WHERE g.groupId = :groupId ORDER BY g.orderNumber")
    List<String> findAllProductIdsByGroupId(@Param("groupId") Integer groupId);

    List<GroupProduct> findAllByGroupIdOrderByOrderNumberAsc(Integer groupId);

    void deleteAllByGroupId(Integer groupId);

    void deleteByProductId(String productId);

}