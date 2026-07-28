package com.touristguide.backend.controller;

import com.touristguide.backend.exception.ResourceNotFoundException;

import com.touristguide.backend.model.Destination;
import com.touristguide.backend.repository.DestinationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinations")
@CrossOrigin(origins = "*")
public class DestinationController {

    private final DestinationRepository destinationRepository;


    public DestinationController(DestinationRepository destinationRepository) {
        this.destinationRepository = destinationRepository;
    }

    @GetMapping
    public List<Destination> getAllDestinations() {
        return destinationRepository.findAll();
    }

    @PostMapping
    public Destination createDestination(@RequestBody Destination destination) {
        return destinationRepository.save(destination);
    }

    @GetMapping("/{id}")
    public Destination getDestinationById(@PathVariable Long id) {
        return destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found"));
    }

    @PutMapping("/{id}")
    public Destination updateDestination(@PathVariable Long id, @RequestBody Destination updatedData) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found"));

        destination.setName(updatedData.getName());
        destination.setLatitude(updatedData.getLatitude());
        destination.setLongitude(updatedData.getLongitude());
        destination.setThemeTags(updatedData.getThemeTags());
        destination.setDescription(updatedData.getDescription());
        destination.setImageUrl(updatedData.getImageUrl());
        destination.setProvince(updatedData.getProvince());
        destination.setDistrict(updatedData.getDistrict());
        destination.setMapLink(updatedData.getMapLink());
        destination.setOpeningHours(updatedData.getOpeningHours());
        destination.setUsdPrice(updatedData.getUsdPrice());
        destination.setLkrPrice(updatedData.getLkrPrice());
        destination.setSafetyLevel(updatedData.getSafetyLevel());
        destination.setFeatured(updatedData.isFeatured());

        return destinationRepository.save(destination);
    }

    @DeleteMapping("/{id}")
    public String deleteDestination(@PathVariable Long id) {
        if (!destinationRepository.existsById(id)) {
            throw new RuntimeException("Destination not found");
        }
        destinationRepository.deleteById(id);
        return "Destination deleted successfully";
    }
}