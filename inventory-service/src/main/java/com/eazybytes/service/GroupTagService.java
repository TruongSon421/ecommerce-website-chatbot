package com.eazybytes.service;

import com.eazybytes.model.Group;
import com.eazybytes.model.GroupTags;
import com.eazybytes.model.Tags;
import com.eazybytes.repository.GroupRepository;
import com.eazybytes.repository.GroupTagsRepository;
import com.eazybytes.repository.TagsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GroupTagService {

    @Autowired
    private GroupTagsRepository groupTagsRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private TagsRepository tagsRepository;

    // Thêm tag cho group
    public GroupTags addTagToGroup(Integer groupId, Integer tagId) {
        Optional<Group> optionalGroup = groupRepository.findById(groupId);
        Optional<Tags> optionalTag = tagsRepository.findById(tagId);

        if (optionalGroup.isEmpty()) {
            throw new RuntimeException("Group with ID " + groupId + " not found");
        }
        if (optionalTag.isEmpty()) {
            throw new RuntimeException("Tag with ID " + tagId + " not found");
        }
        if (groupTagsRepository.existsByGroup_GroupIdAndTag_TagId(groupId, tagId)) {
            throw new RuntimeException("Tag already assigned to this group");
        }

        Group group = optionalGroup.get();
        Tags tag = optionalTag.get();
        GroupTags groupTag = GroupTags.builder().group(group).tag(tag).build();
        return groupTagsRepository.save(groupTag);
    }

    // Xóa tag khỏi group
    public void removeTagFromGroup(Integer groupId, Integer tagId) {
        if (!groupTagsRepository.existsByGroup_GroupIdAndTag_TagId(groupId, tagId)) {
            throw new RuntimeException("Tag with ID " + tagId + " not found in Group with ID " + groupId);
        }
        groupTagsRepository.deleteByGroup_GroupIdAndTag_TagId(groupId, tagId);
    }

    // Sửa tag của group (thay tag cũ bằng tag mới)
    public GroupTags updateTagForGroup(Integer groupId, Integer oldTagId, Integer newTagId) {
        removeTagFromGroup(groupId, oldTagId); // Xóa tag cũ
        return addTagToGroup(groupId, newTagId); // Thêm tag mới
    }

    // Lấy tất cả tags của một group
    public List<GroupTags> getTagsByGroupId(Integer groupId) {
        return groupTagsRepository.findByGroup_GroupId(groupId);
    }

    public List<Integer> getGroupIdsByTagIds(List<Integer> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return List.of();
        }

        List<GroupTags> groupTags = groupTagsRepository.findByTagTagIdIn(tagIds);

        Map<Integer, Long> groupTagCount = groupTags.stream()
                .collect(Collectors.groupingBy(
                        gt -> gt.getGroup().getGroupId(),
                        Collectors.counting()
                ));

        return groupTagCount.entrySet().stream()
                .filter(entry -> entry.getValue() == tagIds.size())
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }
}