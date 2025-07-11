package com.eazybytes.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.query_dsl.*;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ElasticsearchService {

    private final ElasticsearchClient elasticsearchClient;

    public ElasticsearchService(ElasticsearchClient elasticsearchClient) {
        this.elasticsearchClient = elasticsearchClient;
    }

    public Map<Integer, Float> getGroupScoresFromElasticsearch(String query, List<Integer> groupIds) {
        if (query == null || query.isEmpty() || groupIds.isEmpty()) {
            return Collections.emptyMap();
        }

        try {
            // 1. Build terms query for group filtering
            TermsQueryField termsQueryField = TermsQueryField.of(t -> t
                    .value(groupIds.stream()
                            .map(id -> FieldValue.of(id.longValue()))
                            .collect(Collectors.toList())));

            Query termsQuery = Query.of(q -> q
                    .terms(t -> t
                            .field("group_id")
                            .terms(termsQueryField)
                    )
            );

            // 2. Build multi-match query for both document and review fields
            Query multiMatchQuery = Query.of(q -> q
                    .multiMatch(m -> m
                            .query(query)
                            .fields("document", "review")
                            .type(TextQueryType.BestFields)
                    )
            );

            // 3. Build main search query with bool query
            Query searchQuery = Query.of(q -> q
                    .bool(b -> b
                            .must(multiMatchQuery)
                            .filter(termsQuery)
                    )
            );

            // 4. Execute search
            SearchResponse<Map> response = elasticsearchClient.search(s -> s
                            .index("products_new")
                            .query(searchQuery)
                            .size(groupIds.size()),
                    Map.class
            );

            // 5. Process results
            Map<Integer, Float> scores = new HashMap<>();
            for (Hit<Map> hit : response.hits().hits()) {
                try {
                    Object groupIdObj = hit.source().get("group_id");
                    Object scoreObj = hit.score();

                    if (groupIdObj instanceof Number) {
                        int groupId = ((Number) groupIdObj).intValue();
                        float score = scoreObj instanceof Double ?
                                ((Double) scoreObj).floatValue() :
                                (float) scoreObj;
                        scores.put(groupId, score);
                    }
                } catch (Exception e) {
                    log.warn("Error processing hit: {}", e.getMessage());
                }
            }
            
            log.info("Elasticsearch search for query '{}' returned {} results", query, scores.size());
            return scores;
            
        } catch (Exception e) {
            log.error("Elasticsearch query failed for query '{}': {}", query, e.getMessage());
            return Collections.emptyMap();
        }
    }

    /**
     * Alternative method with configurable field weights
     */
    public Map<Integer, Float> getGroupScoresWithWeights(String query, List<Integer> groupIds, 
                                                        float documentWeight, float reviewWeight) {
        if (query == null || query.isEmpty() || groupIds.isEmpty()) {
            return Collections.emptyMap();
        }

        try {
            // 1. Build terms query for group filtering
            TermsQueryField termsQueryField = TermsQueryField.of(t -> t
                    .value(groupIds.stream()
                            .map(id -> FieldValue.of(id.longValue()))
                            .collect(Collectors.toList())));

            Query termsQuery = Query.of(q -> q
                    .terms(t -> t
                            .field("group_id")
                            .terms(termsQueryField)
                    )
            );

            // 2. Build multi-match query with field weights
            Query multiMatchQuery = Query.of(q -> q
                    .multiMatch(m -> m
                            .query(query)
                            .fields("document^" + documentWeight, "review^" + reviewWeight)
                            .type(TextQueryType.BestFields)
                    )
            );

            // 3. Build main search query
            Query searchQuery = Query.of(q -> q
                    .bool(b -> b
                            .must(multiMatchQuery)
                            .filter(termsQuery)
                    )
            );

            // 4. Execute search
            SearchResponse<Map> response = elasticsearchClient.search(s -> s
                            .index("products_new")
                            .query(searchQuery)
                            .size(groupIds.size()),
                    Map.class
            );

            // 5. Process results
            Map<Integer, Float> scores = new HashMap<>();
            for (Hit<Map> hit : response.hits().hits()) {
                try {
                    Object groupIdObj = hit.source().get("group_id");
                    Object scoreObj = hit.score();

                    if (groupIdObj instanceof Number) {
                        int groupId = ((Number) groupIdObj).intValue();
                        float score = scoreObj instanceof Double ?
                                ((Double) scoreObj).floatValue() :
                                (float) scoreObj;
                        scores.put(groupId, score);
                    }
                } catch (Exception e) {
                    log.warn("Error processing hit: {}", e.getMessage());
                }
            }
            
            log.info("Elasticsearch weighted search for query '{}' returned {} results", query, scores.size());
            return scores;
            
        } catch (Exception e) {
            log.error("Elasticsearch weighted query failed for query '{}': {}", query, e.getMessage());
            return Collections.emptyMap();
        }
    }
}