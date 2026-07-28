// ===============================
// VISIT LANKA ADMIN - REVIEWS
// Now connected to Spring Boot backend
// ===============================
//
// NOTE: a Review in the backend is written about a travel Partner, not a
// specific Destination, and has no separate "travel type" or "budget"
// field. The table's "Destination" column shows the partner's business
// name instead - closest real equivalent available.
const exportBtn = document.getElementById("exportReviews");
const printBtn = document.getElementById("printReviews");
const API_BASE = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("reviewModal");
    const closeBtn = document.querySelector(".close");
    const searchInput = document.getElementById("searchReview");
    const reviewCount = document.getElementById("reviewCount");
    const table = document.querySelector(".review-table tbody");

    let allReviews = [];

    loadReviews();

    if (exportBtn) {
    exportBtn.addEventListener("click", () => {

        if (!allReviews || allReviews.length === 0) {
            alert("No reviews to export.");
            return;
        }

        const headers = ["ID", "User", "Email", "Destination", "Rating", "Review", "Date", "Status"];

        const rows = allReviews.map(review => {
            const date = review.createdAt
                ? new Date(review.createdAt).toLocaleDateString()
                : "";
            const status = review.verified ? "Approved" : "Pending";

            // Escape quotes/commas by wrapping every field in quotes
            const escape = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;

            return [
                review.id,
                review.authorName,
                review.authorEmail,
                review.partnerName,
                review.rating,
                review.comment,
                date,
                status
            ].map(escape).join(",");
        });

        const csvContent = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `reviews_export_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    });
}

if (printBtn) {
    printBtn.addEventListener("click", () => {
        window.print();
    });
}

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });


    async function loadReviews() {

        table.innerHTML = "<tr><td colspan='7'>Loading reviews...</td></tr>";

        try {

            const response = await fetch(`${API_BASE}/reviews`);
            if (!response.ok) throw new Error("Server responded with " + response.status);

            allReviews = await response.json();
            renderTable(allReviews);

        } catch (err) {

            console.error("Failed to load reviews:", err);
            table.innerHTML =
                "<tr><td colspan='7'>Could not load reviews. " +
                "Make sure the backend server is running on localhost:8080.</td></tr>";

        }

    }


    function renderTable(reviews) {

        table.innerHTML = "";

        if (reviews.length === 0) {
            table.innerHTML = "<tr><td colspan='7'>No reviews yet.</td></tr>";
            updateCount();
            return;
        }

        reviews.forEach(review => {

            const row = document.createElement("tr");
            row.dataset.id = review.id;

            const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
            const date = review.createdAt
                ? new Date(review.createdAt).toLocaleDateString()
                : "—";

            row.innerHTML = `
                <td>${review.authorName || "Unknown"}</td>
                <td>${review.partnerName || "—"}</td>
                <td>${stars}</td>
                <td>${(review.comment || "").substring(0, 40)}${review.comment && review.comment.length > 40 ? "..." : ""}</td>
                <td>${date}</td>
                <td>
                    <span class="${review.verified ? "active" : "pending"}">
                        ${review.verified ? "Approved" : "Pending"}
                    </span>
                </td>
                <td>
                    <button class="view"><i class="fa-solid fa-eye"></i></button>
                    <button class="approve"><i class="fa-solid fa-check"></i></button>
                    <button class="delete"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;

            table.appendChild(row);

        });

        updateCount();
        attachRowEvents();

    }


    function attachRowEvents() {

        document.querySelectorAll(".review-table .view").forEach(button => {

            button.onclick = function () {

                const row = this.closest("tr");
                const id = row.dataset.id;
                const review = allReviews.find(r => r.id == id);
                if (!review) return;

                document.getElementById("reviewUser").innerText = review.authorName || "Unknown";
                document.getElementById("reviewEmail").innerText = review.authorEmail || "—";
                document.getElementById("reviewDestination").innerText = review.partnerName || "—";
                document.getElementById("reviewDate").innerText =
                    review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "—";
                document.getElementById("reviewRating").innerText =
                    "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
                document.getElementById("reviewStatus").innerText =
                    review.verified ? "Approved" : "Pending";
                document.getElementById("reviewMessage").innerText = review.comment || "";

                modal.style.display = "flex";

            };

        });

        document.querySelectorAll(".review-table .approve").forEach(button => {

    button.onclick = async function () {

        const row = this.closest("tr");
        const id = row.dataset.id;

        try {

            const response = await fetch(`${API_BASE}/reviews/${id}/verify`, {
                method: "PUT"
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => "");
                throw new Error(`Server responded with ${response.status}: ${errorText}`);
            }

            loadReviews();

        } catch (err) {
            console.error("Approve failed:", err);
            alert("Could not approve review: " + err.message);
        }

    };

});

        document.querySelectorAll(".review-table .delete").forEach(button => {

            button.onclick = async function () {

                const row = this.closest("tr");
                const id = row.dataset.id;

                if (!confirm("Delete this review?")) return;

                try {

                    const response = await fetch(`${API_BASE}/reviews/${id}`, {
                        method: "DELETE"
                    });

                    if (!response.ok) throw new Error("Server responded with " + response.status);

                    row.remove();
                    updateCount();

                } catch (err) {
                    alert("Could not delete review. Is the backend running?");
                }

            };

        });

    }


    if (searchInput) {

        searchInput.addEventListener("keyup", () => {

            const value = searchInput.value.toLowerCase();
            const rows = document.querySelectorAll(".review-table tbody tr");

            rows.forEach(row => {
                row.style.display =
                    row.innerText.toLowerCase().includes(value) ? "" : "none";
            });

        });

    }


    function updateCount() {
        if (reviewCount) reviewCount.innerText = allReviews.length;
    }

    console.log("VISIT LANKA Admin Review Management Loaded");

});
