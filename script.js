const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const results = document.getElementById("results");
const status = document.getElementById("status");

const modal = document.getElementById("recipeModal");
const closeModal = document.getElementById("closeModal");

const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalCategory = document.getElementById("modalCategory");
const modalArea = document.getElementById("modalArea");
const ingredientsList = document.getElementById("ingredientsList");
const modalInstructions = document.getElementById("modalInstructions");
const youtubeLink = document.getElementById("youtubeLink");

const filterButtons = document.querySelectorAll(".filter-btn");

let searchType = "name";
let debounceTimer;


/* --------------------------------
   Search Type
-------------------------------- */

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        searchType = button.dataset.type;

        searchInput.placeholder =
            searchType === "name"
                ? "Search recipe name..."
                : "Search by ingredient...";

        searchInput.focus();
    });

});


/* --------------------------------
   Search API
-------------------------------- */

async function searchRecipes(query) {

    if (!query.trim()) {
        results.innerHTML = "";
        status.textContent = "Search for a recipe to get started.";
        return;
    }

    status.className = "status";
    status.textContent = "🔄 Searching recipes...";
    results.innerHTML = "";

    try {

        let url;

        if (searchType === "name") {

            url =
                `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;

        } else {

            url =
                `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(query)}`;

        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Unable to connect to recipe API.");
        }

        const data = await response.json();

        if (!data.meals) {

            status.textContent =
                "No recipes found. Try another search.";

            return;
        }

        status.textContent =
            `${data.meals.length} recipe(s) found`;

        displayRecipes(data.meals);

    } catch (error) {

        console.error(error);

        status.className = "status error";

        status.textContent =
            "Unable to load recipes. Please check your internet connection and try again.";
    }
}


/* --------------------------------
   Display Recipes
-------------------------------- */

function displayRecipes(meals) {

    results.innerHTML = "";

    meals.forEach(meal => {

        const card = document.createElement("article");

        card.className = "recipe-card";

        card.innerHTML = `
            <img
                src="${meal.strMealThumb || "https://via.placeholder.com/400x250?text=No+Image"}"
                alt="${escapeHTML(meal.strMeal)}"
                loading="lazy"
            >

            <div class="recipe-info">

                <h3>${escapeHTML(meal.strMeal)}</h3>

                <p>
                    ${meal.strCategory || "Recipe"}
                </p>

                <button
                    class="view-btn"
                    data-id="${meal.idMeal}"
                >
                    View Recipe
                </button>

            </div>
        `;

        const viewButton = card.querySelector(".view-btn");

        viewButton.addEventListener("click", () => {
            getRecipeDetails(meal.idMeal);
        });

        results.appendChild(card);
    });
}


/* --------------------------------
   Get Full Recipe
-------------------------------- */

async function getRecipeDetails(id) {

    try {

        status.textContent = "🔄 Loading recipe details...";

        const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        );

        if (!response.ok) {
            throw new Error("Unable to load recipe.");
        }

        const data = await response.json();

        if (!data.meals || !data.meals[0]) {
            throw new Error("Recipe not found.");
        }

        showRecipeModal(data.meals[0]);

    } catch (error) {

        console.error(error);

        status.className = "status error";
        status.textContent = "Unable to load recipe details.";
    }
}


/* --------------------------------
   Recipe Modal
-------------------------------- */

function showRecipeModal(meal) {

    modalImage.src =
        meal.strMealThumb ||
        "https://via.placeholder.com/700x400?text=No+Image";

    modalImage.alt = meal.strMeal;

    modalTitle.textContent = meal.strMeal;

    modalCategory.textContent =
        meal.strCategory || "Not available";

    modalArea.textContent =
        meal.strArea || "Not available";

    modalInstructions.textContent =
        meal.strInstructions || "Instructions not available.";

    ingredientsList.innerHTML = "";

    for (let i = 1; i <= 20; i++) {

        const ingredient =
            meal[`strIngredient${i}`];

        const measure =
            meal[`strMeasure${i}`];

        if (ingredient && ingredient.trim()) {

            const li = document.createElement("li");

            li.textContent =
                `${ingredient} ${measure || ""}`;

            ingredientsList.appendChild(li);
        }
    }

    if (meal.strYoutube) {

        youtubeLink.href = meal.strYoutube;
        youtubeLink.style.display = "inline-block";

    } else {

        youtubeLink.style.display = "none";
    }

    modal.classList.add("show");

    document.body.style.overflow = "hidden";
}


/* --------------------------------
   Close Modal
-------------------------------- */

closeModal.addEventListener("click", closeRecipeModal);

modal.addEventListener("click", event => {

    if (event.target === modal) {
        closeRecipeModal();
    }
});


function closeRecipeModal() {

    modal.classList.remove("show");

    document.body.style.overflow = "";
}


/* --------------------------------
   Search Button
-------------------------------- */

searchBtn.addEventListener("click", () => {

    searchRecipes(searchInput.value);

});


/* --------------------------------
   Enter Key
-------------------------------- */

searchInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {

        searchRecipes(searchInput.value);

    }

});


/* --------------------------------
   Debounced Search
-------------------------------- */

searchInput.addEventListener("input", () => {

    clearTimeout(debounceTimer);

    const query = searchInput.value.trim();

    if (!query) {
        results.innerHTML = "";
        status.textContent =
            "Search for a recipe to get started.";
        return;
    }

    debounceTimer = setTimeout(() => {

        searchRecipes(query);

    }, 600);

});


/* --------------------------------
   Basic HTML Safety
-------------------------------- */

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value || "";

    return div.innerHTML;
}


/* --------------------------------
   Initial Message
-------------------------------- */

status.textContent =
    "Search for a recipe to get started.";