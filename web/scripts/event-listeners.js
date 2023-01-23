
/**
 * Update the data in all the charts to reflect the currently selected metrics.
 */
function updateCharts() {
    const firstMetric = document.getElementById("first-select").value;
    const secondMetric = document.getElementById("second-select").value;

    updateScatterplot(firstMetric, secondMetric);

    updateMap("canvas_map_one", firstMetric);
    updateMap("canvas_map_two", secondMetric);
}

// Add in the options for the selects.
const firstSelect = document.getElementById("first-select");
const secondSelect = document.getElementById("second-select");

for (const [key, value] of Object.entries(METRIC_LABELS)) {
    const option = document.createElement("option");
    option.text = value;
    option.value = key;
    if (key.includes("incidence") || key.includes("mortality")) {
        firstSelect.add(option);
    } else {
        secondSelect.add(option);
    }
}

function showWalkthrough() {
    document.getElementById("walkthrough").classList.remove("d-none");
    const columns = document.querySelector(".columns.column");
    columns.classList.add("is-three-quarters-desktop");
    columns.classList.add("is-two-thirds-tablet");
}

function hideWalkthrough() {
    document.getElementById("walkthrough").classList.add("d-none");
    const columns = document.querySelector(".columns.column");
    columns.classList.remove("is-three-quarters-desktop");
    columns.classList.remove("is-two-thirds-tablet");
}

// Show the walkthrough if there are query parameters
const url = new URL(window.location.href);
const m1 = METRIC_LABELS[url.searchParams.get("m1")];
const m2 = METRIC_LABELS[url.searchParams.get("m2")];
if (m1 && m2) {
    document.getElementById("m1").innerText =
        `Select "${m1}" as the first metric`;
    document.getElementById("m2").innerText =
        `Select "${m2}" as the second metric`;

    const mvn = url.searchParams.get("mvn");
    if (mvn) {
        document.getElementById("mvn").innerText = `Motivation: ${mvn}`;
    }
    const exp = url.searchParams.get("exp");
    if (exp) {
        document.getElementById("exp").innerText = exp;
    }
    showWalkthrough();
}

// Add the close walkthrough event listener
document.getElementById("close-button").addEventListener("click", () => {
    url.search = "";
    window.history.replaceState({}, document.title, url.toString());
    hideWalkthrough();
});

//Resize the d3 charts on a page resize
window.addEventListener("resize", () => {
    updateCharts();
});

// Register listeners for the selects.
document.querySelectorAll("select").forEach(item => {
    item.addEventListener("change", updateCharts);
});

// Trigger an initial draw of the charts
updateCharts();