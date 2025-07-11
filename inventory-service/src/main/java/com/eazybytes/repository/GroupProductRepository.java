package com.eazybytes.repository;

import com.eazybytes.model.Group;
import com.eazybytes.model.GroupProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GroupProductRepository extends JpaRepository<GroupProduct, Integer> {

    List<GroupProduct> findByProductId(String productId);
    
    List<GroupProduct> findByGroupId(Integer groupId);

<<<<<<< HEAD
=======
    @Query("SELECT gp FROM GroupProduct gp WHERE gp.productId IN :productIds")
    List<GroupProduct> findByProductIdIn(@Param("productIds") List<String> productIds);
    

>>>>>>> server
    @Query("SELECT g.groupId FROM GroupProduct g WHERE g.productId = :productId")
    Optional<Integer> findGroupIdByProductId(@Param("productId") String productId);

    List<GroupProduct> findByProductNameContainingIgnoreCase(String query);

    List<GroupProduct> findAllByGroupIdInOrderByOrderNumberAsc(List<Integer> groupIds);

    @Query(value = "SELECT " +
    "ANY_VALUE(gp.group_product_id) as group_product_id, " +
    "ANY_VALUE(gp.created_at) as created_at, " +
    "ANY_VALUE(gp.default_current_price) as default_current_price, " +
    "ANY_VALUE(gp.default_original_price) as default_original_price, " +
    "gp.group_id, " +
    "MIN(gp.order_number) as order_number, " +
    "ANY_VALUE(gp.product_id) as product_id, " +
    "ANY_VALUE(gp.product_name) as product_name, " +
    "ANY_VALUE(gp.updated_at) as updated_at, " +
    "ANY_VALUE(gp.variant) as variant " +
    "FROM group_product_junction gp " +
    "WHERE gp.product_name LIKE CONCAT('%', :query, '%') " +
    "GROUP BY gp.group_id " +
    "ORDER BY MIN(gp.order_number)", nativeQuery = true)
    List<GroupProduct> findUniqueProductsByNameGrouped(@Param("query") String query);

    @Query("SELECT g.productId FROM GroupProduct g WHERE g.groupId = :groupId ORDER BY g.orderNumber")
    List<String> findAllProductIdsByGroupId(@Param("groupId") Integer groupId);

    List<GroupProduct> findAllByGroupIdOrderByOrderNumberAsc(Integer groupId);

    void deleteAllByGroupId(Integer groupId);

    @Modifying
    @Query("DELETE FROM GroupProduct gp WHERE gp.productId = :productId")
    void deleteByProductId(@Param("productId") String productId);
    
    @Modifying
    @Query("DELETE FROM GroupProduct gp WHERE gp.groupId = :groupId")
    void deleteByGroupId(@Param("groupId") Integer groupId);


<<<<<<< HEAD
=======
    List<GroupProduct> findAllByProductIdIn(List<String> productIds);
    
>>>>>>> server
}