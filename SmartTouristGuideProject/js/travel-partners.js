// ======================================
// VISIT LANKA - TRAVEL PARTNERS
// Now connected to Spring Boot backend
// ======================================

const API_BASE = "http://localhost:8080/api";

const selectedDestinations =
    JSON.parse(localStorage.getItem("selectedDestinations")) || [];

let selectedPartners =
    JSON.parse(localStorage.getItem("selectedPartners")) || [];

// Full partner objects (not just ids) for everything the user has
// selected so far. Saved alongside selectedPartners so the Journey
// Planner page can display the selection immediately, even if the
// backend is temporarily unreachable when that page loads.
let selectedPartnerData =
    JSON.parse(localStorage.getItem("selectedPartnerData")) || [];

let allPartners = [];

const destinationContainer = document.getElementById("selectedDestinations");
const hotelContainer = document.getElementById("hotelContainer");
const agencyContainer = document.getElementById("agencyContainer");
const rentalContainer = document.getElementById("rentalContainer");
const guideContainer = document.getElementById("guideContainer");
const experienceContainer = document.getElementById("experienceContainer");

const hotelCount = document.getElementById("hotelCount");
const agencyCount = document.getElementById("agencyCount");
const rentalCount = document.getElementById("rentalCount");
const guideCount = document.getElementById("guideCount");
const experienceCount = document.getElementById("experienceCount");

// ======================================
// LOAD PARTNERS FROM BACKEND
// ======================================

async function loadPartners() {

    try {

        const response = await fetch(`${API_BASE}/partners`);

        if (!response.ok) {
            throw new Error("Server responded with " + response.status);
        }

        allPartners = await response.json();

    } catch (err) {

        console.error("Failed to load partners:", err);

        allPartners = [];

        [hotelContainer, agencyContainer, rentalContainer, guideContainer, experienceContainer]
            .forEach(c => {
                c.innerHTML =
                    "<p class='no-partners-msg'>Could not load travel partners. " +
                    "Make sure the backend server is running on localhost:8080.</p>";
            });

    }

    displaySelectedDestinations();
    displayPartners();
    updateButtons();
    updateSummary();

}

// ======================================
// DISPLAY SELECTED DESTINATIONS
// ======================================

function displaySelectedDestinations() {

    destinationContainer.innerHTML = "";

    if (selectedDestinations.length === 0) {
        destinationContainer.innerHTML = "<p>No destinations selected.</p>";
        return;
    }

    selectedDestinations.forEach(destination => {
        const tag = document.createElement("span");
        tag.textContent = destination;
        destinationContainer.appendChild(tag);
    });

}

// ======================================
// MATCH PARTNER TO SELECTED DESTINATIONS
// ======================================

function matchesSelectedDestinations(partner) {

    if (!partner.coveredDestinations || partner.coveredDestinations.length === 0) {
        return false;
    }

    return partner.coveredDestinations.some(dest =>
        selectedDestinations.some(sel => sel.toLowerCase() === dest.toLowerCase())
    );

}

function getPartnersForCategory(category) {

    return allPartners.filter(partner =>
        (partner.category || "").toLowerCase() === category &&
        matchesSelectedDestinations(partner)
    );

}

// ======================================
// PRICE LABEL
// ======================================

function priceLabel(partner) {

    if (partner.lkrPrice) {
        const unit = partner.unit ? " / " + partner.unit.replace("per_", "") : "";
        return `LKR ${Number(partner.lkrPrice).toLocaleString()}${unit}`;
    }

    return partner.price || "Contact for price";

}

// ======================================
// CREATE PARTNER CARD
// ======================================

function createPartnerCard(partner, destinationLabel) {

    const card = document.createElement("div");
    card.className = "partner-card";

    const features = (partner.features && partner.features.length)
        ? partner.features.map(f => `<span>${f}</span>`).join("")
        : "";

    card.innerHTML = `

        <div class="partner-badge">
            ⭐ ${partner.verified ? "VERIFIED" : "PENDING"}
        </div>

        <img src="${partner.image || '../images/home.jpg'}"
             alt="${partner.businessName || partner.name || ''}"
             onerror="this.onerror=null;this.src='../images/home.jpg';">

        <div class="partner-content">

            <h3>${partner.businessName || partner.name}</h3>

            <p class="partner-location">
                📍 ${destinationLabel}
            </p>

            <div class="partner-rating">
                ⭐ ${partner.rating || "N/A"}
            </div>

            <p class="partner-description">
                ${partner.description || ""}
            </p>

            <div class="partner-features">
                ${features}
            </div>

            <div class="partner-price">
                <p>Starting From</p>
                <h4>${priceLabel(partner)}</h4>
            </div>

            <button
                class="add-plan-btn"
                onclick="togglePartner('${partner.id}')">
                Add To Plan
            </button>

        </div>

    `;

    return card;

}

