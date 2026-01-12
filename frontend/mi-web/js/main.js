document.addEventListener("DOMContentLoaded", () => {
    const loginSection = document.getElementById("login-section");
    const appSection = document.getElementById("app-section");
    const form = document.getElementById("entry-form");
    const list = document.getElementById("entries-list");

    // =========================
    // Helpers
    // =========================
    function getToken() {
        return localStorage.getItem("token");
    }

    function showLogin() {
        loginSection.style.display = "block";
        appSection.style.display = "none";

        document.getElementById("navbar-user").classList.add("d-none");
    }

    function showApp(username = "admin") {
        loginSection.style.display = "none";
        appSection.style.display = "block";

        const navbarUser = document.getElementById("navbar-user");
        const userInfo = document.getElementById("user-info");

        navbarUser.classList.remove("d-none");
        userInfo.innerText = `Logged in as ${username}`;
    }

    // =========================
    // Load entries
    // =========================
    async function loadEntries() {
        const token = getToken();

        const res = await fetch("/api/entries", {
            headers: token
                ? { "Authorization": `Bearer ${token}` }
                : {}
        });

        if (!res.ok) return;

        const entries = await res.json();
        list.innerHTML = "";

        entries.forEach(entry => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.textContent = `${entry.title} — ${entry.description || ""}`;
            list.appendChild(li);
        });
    }


    // =========================
    // LOGIN
    // =========================
    window.login = async function () {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const error = document.getElementById("login-error");

        error.innerText = "";

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            error.innerText = "Login incorrecto";
            return;
        }

        const data = await res.json();
        localStorage.setItem("token", data.token);

        showApp(username);
        loadEntries();
    };

    // =========================
    // LOGOUT
    // =========================
    window.logout = function () {
        localStorage.removeItem("token");
        showLogin();
    };

    // =========================
    // FORM SUBMIT
    // =========================
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("entry-title").value.trim();
        const description = document.getElementById("entry-description").value.trim();
        const token = getToken();

        if (!token) {
            alert("Debes iniciar sesión");
            return;
        }

        if (!title) {
            alert("Title is required");
            return;
        }

        const res = await fetch("/api/entries", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title, description })
        });

        if (!res.ok) {
            alert("Error al guardar");
            return;
        }

        form.reset();
        loadEntries();
    });

    // =========================
    // INIT
    // =========================
    if (getToken()) {
        showApp();
        loadEntries();
    } else {
        showLogin();
    }
});
