package com.touristguide.backend.config;

import com.touristguide.backend.model.Destination;
import com.touristguide.backend.model.LocalPartner;
import com.touristguide.backend.repository.DestinationRepository;
import com.touristguide.backend.repository.LocalPartnerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Seeds the database with starter Destinations and Travel Partners the
 * first time the app runs against an empty database.
 *
 * This is the missing piece that was causing "No partners in this category
 * for your selected destinations yet." on travel-partners.html: the
 * frontend <-> backend wiring was already correct (correct endpoint,
 * correct field names, CORS open), the local_partner table just had zero
 * rows in it, for every category, for every destination.
 *
 * Safe to leave in place: each block only inserts data if that table is
 * still empty, so it will never duplicate rows on every restart, and it
 * will never touch data you already added yourself (e.g. through the
 * admin panel).
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final DestinationRepository destinationRepository;
    private final LocalPartnerRepository localPartnerRepository;

    public DataSeeder(DestinationRepository destinationRepository,
                      LocalPartnerRepository localPartnerRepository) {
        this.destinationRepository = destinationRepository;
        this.localPartnerRepository = localPartnerRepository;
    }

    @Override
    public void run(String... args) {
        seedDestinations();
        seedPartners();
    }

    // ======================================================
    // DESTINATIONS (only runs if the table is completely empty)
    // ======================================================
    private void seedDestinations() {

        if (destinationRepository.count() > 0) {
            return;
        }

        List<Destination> destinations = Arrays.asList(
                destination("Colombo", "Western", "Colombo", "colombo.dc9a2e07764cbff7468c.jpg"),
                destination("Kandy", "Central", "Kandy", "Kandy.jpg"),
                destination("Nuwara Eliya", "Central", "Nuwara Eliya", "Nuwaraeliya.jpg"),
                destination("Galle", "Southern", "Galle", "Galle.jpg"),
                destination("Mirissa", "Southern", "Matara", "Mirissa.jpg"),
                destination("Sigiriya", "Central", "Matale", "Sigiriya.jpg"),
                destination("Anuradhapura", "North Central", "Anuradhapura", "Anuradhapura.jpg"),
                destination("Polonnaruwa", "North Central", "Polonnaruwa", "Polonnaruwa.jpg"),
                destination("Jaffna", "Northern", "Jaffna", "Jaffna.jpg"),
                destination("Trincomalee", "Eastern", "Trincomalee", "Trincomalee.jpg"),
                destination("Ella", "Uva", "Badulla", "Ella.jpg"),
                destination("Yala", "Southern", "Hambantota", "Yala.jpg")
        );

        destinationRepository.saveAll(destinations);
    }

    private Destination destination(String name, String province, String district, String image) {
        Destination d = new Destination();
        d.setName(name);
        d.setProvince(province);
        d.setDistrict(district);
        d.setImageUrl("../images/" + image);
        d.setDescription("Explore " + name + ", one of Sri Lanka's must-visit destinations.");
        d.setSafetyLevel("Safe");
        d.setFeatured(true);
        return d;
    }

    // ======================================================
    // TRAVEL PARTNERS (only runs if the table is completely empty)
    // ======================================================
    private void seedPartners() {

        if (localPartnerRepository.count() > 0) {
            return;
        }

        List<LocalPartner> partners = Arrays.asList(

                // ------------------ HOTELS ------------------
                hotel("Cinnamon Grand Colombo", "Colombo", "../images/Hotel1.jpg",
                        "4.7", "Iconic 5-star city hotel in the heart of Colombo.",
                        45000.0, List.of("Colombo")),

                hotel("Jetwing Kandy Gallery", "Kandy", "../images/Hotel2.jpg",
                        "4.5", "Boutique riverside hotel minutes from the Temple of the Tooth.",
                        28000.0, List.of("Kandy")),

                hotel("Grand Nuwara Eliya Hotel", "Nuwara Eliya", "../images/Hotel3.jpg",
                        "4.6", "Colonial-era hotel surrounded by tea country and cool mountain air.",
                        24000.0, List.of("Nuwara Eliya")),

                hotel("Amangalla Heritage Suites", "Galle", "../images/Hotel4.jpg",
                        "4.8", "Historic luxury stay inside the Galle Fort ramparts.",
                        52000.0, List.of("Galle")),

                hotel("Jaffna Heritage Villa", "Jaffna", "../images/Hotel5.jpg",
                        "4.4", "Restored Jaffna-style villa with a courtyard and rooftop dining.",
                        16000.0, List.of("Jaffna")),

                hotel("Palm Garden Anuradhapura", "Anuradhapura", "../images/Hotel6.jpg",
                        "4.3", "Quiet garden hotel close to the sacred city's ancient stupas.",
                        14500.0, List.of("Anuradhapura")),

                hotel("Trinco Blu by Cinnamon", "Trincomalee", "../images/Hotel7.jpg",
                        "4.5", "Beachfront resort on Trincomalee's Uppuveli coastline.",
                        30000.0, List.of("Trincomalee")),

                hotel("Cape Weligama", "Mirissa", "../images/Hotel8.jpg",
                        "4.9", "Clifftop luxury villas overlooking the southern coast.",
                        60000.0, List.of("Mirissa")),

                // ------------------ TRUSTED TRAVEL AGENCIES ------------------
                agency("Ceylon Roots Travels", "Island-wide", "../images/ceylontravel.jpg",
                        "4.6", "Licensed, full-service agency covering custom island-wide itineraries.",
                        8500.0,
                        List.of("Colombo", "Kandy", "Nuwara Eliya", "Galle", "Mirissa",
                                "Sigiriya", "Anuradhapura", "Polonnaruwa", "Jaffna",
                                "Trincomalee", "Ella", "Yala")),

                agency("De Zoysa Travels", "Island-wide", "../images/dezoysatravel.jpg",
                        "4.4", "Family-run licensed agency specialising in cultural triangle tours.",
                        7000.0,
                        List.of("Anuradhapura", "Polonnaruwa", "Sigiriya", "Kandy", "Colombo")),

                agency("UTC Lanka Travel", "Island-wide", "../images/utc.lktravel.jpg",
                        "4.5", "Licensed agency handling group tours, transport and local guides.",
                        9000.0,
                        List.of("Jaffna", "Trincomalee", "Nuwara Eliya", "Ella", "Yala", "Mirissa")),

                agency("MySL Travel Partners", "Island-wide", "../images/mySLtravel.webp",
                        "4.3", "Boutique licensed agency for tailor-made Sri Lanka journeys.",
                        7500.0,
                        List.of("Colombo", "Galle", "Mirissa", "Nuwara Eliya", "Jaffna")),

                // ------------------ VEHICLE RENTALS ------------------
                rental("Lanka Wheels Rent-a-Car", "Island-wide", "../images/Rent1.jpg",
                        "4.5", "Self-drive and chauffeur-driven cars, vans and SUVs with island-wide delivery.",
                        9500.0,
                        List.of("Colombo", "Kandy", "Nuwara Eliya", "Galle", "Mirissa",
                                "Sigiriya", "Anuradhapura", "Polonnaruwa", "Trincomalee", "Ella", "Yala")),

                rental("Kangaroo Cabs", "Island-wide", "../images/REnt2.jpg",
                        "4.2", "Metered taxis and long-distance cab hire available 24/7.",
                        6000.0,
                        List.of("Colombo", "Kandy", "Galle", "Nuwara Eliya")),

                rental("Northern Riders Bike & Van Rentals", "Jaffna", "../images/Rent3.jpg",
                        "4.4", "Scooters, bikes and vans for exploring the Jaffna peninsula.",
                        3500.0,
                        List.of("Jaffna")),

                rental("Hill Country Auto Rentals", "Nuwara Eliya", "../images/Rent4.jpg",
                        "4.3", "4x4 jeeps and cars built for the hill country's winding roads.",
                        8500.0,
                        List.of("Nuwara Eliya", "Ella")),

                // ------------------ TOUR GUIDES ------------------
                guide("Sunil De Silva - Cultural Triangle Guide", "Anuradhapura", "../images/Guide1.jpg",
                        "4.8", "Licensed chief guide specialising in Anuradhapura and Polonnaruwa's ancient cities.",
                        6000.0,
                        List.of("Anuradhapura", "Polonnaruwa", "Sigiriya")),

                guide("Priya Rajendram - Northern Heritage Guide", "Jaffna", "../images/Guide2.jpg",
                        "4.7", "Licensed local guide covering Jaffna's temples, lagoons and cuisine.",
                        5000.0,
                        List.of("Jaffna")),

                guide("Kamal Perera - Hill Country Guide", "Nuwara Eliya", "../images/Guide3.jpg",
                        "4.6", "Licensed guide for tea estates, hikes and train journeys through the hills.",
                        5500.0,
                        List.of("Nuwara Eliya", "Ella", "Kandy")),

                guide("Nadeesha Fernando - Coastal Guide", "Galle", "../images/Guide4.jpg",
                        "4.7", "Licensed guide for Galle Fort history walks and southern coast tours.",
                        5000.0,
                        List.of("Galle", "Mirissa", "Yala")),

                // ------------------ EXPERIENCES / ACTIVITIES ------------------
                experience("Pekoe Trail Tea Country Walk", "Nuwara Eliya", "../images/Camping.jpg",
                        "4.7", "Guided half-day walk through working tea estates and misty ridgelines.",
                        4500.0,
                        List.of("Nuwara Eliya", "Ella")),

                experience("Jaffna Lagoon Boat Safari", "Jaffna", "../images/Boatride.jpg",
                        "4.6", "Sunset boat ride through the Jaffna lagoon and its island causeways.",
                        4000.0,
                        List.of("Jaffna")),

                experience("Anuradhapura Sacred City Bike Tour", "Anuradhapura", "../images/Boatride2.jpg",
                        "4.5", "Cycle between ancient stupas and monasteries with a local host.",
                        3500.0,
                        List.of("Anuradhapura", "Polonnaruwa")),

                experience("Mirissa Whale Watching", "Mirissa", "../images/Whalewatching.jpg",
                        "4.8", "Early-morning boat trip to spot blue whales and dolphins offshore.",
                        9000.0,
                        List.of("Mirissa")),

                experience("Yala Safari Jeep Tour", "Yala", "../images/Safari1.jpg",
                        "4.7", "Half-day jeep safari through Yala National Park's leopard territory.",
                        11000.0,
                        List.of("Yala"))
        );

        localPartnerRepository.saveAll(partners);
    }

    // ---------------------- helper builders ----------------------

    private LocalPartner base(String businessName, String district, String category,
                              String image, String rating, String description,
                              Double lkrPrice, String unit, List<String> destinations) {
        LocalPartner p = new LocalPartner();
        p.setBusinessName(businessName);
        p.setName(businessName);
        p.setDistrict(district);
        p.setCategory(category);
        p.setImage(image);
        p.setRating(rating);
        p.setDescription(description);
        p.setLkrPrice(lkrPrice);
        p.setUnit(unit);
        p.setCoveredDestinations(destinations);
        p.setVerified(true);
        p.setReferralFee(10f);
        return p;
    }

    private LocalPartner hotel(String name, String district, String image, String rating,
                               String description, Double lkrPrice, List<String> destinations) {
        LocalPartner p = base(name, district, "hotel", image, rating, description,
                lkrPrice, "per_night", destinations);
        p.setFeatures(List.of("Free WiFi", "Breakfast Included", "Air Conditioning"));
        return p;
    }

    private LocalPartner agency(String name, String district, String image, String rating,
                                String description, Double lkrPrice, List<String> destinations) {
        LocalPartner p = base(name, district, "agency", image, rating, description,
                lkrPrice, "per_person", destinations);
        p.setFeatures(List.of("Licensed Agency", "Custom Itineraries", "24/7 Support"));
        return p;
    }

    private LocalPartner rental(String name, String district, String image, String rating,
                                String description, Double lkrPrice, List<String> destinations) {
        LocalPartner p = base(name, district, "rental", image, rating, description,
                lkrPrice, "per_day", destinations);
        p.setFeatures(List.of("Full Insurance", "Free Delivery", "GPS Included"));
        return p;
    }

    private LocalPartner guide(String name, String district, String image, String rating,
                               String description, Double lkrPrice, List<String> destinations) {
        LocalPartner p = base(name, district, "guide", image, rating, description,
                lkrPrice, "per_day", destinations);
        p.setFeatures(List.of("Licensed Guide", "English Speaking", "Local Expert"));
        return p;
    }

    private LocalPartner experience(String name, String district, String image, String rating,
                                    String description, Double lkrPrice, List<String> destinations) {
        LocalPartner p = base(name, district, "experience", image, rating, description,
                lkrPrice, "per_person", destinations);
        p.setFeatures(List.of("Small Groups", "Equipment Included", "Local Host"));
        return p;
    }
}