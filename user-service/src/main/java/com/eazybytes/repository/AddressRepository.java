// AddressRepository.java (simplified)
package com.eazybytes.repository;

import com.eazybytes.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    
    // Existing methods
    List<Address> findByUserIdOrderByIsDefaultDesc(Long userId);
    Optional<Address> findByIdAndUserId(Long id, Long userId);
    void deleteByUserId(Long userId);
    
    // ✅ NEW: Find addresses by user ordered by creation date (most recent first)
    List<Address> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // ✅ NEW: Clear default address for user
    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user.id = :userId")
    void clearDefaultAddressForUser(@Param("userId") Long userId);
    
    // ✅ NEW: Check if user has any addresses
    boolean existsByUserId(Long userId);
    
    // ✅ NEW: Count addresses for user
    long countByUserId(Long userId);
}