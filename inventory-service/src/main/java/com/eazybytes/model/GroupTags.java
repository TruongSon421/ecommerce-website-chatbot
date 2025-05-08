package com.eazybytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "group_tags")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupTags {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // Khóa chính cho bảng trung gian

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group; // Liên kết với Group

    @ManyToOne
    @JoinColumn(name = "tag_id", nullable = false)
    private Tags tag; // Liên kết với Tags


}