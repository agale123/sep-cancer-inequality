/**
 * This file contains methods for rendering the map vizualizations.
 */

// Color Settings
// Viridis palette from https://observablehq.com/@d3/color-schemes
const default_color_for_missing_data = "#ffffff";
const palette = ["#440154", "#46327e", "#365c8d", "#277f8e", "#1fa187", "#4ac16d", "#a0da39", "#fde725"].reverse();

// County borders
const counties_outlines = d3.json(
    "https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json");

// State borders
const states_outlines = d3.json(
    "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json");

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
 * @param {string} canvas_name name of the SVG element that will contain the map.
 * @param {string} indicatorName name of the indicator column.
 */
function updateMap(canvas_name, indicatorName) {

    // Load indicator data and render the map when ready.
    Promise.all([
        getMetricType(indicatorName) === "county"
            ? counties_outlines : states_outlines,
        getMetricType(indicatorName) === "coordinate"
            ? getData(indicatorName) : getDataMap(indicatorName)
    ]).then(([outlines, data]) => {
        renderMap(canvas_name, indicatorName, outlines, data);
    });
}

/**
 * Render a map on the specified canvas element, given the specified geographic borders and
 * the specified indicators.
 * @param {string} canvas_name name of the SVG element that will contain the map.
 * @param {string} indicatorName name of the selected indicator.
 * @param {FeatureCollection} border_outlines outlines of the geographic boarders to draw on the map.
 * @param {Map|Array} indicators map from FIPS to corresponding indicator.
 */
function renderMap(canvas_name, indicatorName, border_outlines, indicators) {

    const width = document.getElementById(canvas_name).clientWidth;
    const height = document.getElementById(canvas_name).clientHeight;

    const indicatorValues = getMetricType(indicatorName) === "coordinate"
        ? indicators.map(v => v[indicatorName])
        : Object.values(indicators);

    const indicatorMin = Math.min(...indicatorValues);
    const indicatorMax = Math.max(...indicatorValues);
    const quantileMin = quantile(indicatorValues, 0.01);
    const quantileMax = quantile(indicatorValues, 0.99);

    let color = d3.scaleQuantize();
    color.range(palette)
    color.domain([quantileMin, quantileMax])

    let projection = d3.geoAlbersUsa()
        .scale(width)
        .translate([width / 2, height / 2]);

    let canvas = d3.select('#' + canvas_name);

    // Clear any past svg elements
    canvas.selectAll("*").remove();

    // Select the tooltip element
    let tooltip = d3.select('#' + canvas_name + '_tooltip');

    // Draw the map
    canvas.append("g")
        .selectAll("path")
        .data(border_outlines.features)
        .enter()
        .append("path")
        .attr("width", width)
        .attr("height", height)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .attr('stroke', 'black')
        .attr('stroke-width', '.2px')
        .attr("fill", (county) => {
            if (getMetricType(indicatorName) === "coordinate") {
                return default_color_for_missing_data;
            }

            let fips = Number(county.id);
            return fips in indicators ? color(indicators[fips]) : default_color_for_missing_data;
        })
        .on("mousemove", (region, i) => {
            let fips = Number(region.id);
            let value = fips in indicators ? Math.floor(indicators[fips]) : "N/A";

            // Here we should lookup region details from the Data Service by FIPS. For now,
            // use the name provided by the county or state border data.
            let region_name = region.properties.name ? region.properties.name : region.properties.NAME;

            tooltip
                .classed("tooltip-hidden", false)
                .attr("style", "left:" + (d3.event.pageX + 15) + "px;top:" + (d3.event.pageY + 20) + "px")
                .html(`Name: ${region_name}, Metric: ${value}`)
        })
        .on("mouseout", (d, i) => tooltip.classed("tooltip-hidden", true));

    if (getMetricType(indicatorName) === "coordinate") {
        canvas.selectAll("points")
            .data(indicators.sort((a, b) => a[indicatorName] - b[indicatorName]))
            .enter()
            .append("circle")
            .attr("cx", (d) => projection([d.longitude, d.latitude])?.[0])
            .attr("cy", (d) => projection([d.longitude, d.latitude])?.[1])
            .attr("fill", (d) => color(d[indicatorName]))
            .attr("fill-opacity", 0.8)
            .attr("r", (d) => {
                return Math.ceil(d[indicatorName] / indicatorMax * 20);
            });
    }

    // Set the legend title
    document.getElementById(canvas_name + "_legend_title").innerHTML = `${getMetricDescription(indicatorName)}`;

    // Draw the legend
    let gradient_id = canvas_name + "_linear_gradient";
    let legend = d3.select('#' + canvas_name + "_legend");
    let defs = legend.append("defs");
    let linearGradient = defs.append("linearGradient")
        .attr("id", gradient_id);

    let colorScale = d3.scaleLinear()
        .range(palette);

    linearGradient.selectAll("stop")
        .data(colorScale.range())
        .enter().append("stop")
        .attr("offset", (d, i) => i / (colorScale.range().length - 1))
        .attr("stop-color", (d) => d);

    legend.append("rect")
        .attr("width", "100%")
        .attr("height", 10)
        .style("fill", "url(#" + gradient_id + ")");

    // Annotate the legend

    document.getElementById(canvas_name + "_legend_left").innerHTML = `${Math.floor(indicatorMin)}`;
    document.getElementById(canvas_name + "_legend_right").innerHTML = `${Math.ceil(indicatorMax)}`;
}