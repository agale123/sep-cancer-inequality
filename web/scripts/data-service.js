/**
 * This file is responsible for providing data for rendering the plots.
 */

// Stores the data promise once it is fetched.
let dataPromise;

/**
 * @returns a promise that resolves to the county level data.
 */
function getData() {
    if (!dataPromise) {
        dataPromise = new Promise((resolve, reject) => {
            d3.csv("https://raw.githubusercontent.com/agale123/sep-cancer-inequality/main/data/final/county_data.csv", (data) => {
                if (data) {
                    // Parse all values as floats
                    data = data.map(d => {
                        Object.keys(d).forEach((key) => {
                            d[key] = d[key] ? parseFloat(d[key]) : undefined;
                        });
                        return d;
                    });
                    resolve(data);
                } else {
                    reject("Failed to load data");
                }
            });
        });
    }
    return dataPromise;
}

const METRIC_LABELS = {
    "cancer_incidence_rate_per_100000": "Cancer Incidence Rate",
    "cancer_mortality_rate_per_100000": "Cancer Mortality Rate",
    "below_poverty_percent": "Percent Below Poverty",
};

/**
 * @param {string} metric 
 * @returns a formatted version of the metric name
 */
function getFormattedText(metric) {
    return METRIC_LABELS[metric];
}

