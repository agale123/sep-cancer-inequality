/**
 * This file contains methods for rendering the map vizualizations.
 */

// Color Settings
// Viridis palette from https://observablehq.com/@d3/color-schemes
const default_color_for_missing_data = "#fff7f3";
const palette = ["#440154", "#46327e", "#365c8d", "#277f8e", "#1fa187", "#4ac16d", "#a0da39", "#fde725"].reverse();

// County borders
const counties_outlines = d3.json(
    "https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json");

// State borders
const states_outlines = d3.json(
    "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json");

/**
 * Updates the map on the specified canvas element based on the specified data source.
 * @param {string} canvas_name Name of the SVG element that will contain the map.
 * @param {string} indicator_name Name of the indicator column.
 */
function updateMap(canvas_name, indicator_name) {

    // Load indicator data and render the map when ready.
    Promise.all([
        getMetricType(indicator_name) === "county" ? counties_outlines : states_outlines,
        getDataMap(indicator_name)
    ]).then(([outlines, data]) => {
        renderMap(canvas_name, outlines, data);
    });
}

/**
 * Render a map on the specified canvas element, given the specified geographic borders and
 * the specified indicators.
 * @param {string} canvas_name Name of the SVG element that will contain the map.
 * @param {FeatureCollection} border_outlines Outlines of the geographic boarders to draw on the map.
 * @param {Map} indicators Map from FIPS to corresponding indicator.
 */
function renderMap(canvas_name, border_outlines, indicators) {

    const width = document.getElementById(canvas_name).clientWidth;
    const height = document.getElementById(canvas_name).clientHeight;

    const indicator_min = Math.min(...Object.values(indicators));
    const indicator_max = Math.max(...Object.values(indicators));

    let color = d3.scaleQuantize();
    color.range(palette)
    color.domain([indicator_min, indicator_max])

    let projection = d3.geoAlbersUsa()
        .scale(width)
        .translate([width / 2, height / 2]);

    let canvas = d3.select('#' + canvas_name);

    // Clear any past svg elements
    canvas.selectAll("*").remove();

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
            let fips = Number(county.id);

            return fips in indicators ? color(indicators[fips]) : default_color_for_missing_data
        });
}