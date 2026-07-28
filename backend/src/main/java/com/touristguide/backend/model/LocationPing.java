package com.touristguide.backend.model;

import jakarta.persistence.Embeddable;
import java.time.LocalDateTime;

@Embeddable
public class LocationPing {
    private double latitude;
    private double longitude;
    private LocalDateTime timestamp;

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

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }




}