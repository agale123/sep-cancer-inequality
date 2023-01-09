/**
 * This file contains methods for rendering the map vizualizations.
 */

// Color Settings
const default_color_for_missing_data = "#fff7f3";
const palette = ["#fde0dd", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177", "#49006a"];

// County boarders
const counties_outlines = d3.json(
    "https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json");

/**
 * Updates the map on the specified canvas element based on the specified data source.
 * @param {string} canvas_name Name of the SVG element that will contain the map.
 * @param {string} data_source_path Path to the data source of the indicator, keyed off of FIPS.
 * @param {string} indicator_name Name of the indicator column.
 */
function updateMap(canvas_name, data_source_path, indicator_name) {

    // Load indicator data and render the map when ready.
    counties_outlines
        .then((counties) => {
            d3.csv(data_source_path)
                .then((data) => {
                    // Transform the CSV elements into a map FIPS -> indicator.
                    let data_map = new Map();
                    data.forEach(element => {
                        data_map.set(element.fips, element[indicator_name]);    
                    });

                    return data_map;
                })
                .then((indicators) => renderMap(canvas_name, counties, indicators));
        });
}

/**
 * Render a map on the specified canvas element, given the specified geographic boarders and
 * the specified indicators.
 * @param {string} canvas_name Name of the SVG element that will contain the map.
 * @param {FeatureCollection} boarder_outlines Outlines of the geographic boards to draw on the map.
 * @param {Map} indicators Map from FIPS to corresponding indicator.
 */
function renderMap(canvas_name, boarder_outlines, indicators) {

    const width = document.getElementById(canvas_name).clientWidth;
    const height = document.getElementById(canvas_name).clientHeight;

    const indicator_min = Math.min(...indicators.values());
    const indicator_max = Math.max(...indicators.values());

    // Palette from https://colorbrewer2.org/#type=sequential&scheme=BuPu&n=9
    let color = d3.scaleQuantize();
    color.range(palette)
    color.domain([indicator_min, indicator_max])

    let projection = d3.geoAlbersUsa()
        .scale(width)
        .translate([width / 2, height / 2]);

    // Draw the map
    let canvas = d3.select('#' + canvas_name);
    canvas.append("g")
        .selectAll("path")
        .data(boarder_outlines.features)
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
        .attr('stroke-width','.2px')
        .attr("fill", (county) =>
            indicators.has(county.id) ? color(indicators.get(county.id)) : default_color_for_missing_data);
}