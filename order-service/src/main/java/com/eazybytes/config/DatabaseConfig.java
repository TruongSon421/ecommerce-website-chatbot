package com.eazybytes.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(basePackages = "com.eazybytes.repository")
public class DatabaseConfig {
    
    // Configuration cho transaction management và database connections
    // Các cấu hình connection pool được quản lý trong application.yml
    // Health monitoring có thể được thêm sau nếu cần thiết
} 