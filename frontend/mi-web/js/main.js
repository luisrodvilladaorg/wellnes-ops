document.addEventListener("DOMContentLoaded", () => {
    let editingEntryId = null;

    const form = document.getElementById("entry-form");
    const list = document.getElementById("entries-list");
    const loginSection = document.getElementById("login-section");
    const appSection = document.getElementById("app-section");

    // ==========================
    // Helpers
    // ==========================
    function getToken() {
        return localStorage.getItem("token");
    }

    function showApp() {
        loginSection.style.display = "none";
        appSection.style.display = "block";
    }

    function showLogin() {
        loginSection.style.display = "block";
        appSection.style.display = "none";
    }

    // ==========================
    // Load entries
    // ==========================
    async function loadEntries() {
        const res = await fetch("/api/entries");
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

    // ==========================
    // Login
    // ==========================
    window.login = async function () {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            document.getElementById("login-error").innerText = "Login incorrecto";
            return;
        }

        const data = await res.json();
        localStorage.setItem("token", data.token);

        showApp();
        loadEntries();
    };

    // ==========================
    // Create / Update entry
    // ==========================
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("entry-title").value.trim();
        const description = document.getElementById("entry-description").value.trim();

        if (!title) {
            alert("Title is required");
            return;
        }

        const token = getToken();
        if (!token) {
            alert("Debes iniciar sesión");
            showLogin();
            return;
        }

        const method = editingEntryId ? "PUT" : "POST";
        const url = editingEntryId
            ? `/api/entries/${editingEntryId}`
            : "/api/entries";

        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title, description })
        });

        if (!res.ok) {
            alert("Error saving entry");
            return;
        }

        editingEntryId = null;
        form.reset();
        loadEntries();
    });

    // ==========================
    // Init
    // ==========================
    if (getToken()) {
        showApp();
        loadEntries();
    } else {
        showLogin();
    }
});
