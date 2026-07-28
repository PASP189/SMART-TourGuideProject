package com.touristguide.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "author_id")
    @JsonIgnore
    private UserAccount author;

    @ManyToOne
    @JoinColumn(name = "partner_id")
    @JsonIgnore
    private LocalPartner partner;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private int rating;

    @NotBlank(message = "Comment cannot be empty")
    private String comment;

    private boolean verified;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserAccount getAuthor() { return author; }
    public void setAuthor(UserAccount author) { this.author = author; }

    public LocalPartner getPartner() { return partner; }
    public void setPartner(LocalPartner partner) { this.partner = partner; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Derived fields the admin frontend expects — adjust getter names
    // below (getUsername/getEmail/getBusinessName) to match whatever
    // UserAccount / LocalPartner actually expose.
    public String getAuthorName() {
        return author != null ? author.getUsername() : null;
    }

    public String getAuthorEmail() {
        return author != null ? author.getEmail() : null;
    }

    public String getPartnerName() {
        return partner != null ? partner.getBusinessName() : null;
    }
}