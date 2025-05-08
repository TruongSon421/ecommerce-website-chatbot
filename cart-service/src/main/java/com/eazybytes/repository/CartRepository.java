package com.eazybytes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.eazybytes.model.Cart;

import feign.Param;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items WHERE c.userId = :userId")
    Optional<Cart> findByUserId(@Param("userId") String userId);
}

