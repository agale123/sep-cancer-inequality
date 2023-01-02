var graph_map_one = d3.select("#canvas_map_one"),
    width = +graph_map_one.attr("width"),
    height = +graph_map_one.attr("height");

var graph_map_two = d3.select("#canvas_map_two"),
    width = +graph_map_two.attr("width"),
    height = +graph_map_two.attr("height");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
    .scale(70)
    .center([0,20])
    .translate([width / 2, height / 2]);

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
    .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
    .range(d3.schemeBlues[7]);

// Load external data and refresh the visualization.
d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) { data.set(d.code, +d.pop); })
    .await(callback_map_one_data_ready);

d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) { data.set(d.code, +d.pop); })
    .await(callback_map_two_data_ready);

function render_map(canvas, topo) {        
    // Draw the map
    canvas.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        // Draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        // Set the color of each country
        .attr("fill", function (d) {
            d.total = data.get(d.id) || 0;
            return colorScale(d.total);
        });
}

function callback_map_one_data_ready(error, topo) {
    render_map(graph_map_one, topo)
}

function callback_map_two_data_ready(error, topo) {
    render_map(graph_map_two, topo)
}