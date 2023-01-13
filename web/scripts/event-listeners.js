
/**
 * Update the data in all the charts to reflect the currently selected metrics.
 */
function updateCharts() {
    const firstMetric = document.getElementById("first-select").value;
    const secondMetric = document.getElementById("second-select").value;

    updateScatterplot(firstMetric, secondMetric);
}

/**
 * Updates the first map based on the first indicator.
 */
function updateFirstMap() {
    const firstMetric = document.getElementById("first-select").value;

    updateMap("canvas_map_one", firstMetric);
}

/**
 * Updates the first map based on the second indicator.
 */
function updateSecondMap() {
    const secondMetric = document.getElementById("second-select").value;

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

//Resize the d3 charts on a page resize
window.addEventListener("resize", () => {
    updateCharts();
});

// Register listeners for the selects.
document.querySelectorAll("select").forEach(item => {
    item.addEventListener("change", updateCharts);

    switch (item.id) {
        case "first-select":
            item.addEventListener("change", updateFirstMap);
            break;
        case "second-select":
            item.addEventListener("change", updateSecondMap);
            break;
    }
});

// Trigger an initial draw of the charts
updateFirstMap();
updateSecondMap();
updateCharts();