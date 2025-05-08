package com.eazybytes.repository;

import com.eazybytes.model.GroupTags;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupTagsRepository extends JpaRepository<GroupTags, Integer> {
    List<GroupTags> findByGroup_GroupId(Integer groupId);
    boolean existsByGroup_GroupIdAndTag_TagId(Integer groupId, Integer tagId);
    void deleteByGroup_GroupIdAndTag_TagId(Integer groupId, Integer tagId);
    List<GroupTags> findByTagTagIdIn(List<Integer> tagIds);
}