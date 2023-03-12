/**
 * Update the data in all the charts to reflect the currently selected metrics.
 */
function updateCharts() {
  const firstMetric = document.getElementById("first-select").value;
  const secondMetric = document.getElementById("second-select").value;

  updateMap("canvas_map_one", firstMetric);
  updateMap("canvas_map_two", secondMetric);

  updateScatterplot(secondMetric, firstMetric);
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
}

function hideWalkthrough() {
  document.getElementById("walkthrough").classList.add("d-none");
  updateCharts();
}

// Show the walkthrough if there are query parameters
const url = new URL(window.location.href);
const m1 = METRIC_LABELS[url.searchParams.get("m1")];
const m2 = METRIC_LABELS[url.searchParams.get("m2")];
if (m1 && m2) {
  document.getElementById(
    "m1"
  ).innerText = `Select "${m1}" as the first metric`;
  document.getElementById(
    "m2"
  ).innerText = `Select "${m2}" as the second metric`;

  const mvn = url.searchParams.get("mvn");
  if (mvn) {
    document.getElementById("mvn").innerText = `Motivation: ${mvn}`;
  }
  const exp = url.searchParams.get("exp");
  if (exp) {
    for (const el of JSON.parse(exp)) {
      const li = document.createElement("li");
      li.innerText = el;
      document.getElementById("questions").appendChild(li);
    }
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
document.querySelectorAll("select").forEach((item) => {
  item.addEventListener("change", updateCharts);
});

// Trigger an initial draw of the charts
updateCharts();
