/**
 * This file is responsible for providing data for rendering the plots.
 */

/** Helper to create a promise to request a dataset. */
function createDataPromise(url) {
    return new Promise((resolve, reject) => {
        d3.csv(url).then((data) => {
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

// Stores the data promises once they are fetched.
let dataPromises = {};

function getCountyData() {
    if (!dataPromises["county"]) {
        dataPromises["county"] = createDataPromise(
            "https://raw.githubusercontent.com/agale123/sep-cancer-inequality/main/data/final/county_data.csv");
    }
    return dataPromises["county"];
}

function getStateData() {
    if (!dataPromises["state"]) {
        dataPromises["state"] = createDataPromise(
            "https://raw.githubusercontent.com/agale123/sep-cancer-inequality/main/data/final/state_data.csv");

    }
    return dataPromises["state"];
}

const COORDINATE_FILES = {
    "oil_barrels_spilled": "oil_accidents.csv",
};

function getCoordinateData(metric) {
    if (!dataPromises[metric]) {
        dataPromises[metric] = createDataPromise(
            "https://raw.githubusercontent.com/agale123/sep-cancer-inequality/main/data/final/"
            + COORDINATE_FILES[metric]);

    }
    return dataPromises[metric];
}

/**
 * @param {string} metric metric ID to fetch data for
 * @returns a promise that resolves to an array of the requested data
 */
function getData(metric) {
    const type = getMetricType(metric);
    if (type === "county") {
        return getCountyData().then(data => data.map(d => {
            return { "fips": d["fips"], [metric]: d[metric] };
        }));
    } else if (type === "state") {
        return getStateData().then(data => data.map(d => {
            return { "fips": d["fips"], [metric]: d[metric] };
        }));
    } else if (type === "coordinate") {
        return getCoordinateData(metric);
    }
    throw Error("Unknown metric type");
}

/**
 * @param {string} metric metric ID to fetch data for
 * @returns a promise that resolves to a map keyed on FIPS of the requested
 * data. Filters out entries that don't have a value for the metric. If there
 * are multiple values for the same key, they are added.
 */
function getDataMap(metric) {
    return getData(metric).then(data =>
        data.filter(d => d[metric] !== undefined)
            .reduce((acc, val) => {
                const fips = parseInt(val["fips"]);
                if (!acc[fips]) {
                    acc[fips] = 0;
                }
                acc[fips] += val[metric];
                return acc;
            }, {}));
}

const METRICS = [
    // County level
    { "id": "cancer_incidence_rate_per_100000", "label": "Cancer Incidence Rate", "desc": "The age-adjusted number of cancer cases per 100,000 residents. This data comes from NCI.", "type": "county" },
    { "id": "cancer_mortality_rate_per_100000", "label": "Cancer Mortality Rate", "desc": "The age-adjusted number of cancer deaths per 100,000 residents. This data comes from NCI.", "type": "county" },
    { "id": "breast_cancer_incidence_rate_per_100000", "label": "Breast Cancer Incidence Rate", "desc": "Breast Cancer Incidence Rate", "type": "county" },
    { "id": "breast_cancer_mortality_rate_per_100000", "label": "Breast Cancer Mortality Rate", "desc": "Breast Cancer Mortality Rate", "type": "county" },
    { "id": "colorectal_cancer_incidence_rate_per_100000", "label": "Colorectal Cancer Incidence Rate", "desc": "Colorectal Cancer Incidence Rate", "type": "county" },
    { "id": "colorectal_cancer_mortality_rate_per_100000", "label": "Colorectal Cancer Mortality Rate", "desc": "Colorectal Cancer Mortality Rate", "type": "county" },
    { "id": "leukemia_cancer_incidence_rate_per_100000", "label": "Leukemia Incidence Rate", "desc": "Leukemia Incidence Rate", "type": "county" },
    { "id": "leukemia_cancer_mortality_rate_per_100000", "label": "Leukemia Mortality Rate", "desc": "Leukemia Mortality Rate", "type": "county" },
    { "id": "lung_cancer_incidence_rate_per_100000", "label": "Lung Cancer Incidence Rate", "desc": "Lung Cancer Incidence Rate", "type": "county" },
    { "id": "lung_cancer_mortality_rate_per_100000", "label": "Lung Cancer Mortality Rate", "desc": "Lung Cancer Mortality Rate", "type": "county" },
    { "id": "non_hodgkin_lymphoma_cancer_incidence_rate_per_100000", "label": "Non-Hodgkin Lymphoma Incidence Rate", "desc": "Non-Hodgkin Lymphoma Incidence Rate", "type": "county" },
    { "id": "non_hodgkin_lymphoma_cancer_mortality_rate_per_100000", "label": "Non-Hodgkin Lymphoma Mortality Rate", "desc": "Non-Hodgkin Lymphoma Mortality Rate", "type": "county" },
    { "id": "prostate_cancer_incidence_rate_per_100000", "label": "Prostate Cancer Incidence Rate", "desc": "Prostate Cancer Incidence Rate", "type": "county" },
    { "id": "prostate_cancer_mortality_rate_per_100000", "label": "Prostate Cancer Mortality Rate", "desc": "Prostate Cancer Mortality Rate", "type": "county" },
    { "id": "median_household_income", "label": "Median Household Income", "desc": "The median household income for the area.", "type": "county" },
    { "id": "over_65_percent", "label": "Over 65 Percent", "desc": "Over 65 Percent", "type": "county" },
    { "id": "uv_exposure", "label": "UV Exposure Index", "desc": "UV Exposure Index", "type": "county" },
    { "id": "low_income_low_access_share", "label": "Low Income and Low Access to Food", "desc": "Low Income and Low Access to Food", "type": "county" },
    { "id": "non_english_speaking", "label": "Non English Speaking Percent", "desc": "Non English Speaking Percent", "type": "county" },
    { "id": "population_in_poverty_percent", "label": "Below Poverty Percent", "desc": "The percent of residents who live below the poverty level.", "type": "county" },
    { "id": "population_over_25_no_high_school_diploma_percent", "label": "Percent Without High School Diploma", "desc": "Percent Without High School Diploma", "type": "county" },
    { "id": "population_uninsured_percent", "label": "Uninsured Percent", "desc": "Uninsured Percent", "type": "county" },
    { "id": "population_minority_percent", "label": "Minority Population Percent", "desc": "Minority Population Percent", "type": "county" },
    { "id": "walkability_index", "label": "Walkability Index", "desc": "Walkability Index", "type": "county" },
    { "id": "hospital_beds_per_100000", "label": "Hospital Beds per 100,000", "desc": "Hospital beds per 100,000 residents", "type": "county" },
    { "id": "median_aqi", "label": "Median AQI", "desc": "Median AQI", "type": "county" },
    // State level
    { "id": "cervical_cancer_incidence_rate_per_100000", "label": "Cervical Incidence Rate", "desc": "Cervical Incidence Rate", "type": "state" },
    { "id": "cervical_cancer_mortality_rate_per_100000", "label": "Cervical Mortality Rate", "desc": "Cervical Mortality Rate", "type": "state" },
    { "id": "melanoma_cancer_incidence_rate_per_100000", "label": "Melanoma Incidence Rate", "desc": "Melanoma Incidence Rate", "type": "state" },
    { "id": "melanoma_cancer_mortality_rate_per_100000", "label": "Melanoma Mortality Rate", "desc": "Melanoma Mortality Rate", "type": "state" },
    { "id": "colorectal_screening_percent", "label": "Colon Cancer Screening Percent", "desc": "Colon Cancer Screening Percent", "type": "state" },
    { "id": "smoking_percent", "label": "Smoking Percent", "desc": "Smoking percent", "type": "state" },
    { "id": "hpv_vaccine_percent", "label": "HPV Vaccine Percent", "desc": "HPV Vaccine Percent", "type": "state" },
    // Coordinate data
    { "id": "oil_barrels_spilled", "label": "Oil Barrels Spilled", "desc": "Oil barrels spilled", "type": "coordinate" },
];

const METRIC_LABELS =
    Object.fromEntries(new Map(METRICS.map(m => [m.id, m.label])));


/**
 * @param {string} metric 
 * @returns a formatted version of the metric name
 */
function getMetricLabel(metric) {
    return METRIC_LABELS[metric];
}

const METRIC_DESCRIPTIONS =
    Object.fromEntries(new Map(METRICS.map(m => [m.id, m.desc])));

/**
 * @param {string} metric 
 * @returns a formatted description of the metric
 */
function getMetricDescription(metric) {
    return METRIC_DESCRIPTIONS[metric];
}

const METRIC_TYPES =
    Object.fromEntries(new Map(METRICS.map(m => [m.id, m.type])));

/**
* @param {string} metric 
* @returns a string representing the metric type (county or state)
*/
function getMetricType(metric) {
    return METRIC_TYPES[metric];
}