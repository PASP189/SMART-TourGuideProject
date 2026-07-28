package com.touristguide.backend.controller;

import com.touristguide.backend.model.LocalPartner;
import com.touristguide.backend.repository.LocalPartnerRepository;
import org.springframework.web.bind.annotation.*;

import com.touristguide.backend.exception.ResourceNotFoundException;
import java.util.List;

@RestController
@RequestMapping("/api/partners")
@CrossOrigin(origins = "*")
public class LocalPartnerController {

    private final LocalPartnerRepository localPartnerRepository;

    public LocalPartnerController(LocalPartnerRepository localPartnerRepository) {
        this.localPartnerRepository = localPartnerRepository;
    }

    @GetMapping
    public List<LocalPartner> getAllPartners() {
        return localPartnerRepository.findAll();
    }

    @GetMapping("/category/{category}")
    public List<LocalPartner> getPartnersByCategory(@PathVariable String category) {
        return localPartnerRepository.findAll().stream()
                .filter(p -> category.equalsIgnoreCase(p.getCategory()))
                .toList();
    }

    @PostMapping
    public LocalPartner createPartner(@RequestBody LocalPartner partner) {
        return localPartnerRepository.save(partner);
    }

    @GetMapping("/{id}")
    public LocalPartner getPartnerById(@PathVariable Long id) {
        return localPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partner not found"));
    }

    @GetMapping("/{id}/tracked-link/{touristId}")
    public String getTrackedLink(@PathVariable Long id, @PathVariable Long touristId) {
        LocalPartner partner = localPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partner not found"));
        return partner.getTrackedLink(touristId);
    }

    @PutMapping("/{id}")
    public LocalPartner updatePartner(@PathVariable Long id, @RequestBody LocalPartner updatedData) {
        LocalPartner partner = localPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partner not found"));

        partner.setBusinessName(updatedData.getBusinessName());
        partner.setCoveredDestinations(updatedData.getCoveredDestinations());
        partner.setVerified(updatedData.isVerified());
        partner.setReferralFee(updatedData.getReferralFee());
        partner.setCategory(updatedData.getCategory());
        partner.setImage(updatedData.getImage());
        partner.setRating(updatedData.getRating());
        partner.setDescription(updatedData.getDescription());
        partner.setPrice(updatedData.getPrice());
        partner.setUsdPrice(updatedData.getUsdPrice());
        partner.setLkrPrice(updatedData.getLkrPrice());
        partner.setUnit(updatedData.getUnit());
        partner.setFeatures(updatedData.getFeatures());
        partner.setDistrict(updatedData.getDistrict());   // add this
        partner.setPhone(updatedData.getPhone());         // add this
        partner.setEmail(updatedData.getEmail());         // add this
        partner.setAddress(updatedData.getAddress());
        partner.setName(updatedData.getName());

        return localPartnerRepository.save(partner);
    }

    @DeleteMapping("/{id}")
    public String deletePartner(@PathVariable Long id) {
        if (!localPartnerRepository.existsById(id)) {
            throw new RuntimeException("Partner not found");
        }
        localPartnerRepository.deleteById(id);
        return "Partner deleted successfully";
    }
}