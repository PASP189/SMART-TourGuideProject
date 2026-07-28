package com.touristguide.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

@Entity
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @NotBlank means that this field can't be empty, and can't be just spaces.
    @NotBlank(message = "Name is required")
    private String name;

    // @Email checks the text actually looks like a real email address.
    // @Column(unique = true) stops the database from ever storing two
    // accounts with the same email again.
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Column(unique = true)
    private String email;

    // @Size sets a minimum/maximum length  at least 6 characters for a password
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    // Optional - not every registration flow (e.g. public site) collects
    // this, so it's left nullable rather than @NotBlank.
    @Column(unique = true)
    private String username;

    // Plain string rather than an enum for now to keep this change small.
    // Expected values: "User" or "Admin". Defaults to "User" so existing
    // registration flows that don't send a role still work.
    private String role = "User";
    private String status = "Active";

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    private List<TripCart> savedTrips = new ArrayList<>();

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL)
    private List<Review> reviews = new ArrayList<>();


    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public String getRole() {
        return role;
    }
    public void setRole(String role) {
        this.role = role;
    }
    public List<TripCart> getSavedTrips() {
        return savedTrips;
    }
    public void setSavedTrips(List<TripCart> savedTrips) {
        this.savedTrips = savedTrips;
    }
    public List<Review> getReviews() {
        return reviews;
    }
    public void setReviews(List<Review> reviews) {
        this.reviews = reviews;
    }
}