/**
 * This file is responsible for providing data for rendering the plots.
 */

// Stores the data promise once it is fetched.
let dataPromise;

/**
 * TODO: Right now this function just returns all the county level data. This
 * will need to be augmented to handle state data and lat/long data.
 * @param {string[]} metrics list of metrics to include in the result 
 * @returns a promise that resolves to the county level data.
 */
function getData(metrics) {
    if (!dataPromise) {
        dataPromise = new Promise((resolve, reject) => {
            d3.csv("https://raw.githubusercontent.com/agale123/sep-cancer-inequality/main/data/final/county_data.csv")                
                .then((data) => {
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
    "median_household_income": "Median Household Income",
};

/**
 * @param {string} metric 
 * @returns a formatted version of the metric name
 */
function getMetricLabel(metric) {
    return METRIC_LABELS[metric];
}

const METRIC_DESCRIPTIONS = {
    "cancer_incidence_rate_per_100000": "The age-adjusted number of cancer cases per 100,000 residents. This data comes from NCI.",
    "cancer_mortality_rate_per_100000": "The age-adjusted number of cancer deaths per 100,000 residents. This data comes from NCI.",
    "below_poverty_percent": "The percent of residents who live below the poverty level.",
    "median_household_income": "The median household income for the area."
};

/**
 * @param {string} metric 
 * @returns a formatted description of the metric
 */
function getMetricDescription(metric) {
    return METRIC_DESCRIPTIONS[metric];
}
