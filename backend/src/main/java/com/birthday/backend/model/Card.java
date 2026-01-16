package com.birthday.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Data
public class Card {
    @Id
    private String id;

    private String recipientName;
    private String creatorName;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "card_id")
    private List<Message> messages = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "card_id")
    private List<Drawing> drawings = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String wrappedData; // json string with all the wrapped settings

    public Card() {
        this.id = UUID.randomUUID().toString();
    }
}
