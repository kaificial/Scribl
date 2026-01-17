package com.birthday.backend.controller;

import com.birthday.backend.dto.CreateCardRequest;
import com.birthday.backend.model.Card;
import com.birthday.backend.model.Drawing;
import com.birthday.backend.model.Message;
import com.birthday.backend.repository.CardRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    @Autowired
    private CardRepository cardRepository;

    @PostMapping
    public ResponseEntity<?> createCard(@Valid @RequestBody CreateCardRequest request) {
        Card card = new Card();

        if (request.getId() == null || request.getId().isEmpty()) {
            card.setId(UUID.randomUUID().toString());
        } else {
            card.setId(request.getId());
        }

        card.setCreatorName(request.getCreatorName());
        card.setRecipientName(request.getRecipientName());

        // check if a card with this id already exists
        if (cardRepository.existsById(card.getId())) {
            return ResponseEntity.status(409).body("Card ID already exists");
        }

        return ResponseEntity.ok(cardRepository.save(card));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCard(@PathVariable String id) {
        try {
            Optional<Card> card = cardRepository.findById(id);
            if (card.isPresent()) {
                return ResponseEntity.ok(card.get());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error fetching card: " + id);
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error fetching card: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<?> addMessage(@PathVariable String id, @RequestBody Message message,
            @RequestParam(required = false) String recipientName) {
        try {
            Card card = cardRepository.findById(id).orElseGet(() -> {
                Card newCard = new Card();
                newCard.setId(id);
                newCard.setCreatorName("Anonymous");
                if (recipientName != null)
                    newCard.setRecipientName(recipientName);
                return newCard;
            });

            // pick a random spot if we dont have one
            if (message.getX() == 0 && message.getY() == 0) {
                message.setX(Math.random() * 80 + 10);
                message.setY(Math.random() * 80 + 10);
                message.setRotation((Math.random() * 20) - 10);
            }

            card.getMessages().add(message);
            return ResponseEntity.ok(cardRepository.save(card));
        } catch (Exception e) {
            System.err.println("Error adding message to card: " + id);
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error adding message: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/drawings")
    public ResponseEntity<?> addDrawing(@PathVariable String id, @RequestBody Drawing drawing,
            @RequestParam(required = false) String recipientName) {
        try {
            Card card = cardRepository.findById(id).orElseGet(() -> {
                Card newCard = new Card();
                newCard.setId(id);
                newCard.setCreatorName("Anonymous");
                if (recipientName != null)
                    newCard.setRecipientName(recipientName);
                return newCard;
            });

            // randomize where it goes
            if (drawing.getX() == 0 && drawing.getY() == 0) {
                drawing.setX(Math.random() * 60 + 20);
                drawing.setY(Math.random() * 60 + 20);
                drawing.setRotation((Math.random() * 30) - 15);
            }

            card.getDrawings().add(drawing);
            return ResponseEntity.ok(cardRepository.save(card));
        } catch (Exception e) {
            System.err.println("Error adding drawing to card: " + id);
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error adding drawing: " + e.getMessage());
        }
    }

    // update where the message is and how big it is
    @PatchMapping("/{id}/messages/{messageId}")
    public ResponseEntity<Card> updateMessage(@PathVariable String id, @PathVariable Long messageId,
            @RequestBody Message updates) {
        Card card = cardRepository.findById(id).orElseGet(() -> {
            Card newCard = new Card();
            newCard.setId(id);
            newCard.setCreatorName("Anonymous");
            return cardRepository.save(newCard);
        });

        card.getMessages().stream()
                .filter(m -> m.getId().equals(messageId))
                .findFirst()
                .ifPresent(m -> {
                    if (updates.getX() != 0)
                        m.setX(updates.getX());
                    if (updates.getY() != 0)
                        m.setY(updates.getY());
                    if (updates.getWidth() != null)
                        m.setWidth(updates.getWidth());
                    if (updates.getHeight() != null)
                        m.setHeight(updates.getHeight());
                    m.setRotation(updates.getRotation());
                });
        return ResponseEntity.ok(cardRepository.save(card));
    }

    // update the drawing position and size
    @PatchMapping("/{id}/drawings/{drawingId}")
    public ResponseEntity<Card> updateDrawing(@PathVariable String id, @PathVariable Long drawingId,
            @RequestBody Drawing updates) {
        Card card = cardRepository.findById(id).orElseGet(() -> {
            Card newCard = new Card();
            newCard.setId(id);
            newCard.setCreatorName("Anonymous");
            return cardRepository.save(newCard);
        });

        card.getDrawings().stream()
                .filter(d -> d.getId().equals(drawingId))
                .findFirst()
                .ifPresent(d -> {
                    if (updates.getX() != 0)
                        d.setX(updates.getX());
                    if (updates.getY() != 0)
                        d.setY(updates.getY());
                    if (updates.getWidth() != null)
                        d.setWidth(updates.getWidth());
                    if (updates.getHeight() != null)
                        d.setHeight(updates.getHeight());
                    d.setRotation(updates.getRotation());

                    if (updates.getImageData() != null)
                        d.setImageData(updates.getImageData());
                    if (updates.getContentJson() != null)
                        d.setContentJson(updates.getContentJson());
                });
        return ResponseEntity.ok(cardRepository.save(card));
    }

    // delete a message
    @DeleteMapping("/{id}/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable String id, @PathVariable Long messageId) {
        Optional<Card> cardOpt = cardRepository.findById(id);
        if (cardOpt.isPresent()) {
            Card card = cardOpt.get();
            boolean removed = card.getMessages().removeIf(m -> m.getId().equals(messageId));
            if (removed) {
                cardRepository.save(card);
                return ResponseEntity.ok().build();
            }
        }
        return ResponseEntity.notFound().build();
    }

    // delete a drawing
    @DeleteMapping("/{id}/drawings/{drawingId}")
    public ResponseEntity<Void> deleteDrawing(@PathVariable String id, @PathVariable Long drawingId) {
        Optional<Card> cardOpt = cardRepository.findById(id);
        if (cardOpt.isPresent()) {
            Card card = cardOpt.get();
            boolean removed = card.getDrawings().removeIf(d -> d.getId().equals(drawingId));
            if (removed) {
                cardRepository.save(card);
                return ResponseEntity.ok().build();
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/wrapped")
    public ResponseEntity<Card> updateWrappedData(@PathVariable String id, @RequestBody String wrappedData) {
        Card card = cardRepository.findById(id).orElseGet(() -> {
            Card newCard = new Card();
            newCard.setId(id);
            newCard.setCreatorName("Anonymous");
            return cardRepository.save(newCard);
        });

        card.setWrappedData(wrappedData);
        return ResponseEntity.ok(cardRepository.save(card));
    }
}
