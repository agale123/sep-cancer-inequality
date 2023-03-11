// Set the dimensions and margins of the graph
const MARGIN = { top: 30, right: 60, bottom: 60, left: 60 };

// Max width, in pixels, for the scatterplot.
const MAX_WIDTH = 600;

/**
 * @param {Array<Object>} data
 * @param {string} metric
 * @returns {number[]} A two-element array with the range that should be used.
 */
function getDataRange(data, metric) {
  const min = d3.min(data, (d) => d[metric]);
  const max = d3.max(data, (d) => d[metric]);

  return [min, max];
}

/**
 * Join the two datasets in preparation for rendering.
 * @param {Array<Object>} data1 first list of data entries
 * @param {string} metric2 metric for the second list of data entries
 * @param {Array<Object>} data2 second list of data entries
 * @param {boolean} adjustState whether the FIPS should be adjusted to state
 * @returns
 */
function joinData(metric1, data1, metric2, data2, adjustState) {
  let joined = Object.entries(data1).map(([k, v]) => ({
    fips: k,
    [metric1]: v,
  }));
  return joined.map((d) => {
    const key = adjustState ? Math.floor(d["fips"] / 1000) : d["fips"];
    d[metric2] = data2[key];
    return d;
  });
}

function getTickFormat(metric) {
  const unit = getMetricUnit(metric);
  if (unit === "percent") {
    return (val) => d3.format("~s")(val) + "%";
  } else if (unit === "dollars") {
    return (val) => "$" + d3.format("~s")(val);
  }
  return (val) => d3.format(val < 1 ? "~r" : "~s")(val);
}

/**
 * Update the scatterplot to show the relationship between the two variables.
 * @param {string} xMetric
 * @param {string} yMetric
 */
