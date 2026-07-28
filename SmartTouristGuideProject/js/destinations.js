// ===============================
// VISIT LANKA - DESTINATIONS PAGE
// Now connected to Spring Boot backend
// ===============================

const API_BASE = "http://localhost:8080/api";

const params = new URLSearchParams(window.location.search);

const isRecommended =
params.get("recommended") === "true";

const hero = document.querySelector(".hero");
const searchBox = document.querySelector(".search-box");
const recommendSection = document.querySelector(".recommend");
const filterTitle = document.querySelector(".filter h2");
const cardsSection = document.querySelector(".cards");

if (isRecommended) {

    hero.style.display = "none";

    searchBox.style.display = "none";

    recommendSection.style.display = "none";

    filterTitle.innerHTML =
    "⭐ Recommended Destinations For You";

}

const questionnaireData = JSON.parse(
    localStorage.getItem("questionnaireData")
);

console.log(questionnaireData);

const tripCount = document.getElementById("tripCount");
const selectedList = document.getElementById("selectedList");
const continueBtn = document.getElementById("continueBtn");

// Load saved destinations
let selectedDestinations =
    JSON.parse(localStorage.getItem("selectedDestinations")) || [];


// ===============================
// FETCH DESTINATIONS FROM BACKEND
// ===============================

async function loadDestinations() {

    cardsSection.innerHTML =
        "<p class='loading-msg'>Loading destinations...</p>";

    try {

        const response = await fetch(`${API_BASE}/destinations`);

        if (!response.ok) {
            throw new Error("Server responded with " + response.status);
        }

        const destinations = await response.json();

        renderCards(destinations);

    } catch (err) {

        console.error("Failed to load destinations:", err);

        cardsSection.innerHTML =
            "<p class='error-msg'>Could not load destinations. " +
            "Make sure the backend server is running on localhost:8080.</p>";

    }

}


// ===============================
// BUILD CARD HTML FROM BACKEND DATA
// ===============================

function renderCards(destinations) {

    if (!destinations || destinations.length === 0) {

        cardsSection.innerHTML =
            "<p class='empty-msg'>No destinations found.</p>";

        return;

    }

    // Remove duplicate destinations (same name, case-insensitive)
    // in case the backend/database returns repeated rows.
    const seenNames = new Set();

    const uniqueDestinations = destinations.filter(destination => {

        const key = (destination.name || "").trim().toLowerCase();

        if (!key || seenNames.has(key)) {
            return false;
        }

        seenNames.add(key);
        return true;

    });

    cardsSection.innerHTML = uniqueDestinations.map(buildCardHTML).join("");

    // Cards are now in the DOM, so (re)attach behavior
    attachTripButtonEvents();

}


// Known image filenames that actually exist in ../images.
// Used to map a destination name to the correct file even if the
// spacing/casing in the database doesn't exactly match the filename.
const KNOWN_IMAGES = {
    "sigiriya": "Sigiriya.jpg",
    "sigiriya rock fortress": "Sigiriya.jpg",
    "ella": "Ella.jpg",
    "mirissa": "Mirissa.jpg",
    "yala national park": "Yala.jpg",
    "yala": "Yala.jpg",
    "nuwara eliya": "Nuwara eliya.jpg",
    "galle fort": "Galle.jpg",
    "galle": "Galle.jpg",
    "unawatuna": "Unawatuna.jpg",
    "arugam bay": "Arugam Bay.jpg",
    "anuradhapura": "Anuradhapura.jpg",
    "bentota beach": "Bentota.jpg",
    "bentota": "Bentota.jpg",
    "nine arch bridge": "NineArchBridge.jpg"
};


function buildCardHTML(destination) {

    const name = destination.name || "Unknown";

    const nameKey = name.trim().toLowerCase();

    // Priority: real imageUrl from the database, then a known
    // filename lookup, then a best-effort guess from the name.
    const guessedImage =
        destination.imageUrl
            ? destination.imageUrl
            : KNOWN_IMAGES[nameKey]
                ? `../images/${KNOWN_IMAGES[nameKey]}`
                : `../images/${name}.jpg`;

    const tags = Array.isArray(destination.themeTags)
        ? destination.themeTags
        : [];

    // Use the real description from the database if set, otherwise
    // fall back to a short auto-generated line built from theme tags.
    const description = destination.description
        ? destination.description
        : (tags.length > 0
            ? `Explore ${name}, known for ${tags.join(", ")}.`
            : `Explore ${name}.`);

    const tagsHTML = tags
        .map(tag => `<span>${capitalize(tag)}</span>`)
        .join("");

    return `
        <div class="card">

            <img src="${guessedImage}"
                 alt="${name}"
                 onerror="this.onerror=null;this.src='../images/home.jpg';">

            <div class="content">

                <h3>${name}</h3>

                <p>${description}</p>

                <div class="tags">
                    ${tagsHTML}
                </div>

                <p class="location">
                    📍 Lat ${destination.latitude ?? "N/A"},
                    Long ${destination.longitude ?? "N/A"}
                </p>

                <div class="card-buttons">

                    <button class="trip-btn"
                            data-place="${name}">

                        <i class="fa-solid fa-plus"></i>
                        Add to Trip

                    </button>

                </div>

            </div>

        </div>
    `;

}


function capitalize(word) {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1);
}


// ===============================
// TRIP PANEL LOGIC (unchanged)
// ===============================

function saveTrip() {

    localStorage.setItem(
        "selectedDestinations",
        JSON.stringify(selectedDestinations)
    );

}


function updateTripPanel() {

    tripCount.textContent =
        selectedDestinations.length +
        " Destination(s) Selected";

    selectedList.innerHTML = "";

    if (selectedDestinations.length === 0) {

        selectedList.innerHTML =
        "<p class='empty-trip'>No destinations selected yet.</p>";

        continueBtn.disabled = true;

    }

    else {

        selectedDestinations.forEach(place => {

            selectedList.innerHTML +=

            `
            <div class="selected-item">

                <i class="fa-solid fa-circle-check"></i>

                ${place}

            </div>
            `;

        });

        continueBtn.disabled = false;

    }

}


// ===============================
// BUTTON APPEARANCE (unchanged)
// ===============================

function refreshButtons() {

    const tripButtons = document.querySelectorAll(".trip-btn");

    tripButtons.forEach(button => {

        const place = button.dataset.place;

        if (selectedDestinations.includes(place)) {

            button.classList.add("added");

            button.innerHTML =

            `<i class="fa-solid fa-check"></i>
             Added`;

        }

        else {

            button.classList.remove("added");

            button.innerHTML =

            `<i class="fa-solid fa-plus"></i>
             Add to Trip`;

        }

    });

}


// ===============================
// BUTTON CLICK EVENTS
// Re-attached every time cards are rebuilt from the API
// ===============================

function attachTripButtonEvents() {

    const tripButtons = document.querySelectorAll(".trip-btn");

    tripButtons.forEach(button => {

        button.addEventListener("click", () => {

            const place = button.dataset.place;

            if (selectedDestinations.includes(place)) {

                selectedDestinations =
                    selectedDestinations.filter(item => item !== place);

            }

            else {

                selectedDestinations.push(place);

            }

            saveTrip();

            updateTripPanel();

            refreshButtons();

        });

    });

    // Make sure freshly-rendered buttons reflect saved selections
    refreshButtons();

}


// -------------------------------
// Continue Button
// -------------------------------

continueBtn.addEventListener("click", () => {

    window.location.href = "travel-partners.html";

});

// -------------------------------
// Initialize Page
// -------------------------------

updateTripPanel();

loadDestinations();
