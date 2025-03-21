package com.eazybytes.config;

import com.eazybytes.event.CartEvent;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    @Value("${kafka.topics.cart-events}")
    private String cartEventsTopic;

    @Value("${kafka.topics.cart-events.partitions:3}")
    private int partitions;

    @Value("${kafka.topics.cart-events.replicas:1}")
    private short replicas;

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public NewTopic createCartEventsTopic() {
        return TopicBuilder.name(cartEventsTopic)
                .partitions(partitions)
                .replicas(replicas)
                .build();
    }

    // Cấu hình ProducerFactory
    @Bean
    public ProducerFactory<String, CartEvent> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    // Cấu hình KafkaTemplate
    @Bean
    public KafkaTemplate<String, CartEvent> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}