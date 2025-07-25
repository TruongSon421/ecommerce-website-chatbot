// RoleRepository.java
package com.eazybytes.repository;

import com.eazybytes.model.Role;
import com.eazybytes.model.ERole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);
}