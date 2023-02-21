/**
 * This file is responsible for providing data for rendering the plots.
 */

const countyOutlines = d3.json("data/us-counties.json");
const stateOutlines = d3.json("data/us-states.json");

// Generate a mapping from fips to display name for labeling purposes.
const fipsToLabel = Promise.all([countyOutlines, stateOutlines]).then(
  (outlines) =>
    Object.fromEntries(
      new Map(
        outlines
          .map((o) => o["features"])
          .flat()
          .map((f) => [Number(f["id"]), f["properties"]["display_name"]])
      )
    )
);

/**
 * @returns geojson format for county outlines.
 */
function getCountyOutlines() {
  return countyOutlines;
}

/**
 * @returns geojson format for state outlines.
 */
function getStateOutlines() {
  return stateOutlines;
}

/** Helper to create a promise to request a dataset. */
function createDataPromise(url) {
  return new Promise((resolve, reject) => {
    d3.csv(url).then((data) => {
      if (data) {
        // Parse all values as floats
        data = data.map((d) => {
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
    dataPromises["county"] = createDataPromise("data/county_data.csv");
  }
  return dataPromises["county"];
}

function getStateData() {
  if (!dataPromises["state"]) {
    dataPromises["state"] = createDataPromise("data/state_data.csv");
  }
  return dataPromises["state"];
}

const COORDINATE_FILES = {
  oil_barrels_spilled: "oil_accidents.csv",
};

function getCoordinateData(metric) {
  if (!dataPromises[metric]) {
    dataPromises[metric] = createDataPromise(
      "data/" + COORDINATE_FILES[metric]
    );
  }
  return dataPromises[metric];
}

/**
 * @param {string} metric metric ID to fetch data for
 * @returns a promise that resolves to an array of the requested data
 */
function getData(metric) {
  const type = getMetricType(metric);
  if (type === "county" || metric === "population") {
    return getCountyData().then((data) =>
      data.map((d) => {
        return { fips: d["fips"], [metric]: d[metric] };
      })
    );
  } else if (type === "state" || metric === "state_population") {
    return getStateData().then((data) =>
      data.map((d) => {
        return { fips: d["fips"], [metric]: d[metric] };
      })
    );
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
  return getData(metric).then((data) =>
    data
      .filter((d) => d[metric] !== undefined)
      .reduce((acc, val) => {
        const fips = parseInt(val["fips"]);
        if (!acc[fips]) {
          acc[fips] = 0;
        }
        acc[fips] += val[metric];
        return acc;
      }, {})
  );
}

const METRICS = [
  // County level
  {
    id: "cancer_incidence_rate_per_100000",
    label: "Cancer Incidence Rate",
    desc: "The age-adjusted number of cancer cases per 100,000 residents. This data comes from NCI.",
    legend: "Age-adjusted number of cases per 100,000 residents",
    type: "county",
  },
  {
    id: "cancer_mortality_rate_per_100000",
    label: "Cancer Mortality Rate",
    desc: "The age-adjusted number of cancer deaths per 100,000 residents. This data comes from NCI.",
    legend: "Age-adjusted number of deaths per 100,000 residents",
    type: "county",
  },
  {
    id: "breast_cancer_incidence_rate_per_100000",
    label: "Breast Cancer Incidence Rate",
    desc: "The age-adjusted number of breast cancer incidences per 100,000 residents. This data comes from NCI.",
    legend: "Age-adjusted number of breast cancer cases per 100,000 residents",
    type: "county",
  },
  {
    id: "breast_cancer_mortality_rate_per_100000",
    label: "Breast Cancer Mortality Rate",
    desc: "The age-adjusted number of breast cancer deaths per 100,000 residents. This data comes from NCI.",
    legend: "Age-adjusted number of breast cancer deaths per 100,000 residents",
    type: "county",
  },
  {
    id: "colorectal_cancer_incidence_rate_per_100000",
    label: "Colorectal Cancer Incidence Rate",
    desc: "The age-adjusted number of colorectal cancer cases per 100,000 residents. This data comes from NCI.",
    legend:
      "Age-adjusted number of colorectal cancer cases per 100,000 residents",
    type: "county",
  },
  {
    id: "colorectal_cancer_mortality_rate_per_100000",
    label: "Colorectal Cancer Mortality Rate",
    desc: "The age-adjusted number of colorectal cancer deaths per 100,000 residents. This data comes from NCI.",
    legend:
      "Age-adjusted number of colorectal cancer deaths per 100,000 residents",
    type: "county",
  },
  {
    id: "leukemia_cancer_incidence_rate_per_100000",
    label: "Leukemia Incidence Rate",
    desc: "The age-adjusted number of leukemia cases per 100,000 residents. This data comes from NCI.",
    legend: "Age-adjusted number of leukemia cases per 100,000 residents",
    type: "county",
  },
  {
    id: "leukemia_cancer_mortality_rate_per_100000",
    label: "Leukemia Mortality Rate",
    desc: "The age-adjusted number of leukemia deaths per 100,000 residents. This data comes from NCI.",
    legend: "Age-adjusted number of leukemia deaths per 100,000 residents",
    type: "county",
  },
  {
    id: "lung_cancer_incidence_rate_per_100000",
    label: "Lung Cancer Incidence Rate",
    desc: "The age-adjusted number of lung cancer cases per 100,000 residents. This data comes from NCI.",
    legend: "Age-adjusted number of lung cancer cases per 100,000 residents",
    type: "county",
  },
  {
    id: "lung_cancer_mortality_rate_per_100000",
    label: "Lung Cancer Mortality Rate",
    desc: "The age-adjusted number of lung cancer deaths per 100,000 residents. This data comes from NCI.",
    legend: "Age-adjusted number of lung cancer deaths per 100,000 residents",
    type: "county",
  },
  {
    id: "non_hodgkin_lymphoma_cancer_incidence_rate_per_100000",
    label: "Non-Hodgkin Lymphoma Incidence Rate",
    desc: "The age-adjusted number of non-Hodgkin lymphoma cases per 100,000 residents. This data comes from NCI.",
    legend:
      "Age-adjusted number of non-Hodgkin lymphoma cases per 100,000 residents",
    type: "county",
  },
  {
    id: "non_hodgkin_lymphoma_cancer_mortality_rate_per_100000",
    label: "Non-Hodgkin Lymphoma Mortality Rate",
    desc: "The age-adjusted number of non-Hodgkin lymphoma deaths per 100,000 residents. This data comes from NCI.",
    legend:
      "Age-adjusted number of non-Hodgkin lymphoma deaths per 100,000 residents",
    type: "county",
  },
  {
    id: "prostate_cancer_incidence_rate_per_100000",
    label: "Prostate Cancer Incidence Rate",
    desc: "The age-adjusted number of prostate cancer cases per 100,000 residents. This data comes from NCI.",
    legend:
      "Age-adjusted number of prostate cancer cases per 100,000 residents",
    type: "county",
  },
  {
    id: "prostate_cancer_mortality_rate_per_100000",
    label: "Prostate Cancer Mortality Rate",
    desc: "The age-adjusted number of prostate cancer deaths per 100,000 residents. This data comes from NCI.",
    legend:
      "Age-adjusted number of prostate cancer deaths per 100,000 residents",
    type: "county",
  },
  {
    id: "median_household_income",
    label: "Median Household Income",
    desc: "The median household income, in dollars, for the county. This data comes from NCI.",
    legend: "Median household income, in dollars",
    type: "county",
  },
  {
    id: "over_65_percent",
    label: "65 and Older Percent",
    desc: "Percent of the total population that is 65 or older. This data comes from the Social Vulnerability Index.",
    legend: "Percent of residents who are 65 years or older",
    type: "county",
  },
  {
    id: "uv_exposure",
    label: "UV Exposure",
    desc: "Ultraviolet exposure in watt-hours per square meter. This data comes from NCI.",
    legend: "UV exposure in watt-hours per square meter",
    type: "county",
  },
  {
    id: "low_income_low_access_share",
    label: "Low Income and Low Access to Food",
    desc: "The percent of residents who are low income and have low access to food. This data comes from USDA.",
    legend: "Percent of residents with low income and low food access",
    type: "county",
  },
  {
    id: "non_english_speaking",
    label: "Non-English-Speaking Percent",
    desc: "The percent of residents who are non-English-speaking. This data comes from the US Census.",
    legend: "Percent of residents who are non-English-speaking",
    type: "county",
  },
  {
    id: "population_in_poverty_percent",
    label: "Below Poverty Percent",
    desc: "The percent of residents who live below the poverty level. This data comes from the Social Vulnerability Index.",
    legend: "Percent of residents who live below the poverty level",
    type: "county",
  },
  {
    id: "population_over_25_no_high_school_diploma_percent",
    label: "Percent Without High School Diploma",
    desc: "The percent of residents over 25 without a high school diploma. This data comes from the Social Vulnerability Index.",
    legend: "Percent of residents without high school diploma",
    type: "county",
  },
  {
    id: "population_uninsured_percent",
    label: "Uninsured Percent",
    desc: "The percent of residents without insurance. This data comes from the Social Vulnerability Index.",
    legend: "TPercent of residents without insurance",
    type: "county",
  },
  {
    id: "population_minority_percent",
    label: "Minority Population Percent",
    desc: "The percent of residents belonging to a racial or ethnic minority. This data comes from the Social Vulnerability Index.",
    legend: "Percent of residents who are part of minority groups",
    type: "county",
  },
  {
    id: "walkability_index",
    label: "Walkability Index",
    desc: "A measure of how walkable an area is. Scores range from 1 to 20. This data comes from the EPA.",
    legend: "Index of county walkability",
    type: "county",
  },
  {
    id: "hospital_beds_per_100000",
    label: "Hospital Beds",
    desc: "The number of hospital beds per 100,000 residents. This data comes from Oak Ridge National Laboratory.",
    legend: "Hospital beds per 100,000 residents",
    type: "county",
  },
  {
    id: "median_aqi",
    label: "Median AQI",
    desc: "The median air quality in a county over the duration of a year. This data comes from the EPA.",
    legend: "Median annual AQI",
    type: "county",
  },
  // State level
  {
    id: "cervical_cancer_incidence_rate_per_100000",
    label: "Cervical Cancer Incidence Rate",
    desc: "The age-adjusted number of cervical cancer incidences per 100,000 residents. This data comes from NCI.",
    legend:
      "Age-adjusted number of cervical cancer cases per 100,000 residents",
    type: "state",
  },
  {
    id: "cervical_cancer_mortality_rate_per_100000",
    label: "Cervical Cancer Mortality Rate",
    desc: "The age-adjusted number of cervical cancer deaths per 100,000 residents. This data comes from NCI.",
    legend:
      "Age-adjusted number of cervical cancer deaths per 100,000 residents",
    type: "state",
  },
  {
    id: "hodgkins_lymphoma_cancer_incidence_rate_per_100000",
    label: "Hodgkin's Lymphoma Incidence Rate",
    desc: "The age-adjusted number of Hodgkin's lymphoma incidences per 100,000 residents. This data comes from NAACCR.",
    legend:
      "Age-adjusted number of Hodgkin's lymphoma cases per 100,000 residents",
    type: "state",
  },
  {
    id: "hodgkins_lymphoma_cancer_mortality_rate_per_100000",
    label: "Hodgkin's Lymphoma Mortality Rate",
    desc: "The age-adjusted number of Hodgkin's lymphoma deaths per 100,000 residents. This data comes from NCI.",
    legend:
      "Age-adjusted number of Hodgkin's lymphoma deaths per 100,000 residents",
    type: "state",
  },
  {
    id: "melanoma_cancer_incidence_rate_per_100000",
    label: "Melanoma Incidence Rate",
    desc: "The age-adjusted number of melanoma incidences per 100,000 residents. This data comes from NCI.",
    legend: "Age-adjusted number of melanoma cases per 100,000 residents",
    type: "state",
  },
  {
    id: "melanoma_cancer_mortality_rate_per_100000",
    label: "Melanoma Mortality Rate",
    desc: "The age-adjusted number of melanoma deaths per 100,000 residents. This data comes from NCI.",
    legend: "Age-adjusted number of melanoma deaths per 100,000 residents",
    type: "state",
  },
  {
    id: "colorectal_screening_percent",
    label: "Colon Cancer Screening Percent",
    desc: "The percent of residents (50 years and older) who have recently been screened for colon cancer. his data comes from NCI.",
    legend: "Percent of residents screened for colon cancer",
    type: "state",
  },
  {
    id: "smoking_percent",
    label: "Smoking Percent",
    desc: "The percent of residents (18 years and older) who have ever smoked 100 ciagrettes. This data comes from NCI.",
    legend: "Percent of residents who have smoked",
    type: "state",
  },
  {
    id: "hpv_vaccine_percent",
    label: "HPV Vaccine Percent",
    desc: "The percent of residents (ages 13-17) who have recieved 3 doses of the HPV vaccine. This data comes from NCI.",
    legend: "Percent of residents who received HPV vaccine",
    type: "state",
  },
  // Coordinate data
  {
    id: "oil_barrels_spilled",
    label: "Oil Barrels Spilled",
    desc: "Locations of recent oil spills and the number of barrels spilled during each incident. This data comes from the US DOT.",
    legend: "Number of oil barrels spilled",
    type: "coordinate",
  },
];

const METRIC_LABELS = Object.fromEntries(
  new Map(METRICS.map((m) => [m.id, m.label]))
);

/**
 * @param {string} metric
 * @returns a formatted version of the metric name
 */
function getMetricLabel(metric) {
  return METRIC_LABELS[metric];
}

const METRIC_DESCRIPTIONS = Object.fromEntries(
  new Map(METRICS.map((m) => [m.id, m.desc]))
);

/**
 * @param {string} metric
 * @returns a formatted description of the metric
 */
function getMetricDescription(metric) {
  return METRIC_DESCRIPTIONS[metric];
}

const METRIC_LEGENDS = Object.fromEntries(
  new Map(METRICS.map((m) => [m.id, m.legend]))
);

/**
 * @param {string} metric
 * @returns a formatted description for the metric's legend
 */
function getMetricLegend(metric) {
  return METRIC_LEGENDS[metric];
}

const METRIC_TYPES = Object.fromEntries(
  new Map(METRICS.map((m) => [m.id, m.type]))
);

/**
 * @param {string} metric
 * @returns a string representing the metric type (county or state)
 */
function getMetricType(metric) {
  return METRIC_TYPES[metric];
}

/**
 * @param {number} fips
 * @returns a promise that resolves to the name of a state (i.e. Washington) or
 * county (i.e. King County, WA).
 */
function getNameForFips(fips) {
  return fipsToLabel.then((fipsMap) => {
    return fipsMap[fips];
  });
}
