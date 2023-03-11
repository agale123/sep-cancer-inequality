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

const MAP_MARGIN = { top: 0, right: 0, bottom: 35, left: 0 };

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

function addUnits(formatted, unit) {
  if (unit === "percent") {
    return formatted + "%";
  } else if (unit === "dollars") {
    return "$" + formatted;
  }
  return formatted;
}

function formatNumber(num, unit) {
  if (num === undefined) {
    return "No data";
  } else {
    const formatted = d3
      .format(num >= 10 ? (!(num % 1) ? "," : ",.2f") : ".2f")(num)
      .replace(".00", "");
    return addUnits(formatted, unit);
  }
}

function formatShortNumber(num, unit) {
  if (!num) {
    return "";
  }

  const formatted = d3.format(num >= 1 ? ".2s" : ".2")(num);
  return addUnits(formatted, unit);
}

/**
 * Shows the tooltip with the associated data.
 * @param {d3.tooltip} tooltip
 * @param {d3.event} event
 * @param {string} label
 * @param {string} value
 * @param {string} unit
 */
function showTooltip(tooltip, event, label, value, unit) {
  const valueLabel = formatNumber(value, unit);
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
  // Clear any past map elements
  d3.select("#" + canvasName + " svg .map-canvas")
    .selectAll("*")
    .remove();
  d3.select("#" + canvasName + " svg .map-canvas").remove();
  d3.select("#" + canvasName + " svg .clip-path").remove();

  const width =
    document.getElementById(canvasName).clientWidth -
    MAP_MARGIN.left -
    MAP_MARGIN.right;
  const height =
    document.getElementById(canvasName).clientHeight -
    MAP_MARGIN.top -
    MAP_MARGIN.bottom;

  const canvas = d3
    .select("#" + canvasName + " svg")
    .attr("width", width + MAP_MARGIN.left + MAP_MARGIN.right)
    .attr("height", height + MAP_MARGIN.top + MAP_MARGIN.bottom);

  canvas
    .append("defs")
    .attr("class", "clip-path")
    .append("clipPath")
    .attr("id", "map-clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);
  const mapCanvas = canvas
    .insert("g", ":first-child")
    .attr("class", "map-canvas")
    .attr("transform", `translate(${MAP_MARGIN.left}, ${MAP_MARGIN.top})`)
    .attr("width", width)
    .attr("height", height)
    .attr("clip-path", "url(#map-clip)");

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

  const metricUnit = getMetricUnit(indicatorName);

  // Draw the map
  mapCanvas
    .insert("g")
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
      const event = d3.event;
      if (indicatorType == "coordinate") {
        return;
      }
      const value = indicators[Number(d["id"])];
      showTooltip(
        tooltip,
        event,
        d["properties"]["display_name"],
        value,
        metricUnit
      );
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
      [MAP_MARGIN.left, MAP_MARGIN.top],
      [width + MAP_MARGIN.left, height + MAP_MARGIN.bottom],
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
  const legendWidth = (width + MAP_MARGIN.left + MAP_MARGIN.right) / 2;
  const legendHeight = 30;

  // Clear previous legend
  canvas.select(".legend").remove();

  const legend = canvas
    .append("g")
    .attr("class", "legend")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .attr(
      "transform",
      `translate(${legendWidth}, ${
        height + MAP_MARGIN.top + MAP_MARGIN.bottom - legendHeight
      })`
    );

  const tickSize = 8;
  const titleSize = 10;
  const thresholds = color.thresholds();

  const x = d3
    .scaleLinear()
    .domain([-1, color.range().length - 1])
    .rangeRound([0, legendWidth]);

  // Add the rectangles
  legend
    .append("g")
    .selectAll("rect")
    .data(color.range())
    .join("rect")
    .attr("x", (d, i) => x(i - 1))
    .attr("y", titleSize)
    .attr("width", (d, i) => x(i) - x(i - 1))
    .attr("height", tickSize)
    .attr("fill", (d) => d);

  // Add the ticks
  legend
    .append("g")
    .attr("transform", `translate(0, ${titleSize})`)
    .call(
      d3
        .axisBottom(x)
        .tickFormat((i) => formatShortNumber(thresholds?.[i], metricUnit))
        .tickSize(tickSize)
    )
    .call((g) => g.select(".domain").remove());

  // Add the legend title
  legend
    .append("text")
    .attr("x", 0)
    .attr("y", tickSize)
    .attr("font-size", "10")
    .text(getMetricLegend(indicatorName));
}
