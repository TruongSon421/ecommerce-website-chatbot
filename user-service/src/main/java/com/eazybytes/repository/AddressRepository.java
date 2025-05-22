package com.eazybytes.repository;

import com.eazybytes.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {
    @Query("SELECT a FROM Address a WHERE a.id = :addressId AND a.user.id = :userId")
    Optional<Address> findByIdAndUserId(Long addressId, Long userId);
}