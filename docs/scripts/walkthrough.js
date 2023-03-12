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
document.getElementById("copy-button").addEventListener("click", (e) => {
  e.preventDefault();
  // Write to the clipboard
  navigator.clipboard.writeText(document.getElementById("generated-url").value);
});

// Add button listener to the add exploration question button
document.getElementById("exploration-add").addEventListener("click", (e) => {
  e.preventDefault();
  const div = document.createElement("div");
  div.innerHTML = `
          <input class="form-control exploration" type="text" placeholder="Text input" />
          <button class="btn btn-outline-secondary">
            <span class="icon">
              <i class="fa-solid fa-close"></i>
            </span>
          </button>
    `;
  div.className = "input-group mt-3";
  // Remove the element when the close button is clicked.
  div.querySelector("button").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("explorations").removeChild(div);
    updateGeneratedURL();
  });
  // Add the element to the list of exploration questions.
  document.getElementById("explorations").appendChild(div);
});

function updateGeneratedURL() {
  const url = new URL(window.location.href);
  // Clear path
  url.pathname = url.pathname.replace(
    "/walkthrough.html",
    "/visualization.html"
  );
  // Add metrics
  const m1 = document.getElementById("first-select").value;
  const m2 = document.getElementById("second-select").value;
  url.searchParams.append("m1", m1);
  url.searchParams.append("m2", m2);
  // Add motivation and exploration
  const motivation = document.getElementById("motivation").value;
  const explorations = [...document.getElementsByClassName("exploration")].map(
    (el) => el.value
  );
  if (motivation) {
    url.searchParams.append("mvn", motivation);
  }
  if (explorations.length > 0 && !!explorations[0]) {
    url.searchParams.append("exp", JSON.stringify(explorations));
  }
  document.getElementById("generated-url").value = url.toString();
}

// Update the URL once to start and then on every form change.
updateGeneratedURL();
document.querySelector("form").addEventListener("change", updateGeneratedURL);
