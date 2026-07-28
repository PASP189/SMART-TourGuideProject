package com.touristguide.backend.controller;

import com.touristguide.backend.model.*;
import com.touristguide.backend.repository.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.touristguide.backend.exception.ResourceNotFoundException;

@RestController
@RequestMapping("/api/tripcarts")
@CrossOrigin(origins = "*")
public class TripCartController {

    private final TripCartRepository tripCartRepository;
    private final UserAccountRepository userAccountRepository;
    private final DestinationRepository destinationRepository;

    public TripCartController(TripCartRepository tripCartRepository,
                              UserAccountRepository userAccountRepository,
                              DestinationRepository destinationRepository) {
        this.tripCartRepository = tripCartRepository;
        this.userAccountRepository = userAccountRepository;
        this.destinationRepository = destinationRepository;
    }

    // Create a new empty trip cart for a user
    @PostMapping("/create/{userId}")
    public TripCart createCart(@PathVariable Long userId) {
        UserAccount owner = userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TripCart cart = new TripCart();
        cart.setOwner(owner);
        return tripCartRepository.save(cart);
    }

    // Get all trip carts belong to a user
    // Get ALL trip carts — used by the admin dashboard
    @GetMapping
    public List<TripCart> getAllCarts() {
        return tripCartRepository.findAll();
    }

    // Add a destination to an existing cart
    @PostMapping("/{cartId}/add-destination/{destinationId}")
    public TripCart addDestination(@PathVariable Long cartId, @PathVariable Long destinationId) {
        TripCart cart = tripCartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip cart not found"));

        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found"));

        cart.addDestination(destination);
        return tripCartRepository.save(cart);
    }

    // Remove a destination from a cart
    @DeleteMapping("/{cartId}/remove-destination/{destinationId}")
    public TripCart removeDestination(@PathVariable Long cartId, @PathVariable Long destinationId) {
        TripCart cart = tripCartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip cart not found"));

        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found"));

        cart.removeDestination(destination);
        return tripCartRepository.save(cart);
    }

    @DeleteMapping("/{cartId}")
    public String deleteCart(@PathVariable Long cartId) {
        if (!tripCartRepository.existsById(cartId)) {
            throw new ResourceNotFoundException("Trip cart not found");
        }
        tripCartRepository.deleteById(cartId);
        return "Trip cart deleted successfully";
    }

    // View one specific cart in full detail
    @GetMapping("/{cartId}")
    public TripCart getCart(@PathVariable Long cartId) {
        return tripCartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip cart not found"));
    }
}