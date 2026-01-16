package com.birthday.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;
    private String authorName;
    private double x;
    private double y;
    private double rotation;
    private String userId; // who made this
    private Double width;
    private Double height;
    private String fontFamily; // either serif or sans
}
