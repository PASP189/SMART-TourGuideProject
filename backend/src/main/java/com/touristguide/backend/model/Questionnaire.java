package com.touristguide.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
public class Questionnaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private UserAccount user;

    @NotBlank(message = "Travel type is required")
    private String travelType; // e.g. "Nature", "Adventure", "Beach"

    private String budget;       // e.g. "$300"
    private String days;         // e.g. "5 Days"
    private String companions;   // e.g. "Family", "Friends", "Couple", "Solo"
    private String climate;      // e.g. "Cool", "Moderate", "Hot"
    private String accommodation; // e.g. "Hotel", "Guesthouse", "Camping"
    private String transport;    // e.g. "Private Vehicle", "Public Transport"

    @Column(length = 500)
    private String interests;    // e.g. "Wildlife, Hiking"

    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserAccount getUser() { return user; }
    public void setUser(UserAccount user) { this.user = user; }

    public String getTravelType() { return travelType; }
    public void setTravelType(String travelType) { this.travelType = travelType; }

    public String getBudget() { return budget; }
    public void setBudget(String budget) { this.budget = budget; }

    public String getDays() { return days; }
    public void setDays(String days) { this.days = days; }

    public String getCompanions() { return companions; }
    public void setCompanions(String companions) { this.companions = companions; }

    public String getClimate() { return climate; }
    public void setClimate(String climate) { this.climate = climate; }

    public String getAccommodation() { return accommodation; }
    public void setAccommodation(String accommodation) { this.accommodation = accommodation; }

    public String getTransport() { return transport; }
    public void setTransport(String transport) { this.transport = transport; }

    public String getInterests() { return interests; }
    public void setInterests(String interests) { this.interests = interests; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    // Derived fields the admin frontend expects, same pattern as Review.java
    public String getUserName() {
        return user != null ? user.getName() : null;
    }

    public String getUserEmail() {
        return user != null ? user.getEmail() : null;
    }
}