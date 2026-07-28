// ===============================
// VISIT LANKA LOGIN
// Spring Boot Ready
// ===============================

const loginForm = document.getElementById("loginForm");
const password = document.getElementById("password");
const username = document.getElementById("username");
const togglePassword = document.getElementById("togglePassword");

// ===============================
// SHOW / HIDE PASSWORD
// ===============================

togglePassword.addEventListener("click", () => {

    const type = password.getAttribute("type") === "password"
        ? "text"
        : "password";

    password.setAttribute("type", type);

    togglePassword.classList.toggle("fa-eye");
    togglePassword.classList.toggle("fa-eye-slash");

});

function showToast(message, duration = 2000) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
       window.location.href = "../Admin/adminhtml/admin-dashboard.html";
}, 1200);
}

// ===============================
// LOGIN
// ===============================

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const user = username.value.trim();
    const pass = password.value.trim();

    // Validation

    if(user === "" || pass === ""){

        alert("Please fill in all fields.");

        return;

    }

    try{

        // Spring Boot API

        const response = await fetch("http://localhost:8080/api/users/login",{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                email:user,

                password:pass

            })

        });

        // Login Success

       if(response.ok){

            const data = await response.json();

            localStorage.setItem(
                "loggedUser",
                JSON.stringify(data)
            );

            alert("Welcome " + data.name + "!");

            const role = (data.role || "").toLowerCase();

            if (role === "admin") {
                window.location.href = "../Admin/adminhtml/admin-dashboard.html";
            } else {
                window.location.href = "questionnaire.html";
            }

        } 

    }

    catch(error){

        console.error(error);

        alert("Cannot connect to server. Make sure the backend is running on localhost:8080.");

    }

});
