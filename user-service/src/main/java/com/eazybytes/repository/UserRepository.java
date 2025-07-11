// UserRepository.java (with additional optimized queries)
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
    
    // ✅ FIX: Query để get basic user info (không load relationships)
    @Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> findBasicUserById(@Param("id") Long id);
    
    // ✅ FIX: Query để get user với roles (khi authentication)
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.id = :id")
    Optional<User> findByIdWithRoles(@Param("id") Long id);
    
    // ✅ FIX: Query để get user với roles cho username (cần cho CustomUserDetailsService)
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.username = :username")
    Optional<User> findByUsernameWithRoles(@Param("username") String username);
    
    // Time-based counting
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :dateTime")
    Long countByCreatedAtAfter(@Param("dateTime") LocalDateTime dateTime);
    
    // ✅ FIX: Query với JOIN FETCH để load addresses cùng lúc (tránh N+1)
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.addresses LEFT JOIN FETCH u.roles")
    List<User> findAllWithAddresses();
    
    // ✅ FIX: Query với JOIN FETCH và phân trang
    @Query(value = "SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.addresses LEFT JOIN FETCH u.roles",
           countQuery = "SELECT COUNT(DISTINCT u) FROM User u")
    Page<User> findAllWithAddresses(Pageable pageable);
    
    // ✅ FIX: Query với search và JOIN FETCH (cải thiện performance)
    @Query("SELECT DISTINCT u FROM User u " +
           "LEFT JOIN FETCH u.addresses " +
           "LEFT JOIN FETCH u.roles " +
           "WHERE (:search = '' OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(u.firstName, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(u.lastName, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "CAST(u.phoneNumber AS string) LIKE CONCAT('%', :search, '%'))")
    List<User> findAllWithAddressesBySearch(@Param("search") String search);
    
    // ✅ FIX: Batch loading users với addresses
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.addresses WHERE u.id IN :ids")
    List<User> findAllByIdWithAddresses(@Param("ids") List<Long> ids);
    
    // ✅ FIX: Query để count users by role (nếu cần)
    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE r.name = :roleName")
    Long countByRoleName(@Param("roleName") String roleName);


}