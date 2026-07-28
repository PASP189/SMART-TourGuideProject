// ===============================
// VISIT LANKA ADMIN - DASHBOARD
// Now connected to Spring Boot backend
// ===============================

const API_BASE = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {

    loadOverviewCounts();
    loadPendingPartners();

    // -------------------------------
    // Add User / Add Destination buttons
    // -------------------------------

    const addUserBtn = document.getElementById("addUserBtn");
    const addDestinationBtn = document.getElementById("addDestination");

    if (addUserBtn) {
        addUserBtn.addEventListener("click", () => {
            window.location.href = "manage-users.html";
        });
    }

    if (addDestinationBtn) {
        addDestinationBtn.addEventListener("click", () => {
            window.location.href = "manage-destinations.html";
        });
    }

    const loggedUser = JSON.parse(localStorage.getItem("loggedUser") || "null");
    const adminNameEl = document.querySelector(".admin-details h4");

    if (loggedUser && adminNameEl) {
        adminNameEl.textContent = loggedUser.name;
    }

    // -------------------------------
    // Edit / Delete buttons in the preview tables
    // (Previously unwired - clicking them did nothing.)
    // Using event delegation on the document so this also
    // works if rows are ever re-rendered dynamically.
    // -------------------------------

    document.addEventListener("click", (e) => {

        const editBtn = e.target.closest(".edit-btn");
        const deleteBtn = e.target.closest(".delete-btn");

        if (editBtn) {
            const id = editBtn.dataset.id;
            const section = editBtn.closest("section");

            if (section && section.id === "users") {
                window.location.href = `manage-users.html?edit=${id}`;
            } else if (section && section.id === "destinations") {
                window.location.href = `manage-destinations.html?edit=${id}`;
            }
            return;
        }

        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            const section = deleteBtn.closest("section");

            const confirmed = confirm("Are you sure you want to delete this item?");
            if (!confirmed) return;

            if (section && section.id === "users") {
                window.location.href = `manage-users.html?delete=${id}`;
            } else if (section && section.id === "destinations") {
                window.location.href = `manage-destinations.html?delete=${id}`;
            }
            return;
        }

    });

    // -------------------------------
    // Activity carousel (unchanged - not backend data)
    // -------------------------------

    const track = document.querySelector(".activity-track");
    const cards = document.querySelectorAll(".activity-card");
    const next = document.getElementById("nextActivity");
    const prev = document.getElementById("prevActivity");
    let index = 0;

    function updateSlider() {
        if (track) track.style.transform = `translateX(-${index * 100}%)`;
    }

    if (next) {
        next.onclick = function () {
            index++;
            if (index >= cards.length) index = 0;
            updateSlider();
        };
    }

    if (prev) {
        prev.onclick = function () {
            index--;
            if (index < 0) index = cards.length - 1;
            updateSlider();
        };
    }

});


// ===============================
// PENDING PARTNER VERIFICATION (dashboard preview)
// ===============================

async function loadPendingPartners() {

    const grid = document.getElementById("pendingPartnersGrid");
    if (!grid) return;

    try {

        const response = await fetch(`${API_BASE}/partners`);
        if (!response.ok) throw new Error("Server responded with " + response.status);

        const partners = await response.json();
        const pending = partners.filter(p => !p.verified).slice(0, 2);

        renderPendingPartners(pending);

    } catch (err) {
        console.error("Failed to load pending partners:", err);
        grid.innerHTML = "<p>Could not load partners. Make sure the backend server is running on localhost:8080.</p>";
    }

}


