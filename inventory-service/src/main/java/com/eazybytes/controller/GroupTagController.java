package com.eazybytes.controller;

import com.eazybytes.model.GroupTags;
import com.eazybytes.service.GroupTagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/group-tags")
public class GroupTagController {

    @Autowired
    private GroupTagService groupTagService;

    // Thêm tag cho group
    @PostMapping
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<GroupTags> addTagToGroup(@RequestParam Integer groupId, @RequestParam Integer tagId) {
        GroupTags groupTag = groupTagService.addTagToGroup(groupId, tagId);
        return ResponseEntity.ok(groupTag);
    }

    // Sửa tag của group (thay tag cũ bằng tag mới)
    @PutMapping
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<GroupTags> updateTagForGroup(@RequestParam Integer groupId,
                                                       @RequestParam Integer oldTagId,
                                                       @RequestParam Integer newTagId) {
        GroupTags updatedGroupTag = groupTagService.updateTagForGroup(groupId, oldTagId, newTagId);
        return ResponseEntity.ok(updatedGroupTag);
    }

    // Xóa tag khỏi group
    @DeleteMapping
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<String> removeTagFromGroup(@RequestParam Integer groupId, @RequestParam Integer tagId) {
        groupTagService.removeTagFromGroup(groupId, tagId);
        return ResponseEntity.ok("Tag removed from group successfully");
    }

    // Lấy tất cả tags của một group
    @GetMapping("/get/{groupId}")
    public ResponseEntity<List<GroupTags>> getTagsByGroupId(@PathVariable Integer groupId) {
        List<GroupTags> groupTags = groupTagService.getTagsByGroupId(groupId);
        return ResponseEntity.ok(groupTags);
    }

    @GetMapping("/groups-by-tags")
    public ResponseEntity<List<Integer>> getGroupIdsByTagIds(@RequestParam String tagIds) {
        // Chuyển chuỗi tagIds thành List<Integer>
        List<Integer> tagIdList = Arrays.stream(tagIds.split(","))
                .map(String::trim) // Loại bỏ khoảng trắng
                .map(Integer::parseInt) // Chuyển thành Integer
                .collect(Collectors.toList());

        List<Integer> groupIds = groupTagService.getGroupIdsByTagIds(tagIdList);
        return ResponseEntity.ok(groupIds);
    }
}