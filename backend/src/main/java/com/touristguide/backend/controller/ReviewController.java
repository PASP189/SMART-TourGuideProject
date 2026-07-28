package com.touristguide.backend.controller;

import jakarta.validation.Valid;
import com.touristguide.backend.model.*;
import com.touristguide.backend.repository.*;
import org.springframework.web.bind.annotation.*;
import com.touristguide.backend.exception.ResourceNotFoundException;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final UserAccountRepository userAccountRepository;
    private final LocalPartnerRepository localPartnerRepository;

    public ReviewController(ReviewRepository reviewRepository,
                            UserAccountRepository userAccountRepository,
                            LocalPartnerRepository localPartnerRepository) {
        this.reviewRepository = reviewRepository;
        this.userAccountRepository = userAccountRepository;
        this.localPartnerRepository = localPartnerRepository;
    }

    // Get ALL reviews — used by the admin dashboard
    @GetMapping
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    // Submit a review for a partner
    @PostMapping("/{authorId}/partner/{partnerId}")
    public Review createReview(@PathVariable Long authorId,
                               @PathVariable Long partnerId,
                               @Valid @RequestBody Review reviewData) {
        UserAccount author = userAccountRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        LocalPartner partner = localPartnerRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Partner not found"));

        reviewData.setAuthor(author);
        reviewData.setPartner(partner);
        return reviewRepository.save(reviewData);
    }

    // Get all reviews for a specific partner
    @GetMapping("/partner/{partnerId}")
    public List<Review> getReviewsForPartner(@PathVariable Long partnerId) {
        return reviewRepository.findByPartnerId(partnerId);
    }

    // Approve / verify a review — used by admin "approve" button
    @PutMapping("/{id}/verify")
    public Review verifyReview(@PathVariable Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        review.setVerified(true);
        return reviewRepository.save(review);
    }

    // Delete a review — used by admin "delete" button
    @DeleteMapping("/{id}")
    public void deleteReview(@PathVariable Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("Review not found");
        }
        reviewRepository.deleteById(id);
    }
}