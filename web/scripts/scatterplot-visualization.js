// Render the scatterplot.
// Set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Attach an svg to the Append the svg object to the body of the page
var graph_regression = d3.select("#canvas_regression")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

// Read the data
d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv", function(data) {

// Add X axis
var x = d3.scaleLinear()
    .domain([0, 4000])
    .range([ 0, width ]);
graph_regression.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

// Add Y axis
var y = d3.scaleLinear()
    .domain([0, 500000])
    .range([ height, 0]);
graph_regression.append("g")
    .call(d3.axisLeft(y));

// Add dots
graph_regression.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.GrLivArea); } )
    .attr("cy", function (d) { return y(d.SalePrice); } )
    .attr("r", 1.5)
    .style("fill", "#69b3a2")
})