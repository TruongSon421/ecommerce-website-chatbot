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
    
    // Find addresses by user ID, ordered by default status (default first)
    @Query("SELECT a FROM Address a WHERE a.user.id = :userId ORDER BY a.isDefault DESC")
    List<Address> findByUserIdOrderByIsDefaultDesc(@Param("userId") Long userId);
    
    // Find specific address by ID and user ID
    @Query("SELECT a FROM Address a WHERE a.id = :addressId AND a.user.id = :userId")
    Optional<Address> findByIdAndUserId(@Param("addressId") Long addressId, @Param("userId") Long userId);
    
    // Find default address for user
    @Query("SELECT a FROM Address a WHERE a.user.id = :userId AND a.isDefault = true")
    Optional<Address> findByUserIdAndIsDefaultTrue(@Param("userId") Long userId);
    
    // Clear default status for all addresses of a user
    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user.id = :userId")
    void clearDefaultAddressForUser(@Param("userId") Long userId);
    
    // Delete all addresses for a user
    @Modifying
    @Query("DELETE FROM Address a WHERE a.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
    
    // Count addresses for a user
    @Query("SELECT COUNT(a) FROM Address a WHERE a.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
}