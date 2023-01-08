// Set the dimensions and margins of the graph
const s_margin = { top: 30, right: 30, bottom: 60, left: 60 };
const buffer = 0.05;

/**
 * Update the scatterplot to show the relationship between the two variables.
 * @param {string} xMetric 
 * @param {string} yMetric 
 */
async function updateScatterplot(xMetric, yMetric) {
    // Clear any past svg elements
    d3.select("#canvas_scatterplot").selectAll("*").remove();

    // Get the width for the scatterplot element.
    const clientWidth =
        document.getElementById("canvas_scatterplot").clientWidth;
    const s_width = clientWidth - s_margin.left - s_margin.right;
    const s_height = 400 - s_margin.top - s_margin.bottom;

    // Attach an svg to the Append the svg object to the body of the page
    const scatterplot = d3.select("#canvas_scatterplot")
        .append("svg")
        .attr("width",
            s_width + s_margin.left + s_margin.right)
        .attr("height",
            s_height + s_margin.top + s_margin.bottom)
        .append("g")
        .attr("transform",
            `translate(${s_margin.left}, ${s_margin.top})`);

    // Read the data
    let data = await getData([xMetric, yMetric]);

    // Remove any missing datapoints    
    data = data.filter(d => d[xMetric] && d[yMetric]);

    // Add X axis
    const xMin = d3.min(data, (d) => d[xMetric]);
    const xMax = d3.max(data, (d) => d[xMetric]);
    const x = d3.scaleLinear()
        .domain([
            xMin - buffer * (xMax - xMin),
            xMax + buffer * (xMax - xMin)
        ])
        .range([0, s_width]);
    scatterplot.append("g")
        .attr("transform", `translate(0,${s_height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("~s")));
    scatterplot.append("text")
        .attr("text-anchor", "middle")
        .attr("x", s_width / 2)
        .attr("y", s_height + s_margin.top + 15)
        .text(getMetricLabel(xMetric));

    // Add Y axis
    const yMin = d3.min(data, (d) => d[yMetric]);
    const yMax = d3.max(data, (d) => d[yMetric]);
    const y = d3.scaleLinear()
        .domain([
            yMin - buffer * (yMax - yMin),
            yMax + buffer * (yMax - yMin)
        ])
        .range([s_height, 0]);
    scatterplot.append("g").call(d3.axisLeft(y).tickFormat(d3.format("~s")));
    scatterplot.append("text")
        .attr("text-anchor", "center")
        .attr("transform", "rotate(-90)")
        .attr("x", -(s_margin.top + s_margin.bottom + s_height / 2))
        .attr("y", -s_margin.left + 20)
        .text(getMetricLabel(yMetric))

    // Add dots
    scatterplot.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(parseFloat(d[xMetric])))
        .attr("cy", d => y(parseFloat(d[yMetric])))
        .attr("r", 1.5)
        .style("fill", "#69b3a2");

    // Render metric descriptions
    document.getElementById("scatter_x").innerHTML =
        `<b>${getMetricLabel(xMetric)}</b>: ${getMetricDescription(xMetric)}`;
    document.getElementById("scatter_y").innerHTML =
        `<b>${getMetricLabel(yMetric)}</b>: ${getMetricDescription(yMetric)}`;
}