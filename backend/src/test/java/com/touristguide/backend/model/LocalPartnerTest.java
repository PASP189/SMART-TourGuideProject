package com.touristguide.backend.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class LocalPartnerTest {

    @Test
    void getTrackedLink_containsTouristIdAndPartnerId() {
        LocalPartner partner = new LocalPartner();
        partner.setId(7L);

        String link = partner.getTrackedLink(3L);

        // checking the link actually contains both IDs,
        assertTrue(link.contains("3"), "Link should contain the tourist's ID");
        assertTrue(link.contains("7"), "Link should contain the partner's ID");
    }
}