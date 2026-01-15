package com.birthday.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Drawing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String imageData; // Base64 string

    private String authorName;

    private double x;
    private double y;
    private String userId; // Owner ID
    private Double width;
    private Double height;
    private double rotation;

    @Column(columnDefinition = "TEXT")
    private String contentJson; // JSON string of editor elements
}
