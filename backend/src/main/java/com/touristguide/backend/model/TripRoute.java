package com.touristguide.backend.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class TripRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String travelMode; // walking, driving, transit
    private float totalDistanceKm;
    private int totalDurationMin;
    private String polylineEncoded;

    @ManyToMany
    @JoinTable(
            name = "route_stops",
            joinColumns = @JoinColumn(name = "route_id"),
            inverseJoinColumns = @JoinColumn(name = "destination_id")
    )
    @OrderColumn(name = "stop_order")
    private List<Destination> orderedStops = new ArrayList<>();

    public void calculateRoute() {
        /* call a routing API (e.g. Google Directions) here,
        then set totalDistanceKm, totalDurationMin*/
    }

    public void optimizeStopOrder() {
        //  reorder orderedStops for the shortest path
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTravelMode() {
        return travelMode;
    }

    public void setTravelMode(String travelMode) {
        this.travelMode = travelMode;
    }

    public float getTotalDistanceKm() {
        return totalDistanceKm;
    }

    public void setTotalDistanceKm(float totalDistanceKm) {
        this.totalDistanceKm = totalDistanceKm;
    }

    public int getTotalDurationMin() {
        return totalDurationMin;
    }

    public void setTotalDurationMin(int totalDurationMin) {
        this.totalDurationMin = totalDurationMin;
    }

    public String getPolylineEncoded() {
        return polylineEncoded;
    }

    public void setPolylineEncoded(String polylineEncoded) {
        this.polylineEncoded = polylineEncoded;
    }

    public List<Destination> getOrderedStops() {
        return orderedStops;
    }

    public void setOrderedStops(List<Destination> orderedStops) {
        this.orderedStops = orderedStops;
    }

    public boolean isRealisticForDuration(int days) {
        int estimatedMinutesNeeded = orderedStops.size() * 120;
        int availableMinutes = days * 8 * 60;
        return estimatedMinutesNeeded <= availableMinutes;
    }


}