// ======================================
// SHOW EMPTY STATE
// ======================================

function showEmptyState(container) {
    container.innerHTML =
        `<p class="no-partners-msg">No partners in this category for your selected destinations yet.</p>`;
}

// ======================================
// RENDER A CATEGORY
// ======================================

function renderCategory(container, category) {

    container.innerHTML = "";

    const partners = getPartnersForCategory(category);

    if (partners.length === 0) {
        showEmptyState(container);
        return;
    }

    partners.forEach(partner => {

        const matchedDestination =
            (partner.coveredDestinations || []).find(dest =>
                selectedDestinations.some(sel => sel.toLowerCase() === dest.toLowerCase())
            ) || "";

        container.appendChild(createPartnerCard(partner, matchedDestination));

    });

}

// ======================================
// DISPLAY ALL PARTNERS
// ======================================

function displayPartners() {

    renderCategory(hotelContainer, "hotel");
    renderCategory(agencyContainer, "agency");
    renderCategory(rentalContainer, "rental");
    renderCategory(guideContainer, "guide");
    renderCategory(experienceContainer, "experience");

}

// ======================================
// TOGGLE PARTNER SELECTION
// ======================================

function togglePartner(id) {

    id = String(id);

    const index = selectedPartners.indexOf(id);

    if (index === -1) {

        selectedPartners.push(id);

        // Keep a full copy of the partner's details so the Journey
        // Planner page has everything it needs without relying on
        // another backend call succeeding.
        const partnerObj = allPartners.find(p => String(p.id) === id);

        if (partnerObj) {
            selectedPartnerData.push(partnerObj);
        }

    } else {

        selectedPartners.splice(index, 1);

        const dataIndex =
            selectedPartnerData.findIndex(p => String(p.id) === id);

        if (dataIndex !== -1) {
            selectedPartnerData.splice(dataIndex, 1);
        }

    }

    localStorage.setItem("selectedPartners", JSON.stringify(selectedPartners));
    localStorage.setItem("selectedPartnerData", JSON.stringify(selectedPartnerData));

    updateButtons();
    updateSummary();

}

// ======================================
// UPDATE BUTTONS
// ======================================

function updateButtons() {

    document.querySelectorAll(".add-plan-btn").forEach(button => {

        const onclickValue = button.getAttribute("onclick");
        const id = onclickValue.match(/'([^']+)'/)[1];

        if (selectedPartners.includes(id)) {
            button.classList.add("selected");
            button.innerHTML = "✔ Added";
        } else {
            button.classList.remove("selected");
            button.innerHTML = "Add To Plan";
        }

    });

}

// ======================================
// UPDATE SUMMARY
// ======================================

function updateSummary() {

    let hotels = 0, agencies = 0, rentals = 0, guides = 0, experiences = 0;

    allPartners.forEach(partner => {

        if (!selectedPartners.includes(String(partner.id))) return;

        const category = (partner.category || "").toLowerCase();

        if (category === "hotel") hotels++;
        else if (category === "agency") agencies++;
        else if (category === "rental") rentals++;
        else if (category === "guide") guides++;
        else experiences++;

    });

    hotelCount.textContent = hotels;
    agencyCount.textContent = agencies;
    rentalCount.textContent = rentals;
    guideCount.textContent = guides;
    experienceCount.textContent = experiences;

}

// ======================================
// CONTINUE BUTTON
// ======================================

document.getElementById("continuePlanner").addEventListener("click", () => {

    localStorage.setItem("selectedPartners", JSON.stringify(selectedPartners));
    localStorage.setItem("selectedPartnerData", JSON.stringify(selectedPartnerData));
    window.location.href = "journey-planner.html";

});

// ======================================
// INITIALIZE PAGE
// ======================================

loadPartners();