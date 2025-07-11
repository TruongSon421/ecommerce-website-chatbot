package com.eazybytes.controller;

import com.eazybytes.model.Tags;
import com.eazybytes.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    @Autowired
    private TagService tagService;

    // Thêm tag
    @PostMapping
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<Tags> addTag(@RequestParam String tagName) {
        Tags tag = tagService.addTag(tagName);
        return ResponseEntity.ok(tag);
    }

    // Sửa tag
    @PutMapping("/{tagId}")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<Tags> updateTag(@PathVariable Integer tagId, @RequestParam String newTagName) {
        Tags updatedTag = tagService.updateTag(tagId, newTagName);
        return ResponseEntity.ok(updatedTag);
    }

    // Xóa tag
    @DeleteMapping("/{tagId}")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<String> deleteTag(@PathVariable Integer tagId) {
        tagService.deleteTag(tagId);
        return ResponseEntity.ok("Tag deleted successfully");
    }

    // Lấy tất cả tags
    @GetMapping("/get")
    public ResponseEntity<List<Tags>> getAllTags() {
        List<Tags> tags = tagService.getAllTags();
        return ResponseEntity.ok(tags);
    }
}