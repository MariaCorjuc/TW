export {};

/*
API Card
API Name: TheMealDB
Base URL: https://www.themealdb.com/api/json/v1/1
Endpoint used: /search.php?s=pasta
HTTP method: GET
Status code seen: 200
Fields used: idMeal, strMeal, strCategory, strMealThumb
*/

interface Meal {
    idMeal: string;
    strMeal: string;
    strCategory: string;
    strMealThumb: string;
}

interface MealResponse {
    meals: Meal[] | null;
}

interface MealDetails {
    [key: string]: string | null;
    idMeal: string;
    strMeal: string;
}

interface MealDetailsResponse {
    meals: MealDetails[] | null;
}

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/search.php";

const statusEl = document.getElementById("status") as HTMLParagraphElement;
const resultsEl = document.getElementById("results") as HTMLDivElement;

const searchForm = document.getElementById("searchForm") as HTMLFormElement;
const queryInput = document.getElementById("queryInput") as HTMLInputElement;
const searchBtn = document.getElementById("searchBtn") as HTMLButtonElement;
const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement;

let currentMeals: Meal[] = [];


async function getJSON<T>(url: string): Promise<T> {
    const controller = new AbortController();

    const timer = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(url, {
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json() as T;

    } finally {
        clearTimeout(timer);
    }
}


function setStatus(text: string): void {
    statusEl.textContent = text;
}


function createCard(item: Meal): HTMLElement {
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
            const data = await getJSON<MealDetailsResponse>(
                buildDetailsURL(item.idMeal)
            );

            const mealDetails = data.meals?.[0];

            detailsBox.replaceChildren();

            if (!mealDetails) {
                detailsBox.textContent = "Ingredientele nu sunt disponibile.";
                return;
            }

            const heading = document.createElement("h4");
            heading.textContent = "Ingrediente:";

            const list = document.createElement("ul");

            for (let i = 1; i <= 20; i++) {
                const ingredient = mealDetails[`strIngredient${i}`]?.trim();
                const measure = mealDetails[`strMeasure${i}`]?.trim();

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

        } catch {
            detailsBox.textContent = "Nu am putut încărca ingredientele.";
        } finally {
            loadingDetails = false;
        }
    });

    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(detail);
    card.appendChild(detailsBox);

    return card;
}

function render(items: Meal[]): void {
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


function buildURL(query: string): string {
    return `${BASE_URL}?s=${encodeURIComponent(query)}`;
}

function buildDetailsURL(id: string): string {
    return `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`;
}

async function search(): Promise<void> {
    const query = queryInput.value.trim();

    if (!query) {
        setStatus("Please enter a search term.");
        return;
    }

    searchBtn.disabled = true;
    setStatus("Loading...");
    resultsEl.replaceChildren();

    try {
        const data = await getJSON<MealResponse>(buildURL(query));

        const items: Meal[] = data.meals ?? [];

        render(items);

        localStorage.setItem("lastQuery", query);

    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";

        currentMeals = [];
        setStatus(`Load failed: ${msg}`);

    } finally {
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


function exportCSV(): void {
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
    ].map(row =>
        row.map(value =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
        ).join(",")
    ).join("\n");

    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

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
