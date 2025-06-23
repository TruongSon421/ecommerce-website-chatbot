package com.eazybytes.service;

import com.eazybytes.model.Tags;
import com.eazybytes.repository.TagsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TagService {

    @Autowired
    private TagsRepository tagsRepository;

    // Thêm tag
    public Tags addTag(String tagName) {
        if (tagsRepository.existsByTagName(tagName)) {
            throw new RuntimeException("Tag '" + tagName + "' already exists");
        }
        Tags tag = Tags.builder().tagName(tagName).build();
        return tagsRepository.save(tag);
    }

    // Sửa tag
    public Tags updateTag(Integer tagId, String newTagName) {
        Optional<Tags> optionalTag = tagsRepository.findById(tagId);
        if (optionalTag.isEmpty()) {
            throw new RuntimeException("Tag with ID " + tagId + " not found");
        }
        if (tagsRepository.existsByTagName(newTagName)) {
            throw new RuntimeException("Tag '" + newTagName + "' already exists");
        }
        Tags tag = optionalTag.get();
        tag.setTagName(newTagName);
        return tagsRepository.save(tag);
    }

    // Xóa tag
    public void deleteTag(Integer tagId) {
        if (!tagsRepository.existsById(tagId)) {
            throw new RuntimeException("Tag with ID " + tagId + " not found");
        }
        tagsRepository.deleteById(tagId);
    }

    // Lấy tất cả tags
    public List<Tags> getAllTags() {
        return tagsRepository.findAll();
    }
}