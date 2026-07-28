package com.touristguide.backend.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class LocalPartner {
    private String name;
    private boolean isVerified;
    private float referralFee;
    private String businessName;
    private String district;
    private String phone;
    private String email;
    private String address;

    // Which section of the Travel Partners page this belongs in:
    // "hotel", "agency", "rental", "guide", or "experience"
    private String category;

    private String image;
    private String rating;
    private String description;
    private String price;
    private Double usdPrice;
    private Double lkrPrice;
    private String unit;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @ElementCollection
    private List<String> features = new ArrayList<>();


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ElementCollection
    private List<String> coveredDestinations = new ArrayList<>();

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<String> getCoveredDestinations() {
        return coveredDestinations;
    }

    public void setCoveredDestinations(List<String> coveredDestinations) {
        this.coveredDestinations = coveredDestinations;
    }

    public boolean isVerified() {
        return isVerified;
    }

    public void setVerified(boolean verified) {
        isVerified = verified;
    }

    public float getReferralFee() {
        return referralFee;
    }

    public void setReferralFee(float referralFee) {
        this.referralFee = referralFee;
    }


    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getRating() {
        return rating;
    }

    public void setRating(String rating) {
        this.rating = rating;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public Double getUsdPrice() {
        return usdPrice;
    }

    public void setUsdPrice(Double usdPrice) {
        this.usdPrice = usdPrice;
    }

    public Double getLkrPrice() {
        return lkrPrice;
    }

    public void setLkrPrice(Double lkrPrice) {
        this.lkrPrice = lkrPrice;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public List<String> getFeatures() {
        return features;
    }

    public void setFeatures(List<String> features) {
        this.features = features;
    }

    public String getTrackedLink(Long touristId) {
        return "https://wa.me/94xxxxxxxxx?ref=" + touristId + "-" + this.id;
    }


    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }


}