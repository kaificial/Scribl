package com.birthday.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * dto for creating a new card with validation
 */
@Data
public class CreateCardRequest {

    @Pattern(regexp = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$", message = "ID must be a valid UUID format")
    private String id;

    @NotBlank(message = "Creator name is required")
    @Size(min = 1, max = 100, message = "Creator name must be between 1 and 100 characters")
    private String creatorName;

    @Size(max = 100, message = "Recipient name must be less than 100 characters")
    private String recipientName;
}
