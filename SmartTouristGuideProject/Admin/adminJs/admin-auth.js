// ===============================
// VISIT LANKA ADMIN - AUTH GUARD
// Include this script FIRST on every admin page,
// before the page's own admin-*.js file.
// ===============================

(function () {

    const loggedUser = JSON.parse(localStorage.getItem("loggedUser") || "null");

    const isAdmin = loggedUser && (loggedUser.role || "").toLowerCase() === "admin";

    if (!isAdmin) {
        alert("Please log in as an administrator to access this page.");
        window.location.href = "../../html/login.html";
    }

})();


// ===============================
// SHARED LOGOUT HANDLING
// Attaches to any link/button with id="logoutLink" on the page.
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    const logoutLink = document.getElementById("logoutLink");

    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("loggedUser");
            window.location.href = "../../html/login.html";
        });
    }

});