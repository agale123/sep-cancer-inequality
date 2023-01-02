//
// Render distributions
//

// Set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Append the svg object to the element
var canvas_histogram = d3.select("#canvas-histogram")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Load the data and execute a callback.
d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_doubleHist.csv", function(data) {

    // X axis: scale and draw.
    var x = d3.scaleLinear()
        .domain([-4,9])
        .range([0, width]);

    canvas_histogram.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Set the parameters for the histogram
    var histogram = d3.histogram()
        .value(function(d) { return +d.value; })  // The values,
        .domain(x.domain())                       // ... the domain of the graphic
        .thresholds(x.ticks(40));                 // ... then the number of bins.

    // Fetch the bins for both variables.
    var bins1 = histogram(data.filter( function(d){return d.type === "variable 1"} ));
    var bins2 = histogram(data.filter( function(d){return d.type === "variable 2"} ));

    // Y axis: scale and draw.
    var y = d3.scaleLinear()
        .range([height, 0]);
        y.domain([0, d3.max(bins1, function(d) { return d.length; })]);
        canvas_histogram.append("g")
        .call(d3.axisLeft(y));

    // Append the bars for series 1
    canvas_histogram.selectAll("rect")
        .data(bins1)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
        .attr("height", function(d) { return height - y(d.length); })
        .style("fill", "#69b3a2")
        .style("opacity", 0.6)

    // Append the bars for series 2
    canvas_histogram.selectAll("rect2")
        .data(bins2)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
        .attr("height", function(d) { return height - y(d.length); })
        .style("fill", "#404080")
        .style("opacity", 0.6)

    // Setup the legend
    canvas_histogram.append("circle").attr("cx",300).attr("cy",30).attr("r", 6).style("fill", "#69b3a2")
    canvas_histogram.append("circle").attr("cx",300).attr("cy",60).attr("r", 6).style("fill", "#404080")
    canvas_histogram.append("text").attr("x", 320).attr("y", 30).text("variable A").style("font-size", "15px").attr("alignment-baseline","middle")
    canvas_histogram.append("text").attr("x", 320).attr("y", 60).text("variable B").style("font-size", "15px").attr("alignment-baseline","middle")
});