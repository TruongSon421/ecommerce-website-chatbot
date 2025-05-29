package com.eazybytes;

import com.eazybytes.config.TestConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = {
    "eureka.client.enabled=false",
    "spring.cloud.discovery.enabled=false",
    "spring.cloud.config.enabled=false",
    "spring.kafka.bootstrap-servers=",
    "spring.data.redis.host=localhost",
    "spring.data.redis.port=6379",
    "spring.cloud.openfeign.client.config.default.url=http://localhost:8080"
})
@ActiveProfiles("test")
@Import(TestConfig.class)
class CartServiceApplicationTests {

    @Test
    void contextLoads() {
        // Test để đảm bảo Spring context load thành công
    }
} 