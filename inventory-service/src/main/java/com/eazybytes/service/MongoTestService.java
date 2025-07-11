// Test MongoDB Connection
package com.eazybytes.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class MongoTestService {

    @Autowired
    private MongoTemplate mongoTemplate;

    @PostConstruct
    public void testConnection() {
        try {
            // Test MongoDB connection
            long count = mongoTemplate.count(new Query(), "baseProduct");
            log.info("MongoDB connection successful! Found {} documents in baseProduct collection", count);
            
            // Log collection names
            log.info("Available collections: {}", mongoTemplate.getCollectionNames());
            
        } catch (Exception e) {
            log.error("MongoDB connection failed: ", e);
        }
    }
}