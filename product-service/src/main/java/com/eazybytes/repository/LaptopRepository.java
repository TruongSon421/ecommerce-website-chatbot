package com.eazybytes.repository;

import com.eazybytes.model.Laptop;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LaptopRepository extends MongoRepository<Laptop, String> {
    List<Laptop> findByType(String type);
    List<Laptop> findByBrand(String brand);

}