package com.eazybytes.repository;

import com.eazybytes.model.Group;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupRepository extends JpaRepository<Group, Integer> {

    Page<Group> findAllByType(String type, Pageable pageable);

    long countByType(String type);

    @Query("SELECT MAX(g.orderNumber) FROM Group g WHERE g.type = :type")
    Integer findMaxOrderNumberByType(@Param("type") String type);
}