function renderPendingPartners(partners) {

    const grid = document.getElementById("pendingPartnersGrid");
    if (!grid) return;

   if (partners.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-check"></i>
                <h3>All Caught Up!</h3>
                <p>There are no pending travel partners waiting for verification right now.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = "";

    partners.forEach(partner => {

        const card = document.createElement("div");
        card.className = "partner-card";
        card.dataset.id = partner.id;

        card.innerHTML = `
            <div class="partner-top">
                <div>
                    <h3>${partner.businessName || "Unnamed Partner"}</h3>
                    <span>${partner.category || "—"}</span>
                </div>
            </div>
            <div class="partner-details">
                <p><i class="fa-solid fa-location-dot"></i> ${partner.district || "—"}</p>
                <p><i class="fa-solid fa-phone"></i> ${partner.phone || "—"}</p>
                <p><i class="fa-solid fa-envelope"></i> ${partner.email || "—"}</p>
            </div>
            <div class="partner-actions">
                <button class="approve-btn" data-id="${partner.id}">
                    <i class="fa-solid fa-circle-check"></i>
                    Approve
                </button>
                <button class="reject-btn" data-id="${partner.id}">
                    <i class="fa-solid fa-circle-xmark"></i>
                    Reject
                </button>
            </div>
        `;

        grid.appendChild(card);

    });

    attachPartnerActionEvents();

}


function attachPartnerActionEvents() {

    document.querySelectorAll("#pendingPartnersGrid .approve-btn").forEach(button => {

        button.onclick = async function () {

            const id = this.dataset.id;
            const card = this.closest(".partner-card");
            const name = card.querySelector("h3").innerText;

            if (!confirm(`Approve ${name}?`)) return;

            try {

                const getResp = await fetch(`${API_BASE}/partners/${id}`);
                const partner = await getResp.json();
                partner.verified = true;

                const response = await fetch(`${API_BASE}/partners/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(partner)
                });

                if (!response.ok) throw new Error("Server responded with " + response.status);

                card.remove();
                loadPendingPartners();
                fetchPartnerCounts();

            } catch (err) {
                console.error("Failed to approve partner:", err);
                alert("Could not approve partner. Is the backend running?");
            }

        };

    });

    document.querySelectorAll("#pendingPartnersGrid .reject-btn").forEach(button => {

        button.onclick = async function () {

            const id = this.dataset.id;
            const card = this.closest(".partner-card");
            const name = card.querySelector("h3").innerText;

            if (!confirm(`Reject and delete ${name}? This cannot be undone.`)) return;

            try {

                const response = await fetch(`${API_BASE}/partners/${id}`, {
                    method: "DELETE"
                });

                if (!response.ok) throw new Error("Server responded with " + response.status);

                card.remove();
                loadPendingPartners();
                fetchPartnerCounts();

            } catch (err) {
                console.error("Failed to reject partner:", err);
                alert("Could not reject partner. Is the backend running?");
            }

        };

    });

}


// ===============================
// FETCH REAL COUNTS FROM BACKEND
// ===============================

async function loadOverviewCounts() {

    fetchCount(`${API_BASE}/users`, "userCount");
    fetchCount(`${API_BASE}/destinations`, "destCount");
    fetchCount(`${API_BASE}/reviews`, "reviewCount");

    fetchPartnerCounts();

}


async function fetchCount(url, elementId) {

    const el = document.getElementById(elementId);
    if (!el) return;

    try {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Server responded with " + response.status);
        }

        const data = await response.json();
        el.textContent = data.length;

    } catch (err) {

        console.error("Failed to load count for " + elementId, err);
        el.textContent = "—";

    }

}


// Partners need two counts from the same list (total + verified only)
async function fetchPartnerCounts() {

    const totalEl = document.getElementById("partnerTotalCount");
    const verifiedEl = document.getElementById("verifiedPartnerCount");

    try {

        const response = await fetch(`${API_BASE}/partners`);

        if (!response.ok) {
            throw new Error("Server responded with " + response.status);
        }

        const partners = await response.json();

        if (totalEl) totalEl.textContent = partners.length;

        if (verifiedEl) {
            const verifiedCount = partners.filter(p => p.verified).length;
            verifiedEl.textContent = verifiedCount;
        }

    } catch (err) {

        console.error("Failed to load partner counts", err);
        if (totalEl) totalEl.textContent = "—";
        if (verifiedEl) verifiedEl.textContent = "—";

    }

}

// Note: the "Manage Users" and "Manage Destinations" tables on this
// dashboard are a live preview, with Edit/Delete now redirecting to
// the dedicated pages (manage-users.html / manage-destinations.html)
// where the actual backend-connected editing/deleting happens.