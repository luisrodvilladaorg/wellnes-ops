document.addEventListener("DOMContentLoaded", () => {
    console.log("JS cargado correctamente");

    const form = document.getElementById("entry-form");
    const list = document.getElementById("entries-list");

    console.log("form:", form);
    console.log("list:", list);

    // ==========================
    // Load entries from backend
    // ==========================
    async function loadEntries() {
        try {
            const response = await fetch("/api/entries");
            const entries = await response.json();

            list.innerHTML = "";

            entries.forEach(entry => {
                const li = document.createElement("li");
                li.className = "list-group-item";
                li.textContent = `${entry.title} — ${entry.description || ""}`;
                list.appendChild(li);
            });

        } catch (error) {
            console.error("Error loading entries:", error);
        }
    }

    // Cargar datos al arrancar
    loadEntries();

    // ==========================
    // Handle form submit
    // ==========================
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title = document.getElementById("entry-title").value.trim();
        const description = document.getElementById("entry-description").value.trim();

        if (!title) {
            alert("Title is required");
            return;
        }

        try {
            const response = await fetch("/api/entries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title, description })
            });

            if (!response.ok) {
                throw new Error("Failed to save entry");
            }

            form.reset();
            loadEntries();

        } catch (error) {
            console.error("Error saving entry:", error);
            alert("Error saving entry");
        }
    });
});
