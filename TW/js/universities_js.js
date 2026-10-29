
const API_URL = "http://universities.hipolabs.com/search?country=Romania";

const status = document.getElementById("status");
const tbody = document.getElementById("tbody");
const qInput = document.getElementById("q");
const exportBtn = document.getElementById("exportBtn");

let all = [];

function setStatus(text) {
    status.textContent = text;
}

function render(data) {
    tbody.innerHTML = data.map(u => {
        const site = u.web_pages?.[0]
            ? `<a href="${u.web_pages[0]}" target="_blank" rel="noopener noreferrer">${u.web_pages[0]}</a>`
            : "";

        return `
            <tr>
                <td>${u.name || ""}</td>
                <td>${u.country || ""}</td>
                <td>${site}</td>
            </tr>
        `;
    }).join("");
}

async function loadUniversities() {
    setStatus("Se încarcă...");
    tbody.innerHTML = "";

    try {
        const res = await fetch(API_URL);

        if (!res.ok) {
            throw new Error("Request failed");
        }

        const data = await res.json();

        all = data;
        render(all);

        setStatus(`Încărcat (${all.length} rezultate).`);
    }  catch (err) {
    console.error("Detaliu eroare:", err); // Va afișa motivul exact în F12
    setStatus("Eroare la încărcare. Încearcă din nou.");
}
}

qInput.addEventListener("input", () => {
    const q = qInput.value.trim().toLowerCase();

    const filtered = q
        ? all.filter(u =>
            (u.name || "").toLowerCase().includes(q)
        )
        : all;

    render(filtered);

    setStatus(`Filtrate: ${filtered.length} din ${all.length}.`);
});

function exportCSV(data) {
    if (!data.length) {
        alert("Nu există date de exportat.");
        return;
    }

    const header = ["Nume", "Țara", "Site"];

    const rows = data.map(u => [
        u.name || "",
        u.country || "",
        (u.web_pages && u.web_pages[0]) || ""
    ]);

    const csvContent = [header, ...rows]
        .map(row =>
            row.map(value =>
                `"${String(value).replace(/"/g, '""')}"`
            ).join(",")
        )
        .join("\n");

    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "universitati-romania.csv";

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
}

exportBtn.addEventListener("click", () => {
    const q = qInput.value.trim().toLowerCase();

    const filtered = q
        ? all.filter(u =>
            (u.name || "").toLowerCase().includes(q)
        )
        : all;

    exportCSV(filtered);
});

loadUniversities();
