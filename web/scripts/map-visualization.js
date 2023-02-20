/**
 * This file contains methods for rendering the map vizualizations.
 */

// Color Settings
// Viridis palette from https://observablehq.com/@d3/color-schemes
const defaultColor = "#ffffff";
const palette = [
  "#440154",
  "#46327e",
  "#365c8d",
  "#277f8e",
  "#1fa187",
  "#4ac16d",
  "#a0da39",
  "#fde725",
].reverse();

/**
 * Calculates the specified quantile of the specified vector.
 * @param {Array} input the input vector.
 * @param {Number} q the quantile to be calculated.
 * @returns the value of the quantile.
 */
function quantile(input, q) {
  const sorted = input.sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;

  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}

/**
 * Updates the map on the specified canvas element based on the specified data
 * source.
 * @param {string} canvasName name of the SVG element that will contain the map.
 * @param {string} indicatorName name of the indicator column.
 */
function updateMap(canvasName, indicatorName) {
  // Load indicator data and render the map when ready.
  Promise.all([
    getMetricType(indicatorName) === "county"
      ? getCountyOutlines()
      : getStateOutlines(),
    getMetricType(indicatorName) === "coordinate"
      ? getData(indicatorName)
      : getDataMap(indicatorName),
  ]).then(([outlines, data]) => {
    renderMap(canvasName, indicatorName, outlines, data);
  });
}

function formatNumber(num) {
  if (num === undefined) {
    return "No data";
  } else {
    return d3
      .format(num >= 10 ? (!(num % 1) ? "," : ",.2f") : ".2f")(num)
      .replace(".00");
  }
}

function formatShortNumber(num) {
  if (!num) {
    return "";
  }
  return d3.format(num >= 1 ? ".2s" : ".2")(num);
}

/**
 * Shows the tooltip with the associated data.
 * @param {d3.tooltip} tooltip
 * @param {d3.event} event
 * @param {string} label
 * @param {string} value
 */
function showTooltip(tooltip, event, label, value) {
  const valueLabel = formatNumber(value);
  tooltip
    .style("opacity", 1)
    .style("left", event.pageX + 15 + "px")
    .style("top", event.pageY + 20 + "px")
    .html(`<b>${label}</b><br/>${valueLabel}`);
}

let currentTransform = "translate(0,0) scale(1)";

/**
 * Render a map on the specified canvas element, given the specified geographic
 * borders and the specified indicators.
 * @param {string} canvasName name of the SVG element that will contain the map.
 * @param {string} indicatorName name of the selected indicator.
 * @param {FeatureCollection} borderOutlines outlines of the geographic borders
 * to draw on the map.
 * @param {Map|Array} indicators map from FIPS to corresponding indicator.
 */