async function updateScatterplot(xMetric, yMetric) {
  // Clear any past svg elements
  d3.select("#canvas_scatterplot").selectAll("*").remove();

  // Get the width for the scatterplot element.
  const clientWidth = Math.min(
    document.getElementById("canvas_scatterplot").clientWidth,
    MAX_WIDTH
  );
  const w = clientWidth - MARGIN.left - MARGIN.right;
  const h = 400 - MARGIN.top - MARGIN.bottom;

  // Attach an svg to the Append the svg object to the body of the page
  const scatterplot = d3
    .select("#canvas_scatterplot")
    .append("svg")
    .attr("width", w + MARGIN.left + MARGIN.right)
    .attr("height", h + MARGIN.top + MARGIN.bottom)
    .append("g")
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

  const xType = getMetricType(xMetric);
  const yType = getMetricType(yMetric);

  // Read the data
  const [xData, yData, popData] = await Promise.all([
    getDataMap(xMetric),
    getDataMap(yMetric),
    getDataMap(
      xType === "state" && yType === "state" ? "state_population" : "population"
    ),
  ]);

  // Join the data
  let data = [];
  if (
    (xType !== "state" && yType !== "state") ||
    (xType === "state" && yType === "state")
  ) {
    data = joinData(xMetric, xData, yMetric, yData, false);
  } else if (xType !== "state" && yType === "state") {
    data = joinData(xMetric, xData, yMetric, yData, true);
  } else if (xType === "state" && yType !== "state") {
    data = joinData(yMetric, yData, xMetric, xData, true);
  }

  // Remove any missing datapoints
  data = data.filter((d) => d[xMetric] && d[yMetric]);

  // Add X axis
  const xRange = getDataRange(data, xMetric);
  const x = d3.scaleLinear().domain(xRange).range([0, w]).nice();
  scatterplot
    .append("g")
    .attr("transform", `translate(0,${h})`)
    .call(d3.axisBottom(x).tickFormat(getTickFormat(xMetric)));
  scatterplot
    .append("text")
    .attr("text-anchor", "middle")
    .attr("x", w / 2)
    .attr("y", h + MARGIN.top + 15)
    .text(getMetricLabel(xMetric));

  // Add Y axis
  const yRange = getDataRange(data, yMetric);
  const y = d3.scaleLinear().domain(yRange).range([h, 0]).nice();
  scatterplot
    .append("g")
    .call(d3.axisLeft(y).tickFormat(getTickFormat(yMetric)));
  scatterplot
    .append("text")
    .attr("text-anchor", "center")
    .attr("transform", "rotate(-90)")
    .attr("x", (d) => -(h / 2 + 2.6 * yMetric.length))
    .attr("y", -MARGIN.left + 20)
    .text(getMetricLabel(yMetric));

  // Add tooltip
  const tooltip = d3
    .select("#canvas_scatterplot")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Add dots
  const popDomain = [
    Math.min(...Object.values(popData)),
    Math.max(...Object.values(popData)),
  ];
  // Use scaleSqrt so the area of circles are proportional to population.
  const r = d3.scaleSqrt().domain(popDomain).range([1, 10]);
  // Purple: #aa4ac4 Gold: #ffb500 Teal: #00c1d5 Navy: #1b365d
  scatterplot
    .append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d[xMetric]))
    .attr("cy", (d) => y(d[yMetric]))
    .attr("r", (d) => r(popData[d["fips"]]))
    .style("fill", "#00c1d5")
    .style("fill-opacity", 0.5)
    .style("stroke", "#1b365d")
    .attr("stroke-width", 1)
    .style("stroke-opacity", 1.0)
    .on("mouseover", (d) => {
      const event = d3.event;
      getNameForFips(d["fips"]).then((label) => {
        tooltip
          .style("opacity", 1)
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY + 20 + "px")
          .html(`<b>${label}</b>`);
      });
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  // Add a clipPath to prevent the regression from extending outside the axes.
  scatterplot
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", w)
    .attr("height", h);

  // Repeat each county proportional to its population to make a weighted
  // best fit line.
  const regressionData = data
    .map((d) => Array(Math.ceil(popData[d["fips"]] / 1000)).fill(d))
    .flat();
  // Add linear regression line
  const linReg = d3
    .regressionLinear()
    .x((d) => d[xMetric])
    .y((d) => d[yMetric])
    .domain(x.domain());
  scatterplot
    .append("g")
    .append("line")
    .attr("class", "regression")
    .datum(linReg(regressionData))
    .attr("x1", (d) => x(d[0][0]))
    .attr("x2", (d) => x(d[1][0]))
    .attr("y1", (d) => y(d[0][1]))
    .attr("y2", (d) => y(d[1][1]))
    .attr("stroke-width", 1)
    .attr("stroke", "#1b365d")
    .attr("clip-path", "url(#clip)");

  // Add a legend
  const domain = r.domain();
  const midPoint = Math.pow(
    (Math.sqrt(domain[0]) + Math.sqrt(domain[1])) / 2,
    2
  );
  scatterplot
    .selectAll("legend-dots")
    .data([domain[0], midPoint, domain[1]])
    .enter()
    .append("circle")
    .attr("cx", clientWidth - MARGIN.right - MARGIN.left + 10)
    .attr("cy", (d, i) => i * 25 + 15)
    .attr("r", (d) => r(d))
    .style("fill", "#00c1d5")
    .style("fill-opacity", 0.5)
    .style("stroke", "#1b365d")
    .attr("stroke-width", 1)
    .style("stroke-opacity", 1.0);

  scatterplot
    .selectAll("legend-labels")
    .data([domain[0], midPoint, domain[1]])
    .enter()
    .append("text")
    .attr("x", clientWidth - MARGIN.right - MARGIN.left + 22)
    .attr("y", (d, i) => i * 25 + 15)
    .attr("font-size", "10")
    .attr("dominant-baseline", "middle")
    .text((d) => {
      return d3.format(".1s")(d);
    });

  scatterplot
    .append("text")
    .attr("x", clientWidth - MARGIN.right - MARGIN.left)
    .attr("y", 0)
    .attr("font-weight", "bold")
    .attr("font-size", "10")
    .text("Population");

  // Render a text summary of the relationship
  const m = linReg(regressionData).a;
  const magnitude = Math.abs(
    (m * (xRange[1] - xRange[0])) / (yRange[1] - yRange[0])
  );
  const slopeDesc =
    (magnitude >= 0.1 ? "strong" : "weak") +
    " " +
    (m > 0 ? "positive" : "negative");
  const granularity =
    xType === "state" && yType === "state" ? "state" : "county";
  document.getElementById("scatter_relationship").innerHTML = `
        <p>Use this scatterplot to understand how these two variables are 
        correlated. Each circle represents a ${granularity} and the size of  
        circle represents the population of that area.</p>
        <p>Based on the slope of the line, there is a <b>${slopeDesc}</b>
        relationship between the variables.</p>`;

  // Render metric descriptions
  document.getElementById("scatter_x").innerHTML = `<b>${getMetricLabel(
    xMetric
  )}</b>: ${getMetricDescription(xMetric)}`;
  document.getElementById("scatter_y").innerHTML = `<b>${getMetricLabel(
    yMetric
  )}</b>: ${getMetricDescription(yMetric)}`;
}
