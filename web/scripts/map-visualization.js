/**
 * This file contains methods for rendering the map vizualizations.
 */

// Color Settings
// Viridis palette from https://observablehq.com/@d3/color-schemes
const defaultColor = "#ffffff";
const palette = ["#440154", "#46327e", "#365c8d", "#277f8e", "#1fa187", "#4ac16d", "#a0da39", "#fde725"].reverse();

// County borders
const counties_outlines = d3.json(
    "https://raw.githubusercontent.com/agale123/sep-cancer-inequality/main/data/regions/us-counties.json");

// State borders
const states_outlines = d3.json(
    "https://raw.githubusercontent.com/agale123/sep-cancer-inequality/main/data/regions/us-states.json");

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
};

/**
 * Updates the map on the specified canvas element based on the specified data source.
 * @param {string} canvasName name of the SVG element that will contain the map.
 * @param {string} indicatorName name of the indicator column.
 */
function updateMap(canvasName, indicatorName) {

    // Load indicator data and render the map when ready.
    Promise.all([
        getMetricType(indicatorName) === "county"
            ? counties_outlines : states_outlines,
        getMetricType(indicatorName) === "coordinate"
            ? getData(indicatorName) : getDataMap(indicatorName)
    ]).then(([outlines, data]) => {
        renderMap(canvasName, indicatorName, outlines, data);
    });
}

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
    d3.select("#" + canvasName).selectAll("*").remove();

    const canvas = d3.select('#' + canvasName)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "300px");

    const width = document.getElementById(canvasName).clientWidth;
    const height = document.getElementById(canvasName).clientHeight;

    const indicatorType = getMetricType(indicatorName);

    const indicatorValues = indicatorType === "coordinate"
        ? indicators.map(v => v[indicatorName])
        : Object.values(indicators);

    const quantileMin = quantile(indicatorValues, 0.01);
    const quantileMax = quantile(indicatorValues, 0.99);

    const color = d3.scaleQuantize()
        .range(palette)
        .domain([quantileMin, quantileMax])
        .nice();

    const projection = d3.geoAlbersUsa()
        .scale(width)
        .translate([width / 2, height / 2]);

    // Select the tooltip element
    const tooltip = d3.select('#' + canvasName)
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Draw the map
    canvas.append("g")
        .selectAll("path")
        .data(borderOutlines.features)
        .enter()
        .append("path")
        .attr("d", d3.geoPath().projection(projection))
        .attr('stroke', 'black')
        .attr('stroke-width', '.2px')
        .attr("fill", (county) => {
            if (indicatorType === "coordinate") {
                return defaultColor;
            }

            let fips = Number(county.id);
            return fips in indicators ? color(indicators[fips]) : defaultColor;
        })
        .on("mouseover", (d) => {
            const fips = Number(d["id"]);
            const value =
                fips in indicators ? Math.floor(indicators[fips]) : "N/A";
            const event = d3.event;
            tooltip.style("opacity", 1)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY + 20) + "px")
                .html(`<b>${d.properties.display_name}</b><br/>Value: ${value}`);
        })
        .on("mouseout", (d) => {
            tooltip.style("opacity", 0);
        });

    if (indicatorType === "coordinate") {
        const indicatorMax = Math.max(...indicatorValues);
        canvas.selectAll("points")
            .data(indicators
                .sort((a, b) => a[indicatorName] - b[indicatorName]))
            .enter()
            .append("circle")
            .attr("cx", (d) => projection([d.longitude, d.latitude])?.[0])
            .attr("cy", (d) => projection([d.longitude, d.latitude])?.[1])
            .attr("fill", (d) => color(d[indicatorName]))
            .attr("fill-opacity", 0.8)
            .attr("r", (d) => {
                return 1 + Math.ceil(d[indicatorName] / indicatorMax * 20);
            });
    }

    // Set the legend title
    document.getElementById(canvasName + "_legend_title").innerHTML = `${getMetricDescription(indicatorName)}`;

    // Draw the legend
    let gradient_id = canvasName + "_linear_gradient";
    let legend = d3.select('#' + canvasName + "_legend");
    let defs = legend.append("defs");
    let linearGradient = defs.append("linearGradient")
        .attr("id", gradient_id);

    linearGradient.selectAll("stop")
        .data(palette)
        .enter().append("stop")
        .attr("offset", (d, i) => i / (palette.length - 1))
        .attr("stop-color", (d) => d);

    legend.append("rect")
        .attr("width", "100%")
        .attr("height", 10)
        .style("fill", "url(#" + gradient_id + ")");

    // Annotate the legend
    // The thresholds are the gaps between the color range so we should ideally
    // render all the color squares with ticks between them. 
    const thresholds = color.thresholds();
    document.getElementById(canvasName + "_legend_left").innerHTML =
        `${d3.format(".2s")(thresholds[0])}`;
    document.getElementById(canvasName + "_legend_right").innerHTML =
        `${d3.format(".2s")(thresholds[thresholds.length - 1])}`;
}