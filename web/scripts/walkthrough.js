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

// Add button listener to copy the URL
document.getElementById("copy-button").addEventListener("click", () => {
    // Write to the clipboard
    navigator.clipboard.writeText(
        document.getElementById("generated-url").value);
});

function updateGeneratedURL() {
    const url = new URL(window.location.href);
    // Clear path
    url.pathname = url.pathname.replace("/walkthrough.html", "");
    // Add metrics
    const m1 = document.getElementById("first-select").value;
    const m2 = document.getElementById("second-select").value;
    url.searchParams.append('m1', m1);
    url.searchParams.append('m2', m2);
    // Add motivation and exploration
    const motivation = document.getElementById("motivation").value;
    const exploration = document.getElementById("exploration").value;
    if (motivation) {
        url.searchParams.append('mvn', motivation);
    }
    if (exploration) {
        url.searchParams.append('exp', exploration);
    }
    document.getElementById("generated-url").value = url.toString();
}

// Update the URL once to start and then on every form change.
updateGeneratedURL();
document.querySelector('form').addEventListener("change", updateGeneratedURL);
