package com.touristguide.backend.controller;

import com.touristguide.backend.model.*;
import com.touristguide.backend.repository.*;
import org.springframework.web.bind.annotation.*;

import com.touristguide.backend.exception.ResourceNotFoundException;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "*")
public class TripProgressController {

    private final TripProgressRepository tripProgressRepository;
    private final DestinationRepository destinationRepository;

    public TripProgressController(TripProgressRepository tripProgressRepository,
                                  DestinationRepository destinationRepository) {
        this.tripProgressRepository = tripProgressRepository;
        this.destinationRepository = destinationRepository;
    }

    // Start tracking a trip
    @PostMapping
    public TripProgress startProgress() {
        TripProgress progress = new TripProgress();
        progress.setPercentComplete(0);
        return tripProgressRepository.save(progress);
    }

    // Update nearest destination + percent complete
    @PutMapping("/{progressId}/checkpoint")
    public TripProgress updateCheckpoint(@PathVariable Long progressId,
                                         @RequestParam Long nearestDestinationId,
                                         @RequestParam float percentComplete) {
        TripProgress progress = tripProgressRepository.findById(progressId)
                .orElseThrow(() -> new ResourceNotFoundException("Progress not found"));

        Destination nearest = destinationRepository.findById(nearestDestinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found"));

        progress.setCurrentNearest(nearest);
        progress.setPercentComplete(percentComplete);

        return tripProgressRepository.save(progress);
    }

    // Get current status (uses  getCurrentStatus() method)
    @GetMapping("/{progressId}/status")
    public String getStatus(@PathVariable Long progressId) {
        TripProgress progress = tripProgressRepository.findById(progressId)
                .orElseThrow(() -> new ResourceNotFoundException("Progress not found"));
        return progress.getCurrentStatus();
    }

    // Check if near a specific destination
    @GetMapping("/{progressId}/near/{destinationId}")
    public boolean isNearDestination(@PathVariable Long progressId, @PathVariable Long destinationId) {
        TripProgress progress = tripProgressRepository.findById(progressId)
                .orElseThrow(() -> new ResourceNotFoundException("Progress not found"));
        Destination dest = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found"));

        return progress.triggerSafetyAlertIfNear(dest);
    }
}