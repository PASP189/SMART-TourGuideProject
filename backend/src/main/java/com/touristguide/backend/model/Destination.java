package com.touristguide.backend.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private double latitude;
    private double longitude;
    private String province;
    private String district;
    private String mapLink;
    private String openingHours;
    private Double usdPrice;
    private Double lkrPrice;
    private String safetyLevel;
    private boolean featured;

    @Column(length = 1000)
    private String description;

    @Column(columnDefinition = "LONGTEXT")
    private String imageUrl;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SafetyGuideline getSafetyInfo() {
        return safetyInfo;
    }

    public void setSafetyInfo(SafetyGuideline safetyInfo) {
        this.safetyInfo = safetyInfo;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<String> getThemeTags() {
        return themeTags;
    }

    public void setThemeTags(List<String> themeTags) {
        this.themeTags = themeTags;
    }

    @ElementCollection
    private List<String> themeTags = new ArrayList<>();

    @OneToOne(mappedBy = "destination", cascade = CascadeType.ALL)
    private SafetyGuideline safetyInfo;

    public boolean matchThemes(List<String> themes) {
        return themeTags.stream().anyMatch(themes::contains);
    }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getMapLink() { return mapLink; }
    public void setMapLink(String mapLink) { this.mapLink = mapLink; }

    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }

    public Double getUsdPrice() { return usdPrice; }
    public void setUsdPrice(Double usdPrice) { this.usdPrice = usdPrice; }

    public Double getLkrPrice() { return lkrPrice; }
    public void setLkrPrice(Double lkrPrice) { this.lkrPrice = lkrPrice; }

    public String getSafetyLevel() { return safetyLevel; }
    public void setSafetyLevel(String safetyLevel) { this.safetyLevel = safetyLevel; }

    public boolean isFeatured() { return featured; }
    public void setFeatured(boolean featured) { this.featured = featured; }
}