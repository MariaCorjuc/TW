const BASE_URL = "https://www.themealdb.com/api/json/v1/1/search.php";
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const searchForm = document.getElementById("searchForm");
const queryInput = document.getElementById("queryInput");
const searchBtn = document.getElementById("searchBtn");
const exportBtn = document.getElementById("exportBtn");
let currentMeals = [];
async function getJSON(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
        const response = await fetch(url, {
            signal: controller.signal
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    }
    finally {
        clearTimeout(timer);
    }
}
function setStatus(text) {
    statusEl.textContent = text;
}
function createCard(item) {
    const card = document.createElement("div");
    card.className = "card";
    card.style.cursor = "pointer";
    const image = document.createElement("img");
    image.src = item.strMealThumb;
    image.alt = item.strMeal;
    const title = document.createElement("h3");
    title.textContent = item.strMeal;
    const detail = document.createElement("p");
    detail.textContent = "Category: " + item.strCategory;
    const detailsBox = document.createElement("div");
    detailsBox.className = "recipe-details";
    detailsBox.hidden = true;
    let loadedDetails = false;
    let loadingDetails = false;
    card.addEventListener("click", async () => {
        var _a, _b, _c;
        if (!detailsBox.hidden) {
            detailsBox.hidden = true;
            return;
        }
        detailsBox.hidden = false;
        if (loadedDetails || loadingDetails) {
            return;
        }
        loadingDetails = true;
        detailsBox.textContent = "Se încarcă ingredientele...";
        try {
            const data = await getJSON(buildDetailsURL(item.idMeal));
            const mealDetails = (_a = data.meals) === null || _a === void 0 ? void 0 : _a[0];
            detailsBox.replaceChildren();
            if (!mealDetails) {
                detailsBox.textContent = "Ingredientele nu sunt disponibile.";
                return;
            }
            const heading = document.createElement("h4");
            heading.textContent = "Ingrediente:";
            const list = document.createElement("ul");
            for (let i = 1; i <= 20; i++) {
                const ingredient = (_b = mealDetails[`strIngredient${i}`]) === null || _b === void 0 ? void 0 : _b.trim();
                const measure = (_c = mealDetails[`strMeasure${i}`]) === null || _c === void 0 ? void 0 : _c.trim();
                if (ingredient) {
                    const li = document.createElement("li");
                    li.textContent = measure
                        ? `${ingredient} - ${measure}`
                        : ingredient;
                    list.appendChild(li);
                }
            }
            detailsBox.appendChild(heading);
            detailsBox.appendChild(list);
            loadedDetails = true;
        }
        catch (_d) {
            detailsBox.textContent = "Nu am putut încărca ingredientele.";
        }
        finally {
            loadingDetails = false;
        }
    });
    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(detail);
    card.appendChild(detailsBox);
    return card;
}
function render(items) {
    resultsEl.replaceChildren();
    currentMeals = items;
    if (items.length === 0) {
        setStatus("No results found.");
        return;
    }
    items.forEach(item => {
        resultsEl.appendChild(createCard(item));
    });
    setStatus(`Loaded ${items.length} result(s).`);
}
function buildURL(query) {
    return `${BASE_URL}?s=${encodeURIComponent(query)}`;
}
function buildDetailsURL(id) {
    return `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`;
}
async function search() {
    var _a;
    const query = queryInput.value.trim();
    if (!query) {
        setStatus("Please enter a search term.");
        return;
    }
    searchBtn.disabled = true;
    setStatus("Loading...");
    resultsEl.replaceChildren();
    try {
        const data = await getJSON(buildURL(query));
        const items = (_a = data.meals) !== null && _a !== void 0 ? _a : [];
        render(items);
        localStorage.setItem("lastQuery", query);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        currentMeals = [];
        setStatus(`Load failed: ${msg}`);
    }
    finally {
        searchBtn.disabled = false;
    }
}
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    search();
});
window.addEventListener("DOMContentLoaded", () => {
    const lastQuery = localStorage.getItem("lastQuery");
    if (lastQuery) {
        queryInput.value = lastQuery;
    }
});
function exportCSV() {
    if (currentMeals.length === 0) {
        setStatus("No results to export.");
        return;
    }
    const headers = ["ID", "Meal", "Category"];
    const rows = currentMeals.map(meal => [
        meal.idMeal,
        meal.strMeal,
        meal.strCategory
    ]);
    const csvContent = [
        headers,
        ...rows
    ].map(row => row.map(value => `"${String(value !== null && value !== void 0 ? value : "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "meals.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatus("CSV file downloaded successfully!");
}
exportBtn.addEventListener("click", exportCSV);