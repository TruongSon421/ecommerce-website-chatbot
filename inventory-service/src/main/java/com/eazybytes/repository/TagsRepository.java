package com.eazybytes.repository;

import com.eazybytes.model.Tags;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagsRepository extends JpaRepository<Tags, Integer> {
    boolean existsByTagName(String tagName);
}