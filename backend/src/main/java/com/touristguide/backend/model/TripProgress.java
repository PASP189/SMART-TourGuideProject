package com.touristguide.backend.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class TripProgress {

    private float percentComplete;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Destination currentNearest;

    @ElementCollection
    private List<LocationPing> checkpoints = new ArrayList<>();


    public String getCurrentStatus() {
        String nearest = (currentNearest != null) ? currentNearest.getName() : "none";
        return percentComplete + "% complete, nearest: " + nearest;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Destination getCurrentNearest() {
        return currentNearest;
    }

    public void setCurrentNearest(Destination currentNearest) {
        this.currentNearest = currentNearest;
    }

    public List<LocationPing> getCheckpoints() {
        return checkpoints;
    }

    public void setCheckpoints(List<LocationPing> checkpoints) {
        this.checkpoints = checkpoints;
    }

    public float getPercentComplete() {
        return percentComplete;
    }

    public void setPercentComplete(float percentComplete) {
        this.percentComplete = percentComplete;
    }

    public boolean triggerSafetyAlertIfNear(Destination dest) {
        return currentNearest != null && currentNearest.getId().equals(dest.getId());
    }


}