function renderMap(canvasName, indicatorName, borderOutlines, indicators) {
  // Clear any past svg elements
  d3.select("#" + canvasName + " svg .map")
    .selectAll("*")
    .remove();

  const canvas = d3.select("#" + canvasName + " svg");

  const width = document.getElementById(canvasName).clientWidth;
  const height = document.getElementById(canvasName).clientHeight;

  const indicatorType = getMetricType(indicatorName);

  const indicatorValues =
    indicatorType === "coordinate"
      ? indicators.map((v) => v[indicatorName])
      : Object.values(indicators);

  const quantileMin = quantile(indicatorValues, 0.01);
  const quantileMax = quantile(indicatorValues, 0.99);

  const color = d3
    .scaleQuantize()
    .range(palette)
    .domain([quantileMin, quantileMax])
    .nice();

  const projection = d3
    .geoAlbersUsa()
    .translate([width * 0.5, height * 0.45])
    .scale(width);

  projection.fitSize([width, height], borderOutlines);

  // Select the tooltip element
  const tooltip = d3.select("#" + canvasName + " .tooltip");

  // Draw the map
  canvas
    .insert("g", ":first-child")
    .attr("class", "map")
    .attr("transform", currentTransform)
    .selectAll("path")
    .data(borderOutlines.features)
    .enter()
    .append("path")
    .attr("d", d3.geoPath().projection(projection))
    .attr("stroke", "black")
    .attr("stroke-width", ".2px")
    .attr("fill", (county) => {
      if (indicatorType === "coordinate") {
        return defaultColor;
      }
      const fips = Number(county.id);
      return fips in indicators ? color(indicators[fips]) : defaultColor;
    })
    .on("mouseover", (d) => {
      if (indicatorType == "coordinate") {
        return;
      }
      const event = d3.event;
      const value = indicators[Number(d["id"])];
      showTooltip(tooltip, event, d["properties"]["display_name"], value);
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  if (indicatorType === "coordinate") {
    const indicatorMax = Math.max(...indicatorValues);
    canvas
      .select(".map")
      .selectAll("points")
      .data(indicators.sort((a, b) => a[indicatorName] - b[indicatorName]))
      .enter()
      .append("circle")
      .attr("cx", (d) => projection([d.longitude, d.latitude])?.[0])
      .attr("cy", (d) => projection([d.longitude, d.latitude])?.[1])
      .attr("fill", (d) => color(d[indicatorName]))
      .attr("fill-opacity", 0.8)
      .attr("r", (d) => {
        return 1 + Math.ceil((d[indicatorName] / indicatorMax) * 20);
      })
      .on("mouseover", (d) => {
        const event = d3.event;
        getNameForFips(d["fips"]).then((label) => {
          showTooltip(tooltip, event, label, d[indicatorName]);
        });
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });
  }

  // Add pan and zoom listeners.
  const zoom = d3
    .zoom()
    .scaleExtent([1, 5])
    .translateExtent([
      [0, 0],
      [width, height],
    ])
    .on("zoom", () => {
      const event = d3.event;
      currentTransform = event.transform;
      d3.selectAll(".map").attr("transform", event.transform);
    });
  d3.select("#" + canvasName + " svg").call(zoom);
  canvas.select(".zoom-in").on("click", () => {
    zoom.scaleBy(d3.select("#" + canvasName + " svg"), 1.3);
  });
  canvas.select(".zoom-out").on("click", () => {
    zoom.scaleBy(d3.select("#" + canvasName + " svg"), 1 / 1.3);
  });

  // Draw the legend
  let legend = d3.select("#" + canvasName + "_legend");
  legend.selectAll("*").remove();

  const legendElement = document.getElementById(canvasName + "_legend");
  const legend_width = legendElement.clientWidth;
  const legend_height = legendElement.clientHeight;

  const svg = legend
    .append("svg")
    .attr("width", legend_width)
    .attr("height", legend_height)
    .attr("viewBox", [0, 0, legend_width, legend_height])
    .style("overflow", "visible")
    .style("display", "block");

  const tickSize = 6;
  const marginTop = 0;
  const marginBottom = tickSize;
  const marginLeft = 0;
  const marginRight = 0;

  const thresholds = color.thresholds();

  const x = d3
    .scaleLinear()
    .domain([-1, color.range().length - 1])
    .rangeRound([marginLeft, legend_width - marginRight]);

  svg
    .append("g")
    .selectAll("rect")
    .data(color.range())
    .join("rect")
    .attr("x", (d, i) => x(i - 1))
    .attr("y", marginTop)
    .attr("width", (d, i) => x(i) - x(i - 1))
    .attr("height", legend_height - marginTop - marginBottom)
    .attr("height", legend_height)
    .attr("fill", (d) => d);

  // Set the legend title and draw the ticks.
  svg
    .append("g")
    .attr("transform", `translate(0,${legend_height - marginBottom})`)
    .call(
      d3
        .axisBottom(x)
        .tickFormat((i) => formatShortNumber(thresholds?.[i]))
        .tickSize(tickSize)
    )
    .call((g) =>
      g
        .selectAll(".tick line")
        .attr("y1", marginTop + marginBottom - legend_height)
    )
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .append("text")
        .attr("x", marginLeft)
        .attr("y", marginTop + marginBottom - legend_height - 2)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("display", "block")
        .attr("white-space", "nowrap")
        .text(getMetricLegend(indicatorName))
    );
}
