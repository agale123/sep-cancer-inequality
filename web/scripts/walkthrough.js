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