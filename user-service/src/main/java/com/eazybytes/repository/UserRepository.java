// UserRepository.java (simplified)
package com.eazybytes.repository;

import com.eazybytes.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Basic finder methods
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    // Simple counting methods
    Long countByIsActive(Boolean isActive);
    
    // Only add this if your User entity has createdAt field and it's properly mapped
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :dateTime")
    Long countByCreatedAtAfter(@Param("dateTime") LocalDateTime dateTime);
    
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.addresses")
    List<User> findAllWithAddresses();
    
    // Query với JOIN FETCH và phân trang
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.addresses")
    Page<User> findAllWithAddresses(Pageable pageable);
    
    // Query với search và JOIN FETCH
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.addresses " +
           "WHERE (:search = '' OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "CAST(u.phoneNumber AS string) LIKE CONCAT('%', :search, '%'))")
    List<User> findAllWithAddressesBySearch(@Param("search") String search);
}