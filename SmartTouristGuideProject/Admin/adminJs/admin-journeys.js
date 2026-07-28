// ===============================
// VISIT LANKA ADMIN - SAVED JOURNEYS
// Now connected to Spring Boot backend
// ===============================
//
// NOTE: a TripCart on the backend doesn't have a "journey name", travel
// date, or duration field - it's just a list of destinations (stops) an
// owner has added. This page shows the real owner, real stops, and real
// budget where one has been attached, and fills the rest in with sensible
// placeholders since that data doesn't exist yet.

const API_BASE = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("journeyModal");
    const closeBtn = document.querySelector(".close");
    const searchInput = document.getElementById("searchJourney");
    const journeyCount = document.getElementById("journeyCount");
    const table = document.querySelector(".journey-table tbody");

    const exportBtn = document.getElementById("exportJourneys");
    const printBtn = document.getElementById("printJourneys");

    if (printBtn) {
        printBtn.addEventListener("click", () => {
            window.print();
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener("click", exportJourneysToCSV);
    }

    function exportJourneysToCSV() {
        const rows = document.querySelectorAll(".journey-table tbody tr");

        if (rows.length === 0) {
            alert("No journeys to export.");
            return;
        }

        const header = ["User", "Journey Name", "Destination", "Budget", "Travel Date", "Status"];
        const csvRows = [header.join(",")];

        rows.forEach(row => {
            if (row.style.display === "none") return;

            const cells = row.querySelectorAll("td");
            const values = [
                cells[0] ? cells[0].innerText : "",
                cells[1] ? cells[1].innerText : "",
                row.dataset.destinations || (cells[2] ? cells[2].innerText : ""),
                cells[3] ? cells[3].innerText : "",
                cells[4] ? cells[4].innerText : "",
                cells[5] ? cells[5].innerText : ""
            ];

            const escape = (val) => `"${String(val).replace(/"/g, '""')}"`;

            csvRows.push(values.map(escape).join(","));
        });

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `visit-lanka-journeys-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    let allCarts = [];

    loadJourneys();

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });


    async function loadJourneys() {

        table.innerHTML = "<tr><td colspan='7'>Loading saved journeys...</td></tr>";

        try {

            const response = await fetch(`${API_BASE}/tripcarts`);
            if (!response.ok) throw new Error("Server responded with " + response.status);

            allCarts = await response.json();

            // Newest trips first, so a journey a user just saved
            // shows up at the top instead of getting buried.
            allCarts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

            renderTable(allCarts);

        } catch (err) {

            console.error("Failed to load journeys:", err);
            table.innerHTML =
                "<tr><td colspan='7'>Could not load saved journeys. " +
                "Make sure the backend server is running on localhost:8080.</td></tr>";

        }

    }


    // ======================================================
    // FRIENDLY FORMATTING HELPERS
    // ======================================================

    function destinationNames(cart) {
        return (cart.stops || [])
            .filter(s => s && s.name)
            .map(s => s.name);
    }

    // Shows the first few destinations as chips, plus a "+N more"
    // chip if there are more, instead of one long run-on line.
    function destinationChipsHTML(cart) {

        const names = destinationNames(cart);

        if (names.length === 0) {
            return `<span class="muted-text">No destinations added yet</span>`;
        }

        const shown = names.slice(0, 3);
        const remaining = names.length - shown.length;

        let html = `<div class="dest-chip-group">`;
        html += shown.map(n => `<span class="dest-chip">${n}</span>`).join("");

        if (remaining > 0) {
            html += `<span class="dest-chip more">+${remaining} more</span>`;
        }

        html += `</div>`;

        return html;

    }

    function budgetLabel(cart) {

        if (!cart.budget || !cart.budget.totalBudget) {
            return `<span class="muted-text">Not set</span>`;
        }

        const total = `$${Number(cart.budget.totalBudget).toLocaleString()}`;

        if (cart.budget.spentSoFar) {
            return `${total} <small class="spent-note">($${Number(cart.budget.spentSoFar).toLocaleString()} spent)</small>`;
        }

        return total;

    }

    function dateLabel(cart) {

        if (!cart.createdAt) {
            return `<span class="muted-text">Not available</span>`;
        }

        return new Date(cart.createdAt).toLocaleDateString(undefined, {
            year: "numeric", month: "short", day: "numeric"
        });

    }


    function renderTable(carts) {

        table.innerHTML = "";

        if (carts.length === 0) {
            table.innerHTML = "<tr><td colspan='7'>No saved journeys yet.</td></tr>";
            updateCount();
            return;
        }

        carts.forEach(cart => {

            const row = document.createElement("tr");
            row.dataset.id = cart.id;

            // Kept as a plain comma list (not the chip HTML) so search
            // and CSV export still work cleanly against the raw names.
            row.dataset.destinations = destinationNames(cart).join(", ");

            row.innerHTML = `
                <td>${cart.ownerName || "Unknown"}</td>
                <td>Trip #${cart.id}</td>
                <td>${destinationChipsHTML(cart)}</td>
                <td>${budgetLabel(cart)}</td>
                <td>${dateLabel(cart)}</td>
                <td><span class="status-badge saved">Saved</span></td>
                <td>
                    <button class="view"><i class="fa-solid fa-eye"></i></button>
                    <button class="delete"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;

            table.appendChild(row);

        });

        updateCount();
        attachRowEvents();

    }


    function attachRowEvents() {

        document.querySelectorAll(".journey-table .view").forEach(button => {

            button.onclick = function () {

                const row = this.closest("tr");
                const id = row.dataset.id;
                const cart = allCarts.find(c => c.id == id);
                if (!cart) return;

                const names = destinationNames(cart);
                const stopNames = names.join(", ") || "No destinations added yet";

                document.getElementById("journeyUser").innerText = cart.ownerName || "Unknown";
                document.getElementById("journeyEmail").innerText = cart.ownerEmail || "Not available";
                document.getElementById("journeyName").innerText = "Trip #" + cart.id;
                document.getElementById("journeyStatus").innerText = "Saved";
                document.getElementById("journeyDestination").innerText = stopNames;
                document.getElementById("journeyBudget").innerText =
                    (cart.budget && cart.budget.totalBudget)
                        ? `$${Number(cart.budget.totalBudget).toLocaleString()} (spent $${Number(cart.budget.spentSoFar || 0).toLocaleString()})`
                        : "Not set";
                document.getElementById("journeyDate").innerText =
                    cart.createdAt
                        ? new Date(cart.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
                        : "Not available";
                document.getElementById("journeyDuration").innerText =
                    names.length + " stop(s)";

                modal.style.display = "flex";

            };

        });

        document.querySelectorAll(".journey-table .delete").forEach(button => {

            button.onclick = async function () {

                const row = this.closest("tr");
                const id = row.dataset.id;

                if (!confirm("Delete this saved journey?")) return;

                try {

                    const response = await fetch(`${API_BASE}/tripcarts/${id}`, {
                        method: "DELETE"
                    });

                    if (!response.ok) throw new Error("Server responded with " + response.status);

                    row.remove();
                    updateCount();

                } catch (err) {
                    alert("Could not delete journey. Is the backend running?");
                }

            };

        });

        document.querySelectorAll(".quick-card").forEach(card => {

        card.addEventListener("click", () => {

            const title = card.querySelector("h3").innerText;

            switch (title) {

                case "View Journeys":
                    document.querySelector(".table-section").scrollIntoView({ behavior: "smooth" });
                    break;

                case "Journey Statistics":
                    showJourneyStatistics();
                    break;

                case "Export Data":
                    exportJourneysToCSV();
                    break;

                case "Filter Journeys":
                    showJourneyFilterMenu();
                    break;

            }

        });

    });

   function showJourneyStatistics() {

        const rows = document.querySelectorAll(".journey-table tbody tr");
        const counts = {};
        let total = 0;

        rows.forEach(row => {
            if (row.style.display === "none") return;
            const status = row.cells[5] ? row.cells[5].innerText.trim() : "Unknown";
            counts[status] = (counts[status] || 0) + 1;
            total++;
        });

        const statsModal = document.getElementById("journeyStatsModal");
        const statsBars = document.getElementById("journeyStatsBars");

        if (!statsModal || !statsBars) {
            alert("Statistics view is not available.");
            return;
        }

        statsBars.innerHTML = "";

        if (total === 0) {
            statsBars.innerHTML = "<p>No journeys to analyze.</p>";
        } else {
            Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .forEach(([status, count]) => {
                    const percent = Math.round((count / total) * 100);
                    const row = document.createElement("div");
                    row.className = "stats-row";
                    row.innerHTML = `
                        <div class="stats-row-label">
                            <span>${status}</span>
                            <span>${count} (${percent}%)</span>
                        </div>
                        <div class="stats-bar-track">
                            <div class="stats-bar-fill" style="width:${percent}%"></div>
                        </div>
                    `;
                    statsBars.appendChild(row);
                });
        }

        statsModal.style.display = "flex";
    }

    const closeJourneyStatsBtn = document.getElementById("closeJourneyStatsModal");
    const journeyStatsModal = document.getElementById("journeyStatsModal");

    if (closeJourneyStatsBtn) {
        closeJourneyStatsBtn.addEventListener("click", () => {
            if (journeyStatsModal) journeyStatsModal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (journeyStatsModal && e.target === journeyStatsModal) {
            journeyStatsModal.style.display = "none";
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && journeyStatsModal) {
            journeyStatsModal.style.display = "none";
        }
    });

    function showJourneyFilterMenu() {

        const rows = document.querySelectorAll(".journey-table tbody tr");
        const statuses = [...new Set(
            Array.from(rows).map(row => row.cells[5] ? row.cells[5].innerText.trim() : "")
        )].filter(Boolean);

        const filterModal = document.getElementById("journeyFilterModal");
        const filterOptions = document.getElementById("journeyFilterOptions");

        if (!filterModal || !filterOptions) {
            alert("Filter view is not available.");
            return;
        }

        filterOptions.innerHTML = "";

        if (statuses.length === 0) {
            filterOptions.innerHTML = "<p>No statuses available to filter by.</p>";
            filterModal.style.display = "flex";
            return;
        }

        function setActiveChip(selected) {
            document.querySelectorAll("#journeyFilterOptions .filter-chip").forEach(chip => {
                chip.classList.remove("active");
            });
            selected.classList.add("active");
        }

        const allChip = document.createElement("span");
        allChip.className = "filter-chip active";
        allChip.innerText = "All";
        allChip.addEventListener("click", () => {
            applyJourneyStatusFilter(null);
            setActiveChip(allChip);
        });
        filterOptions.appendChild(allChip);

        statuses.forEach(status => {
            const chip = document.createElement("span");
            chip.className = "filter-chip";
            chip.innerText = status;
            chip.addEventListener("click", () => {
                applyJourneyStatusFilter(status);
                setActiveChip(chip);
            });
            filterOptions.appendChild(chip);
        });

        filterModal.style.display = "flex";
    }

    function applyJourneyStatusFilter(status) {

        const rows = document.querySelectorAll(".journey-table tbody tr");

        rows.forEach(row => {
            const rowStatus = row.cells[5] ? row.cells[5].innerText.trim() : "";
            row.style.display = (!status || rowStatus === status) ? "" : "none";
        });

        updateCount();

        const filterModal = document.getElementById("journeyFilterModal");
        if (filterModal) filterModal.style.display = "none";

        document.querySelector(".table-section").scrollIntoView({ behavior: "smooth" });
    }

    const closeJourneyFilterBtn = document.getElementById("closeJourneyFilterModal");
    const journeyFilterModal = document.getElementById("journeyFilterModal");

    if (closeJourneyFilterBtn) {
        closeJourneyFilterBtn.addEventListener("click", () => {
            if (journeyFilterModal) journeyFilterModal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (journeyFilterModal && e.target === journeyFilterModal) {
            journeyFilterModal.style.display = "none";
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && journeyFilterModal) {
            journeyFilterModal.style.display = "none";
        }
    });

    }


    if (searchInput) {

        searchInput.addEventListener("keyup", () => {

            const value = searchInput.value.toLowerCase();
            const rows = document.querySelectorAll(".journey-table tbody tr");

            rows.forEach(row => {
                row.style.display =
                    row.innerText.toLowerCase().includes(value) ? "" : "none";
            });

        });

    }


    function updateCount() {
        if (journeyCount) journeyCount.innerText = allCarts.length;
    }

    console.log("VISIT LANKA Admin Saved Journeys Loaded");

});
