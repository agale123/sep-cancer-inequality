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
    "breast_cancer_incidence_rate_per_100000": "Breast Cancer Incidence Rate",
    "breast_cancer_mortality_rate_per_100000": "Breast Cancer Mortality Rate",
    "colorectal_cancer_incidence_rate_per_100000": "Colorectal Cancer Incidence Rate",
    "colorectal_cancer_mortality_rate_per_100000": "Colorectal Cancer Mortality Rate",
    "leukemia_cancer_incidence_rate_per_100000": "Leukemia Incidence Rate",
    "leukemia_cancer_mortality_rate_per_100000": "Leukemia Mortality Rate",
    "lung_cancer_incidence_rate_per_100000": "Lung Cancer Incidence Rate",
    "lung_cancer_mortality_rate_per_100000": "Lung Cancer Mortality Rate",
    "non_hodgkin_lymphoma_cancer_incidence_rate_per_100000": "Non-Hodgkin Lymphoma Incidence Rate",
    "non_hodgkin_lymphoma_cancer_mortality_rate_per_100000": "Non-Hodgkin Lymphoma Mortality Rate",
    "prostate_cancer_incidence_rate_per_100000": "Prostate Cancer Incidence Rate",
    "prostate_cancer_mortality_rate_per_100000": "Prostate Cancer Mortality Rate",
    "median_household_income": "Median Household Income",
    "language_isolation_percent": "Language Isolation Percent",
    "over_65_percent": "Over 65 Percent",
    "below_poverty_percent": "Below Poverty Percent",
    "uninsured_percent": "Uninsured Percent",
    "uv_exposure": "UV Exposure Index",
    "low_income_low_access_share": "Low Income and Low Access to Food",
    "non_english_speaking": "Non English Speaking Percent",
    "population_in_poverty_percent": "Below Poverty Percent",
    "population_over_25_no_high_school_diploma_percent": "Percent Without High School Diploma",
    "population_uninsured_percent": "Uninsured Percent",
    "population_minority_percent": "Minority Population Percent",
    "walkability_index": "Walkability Index"
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
    "breast_cancer_incidence_rate_per_100000": "Breast Cancer Incidence Rate",
    "breast_cancer_mortality_rate_per_100000": "Breast Cancer Mortality Rate",
    "colorectal_cancer_incidence_rate_per_100000": "Colorectal Cancer Incidence Rate",
    "colorectal_cancer_mortality_rate_per_100000": "Colorectal Cancer Mortality Rate",
    "leukemia_cancer_incidence_rate_per_100000": "Leukemia Incidence Rate",
    "leukemia_cancer_mortality_rate_per_100000": "Leukemia Mortality Rate",
    "lung_cancer_incidence_rate_per_100000": "Lung Cancer Incidence Rate",
    "lung_cancer_mortality_rate_per_100000": "Lung Cancer Mortality Rate",
    "non_hodgkin_lymphoma_cancer_incidence_rate_per_100000": "Non-Hodgkin Lymphoma Incidence Rate",
    "non_hodgkin_lymphoma_cancer_mortality_rate_per_100000": "Non-Hodgkin Lymphoma Mortality Rate",
    "prostate_cancer_incidence_rate_per_100000": "Prostate Cancer Incidence Rate",
    "prostate_cancer_mortality_rate_per_100000": "Prostate Cancer Mortality Rate",
    "median_household_income": "The median household income for the area.",
    "language_isolation_percent": "Language Isolation Percent",
    "over_65_percent": "Over 65 Percent",
    "below_poverty_percent": "The percent of residents who live below the poverty level.",
    "uninsured_percent": "Uninsured Percent",
    "uv_exposure": "UV Exposure Index",
    "low_income_low_access_share": "Low Income and Low Access to Food",
    "non_english_speaking": "Non English Speaking Percent",
    "population_in_poverty_percent": "The percent of residents who live below the poverty level.",
    "population_over_25_no_high_school_diploma_percent": "Percent Without High School Diploma",
    "population_uninsured_percent": "Uninsured Percent",
    "population_minority_percent": "Minority Population Percent",
    "walkability_index": "Walkability Index"
};

/**
 * @param {string} metric 
 * @returns a formatted description of the metric
 */
function getMetricDescription(metric) {
    return METRIC_DESCRIPTIONS[metric];
}
