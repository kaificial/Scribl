package com.birthday.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * dto for adding a message to a card
 */
@Data
public class MessageRequest {

    @NotBlank(message = "Message content is required")
    @Size(min = 1, max = 1000, message = "Message must be between 1 and 1000 characters")
    private String content;

    @Size(max = 100, message = "Author name must be less than 100 characters")
    private String author;

    // position and rotation - will be randomized if not provided
    private double x;
    private double y;
    private double rotation;

    // optional styling
    private String color;
    private String fontSize;
}
