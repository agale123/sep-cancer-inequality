
/**
 * Update the data in all the charts to reflect the currently selected metrics.
 */
function updateCharts() {
    const firstMetric = document.getElementById("first-select").value;
    const secondMetric = document.getElementById("second-select").value;

    updateScatterplot(firstMetric, secondMetric);

    // TODO: update the maps
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
});

// Trigger an initial draw of the charts
updateCharts();