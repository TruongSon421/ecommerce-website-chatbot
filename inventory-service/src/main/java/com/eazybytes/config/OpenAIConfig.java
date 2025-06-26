package com.eazybytes.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "openai")
public class OpenAIConfig {
    
    private Api api = new Api();
    private String model = "gpt-4o-mini";
    
    public static class Api {
        private String key;
        private String url = "https://api.openai.com/v1/chat/completions";
        
        // Getters and setters
        public String getKey() { return key; }
        public void setKey(String key) { this.key = key; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }
    
    // Getters and setters
    public Api getApi() { return api; }
    public void setApi(Api api) { this.api = api; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
}