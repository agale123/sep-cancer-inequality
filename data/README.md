# Data Pipeline
The Data Pipeline encapsulates all the processing necessary to take data from its original raw file to a final, merged table of all the metrics in a format that can be used by the Data Explorer.

## Raw

This folder contains raw datasets that are downloaded from a variety of sources. The notebooks that clean these files can be found in `notebooks/cleaning`. The [README.md](raw/README.md) in that directory details the sources of all the datasets.

## Processed

This contains slightly processed versions of each of the raw datasets. Most of these will be keyed by `county_fips`. Generally each data source will be consolidated into a single, processed dataset.

## Final

These are the final data files that will be fed into the web application that is part of this project.

## How to Add a New Data Source

Follow these steps to add a new dataset to the Data Explorer. 

- Add the raw data source to `data/raw`. For instance, `data/raw/new_metric_raw.csv`
- Describe the data source, relevant details and schema of the raw file in the [README.md](raw/README.md) located in the `raw` directory.
- Add a new python notebook to `notebooks/cleaning`, for instance `notebooks/cleaning/new_metric.ipynb`. In this notebook, clean up the raw data and output the result to `data/processed`. The output should be formatted as csv, and it must include a column called 'fips' and one or more columns for corresponding metrics. For instance, `[fips new_metric_01]`.
- Update `notebooks/cleaning/merge.ipynb` to include the new processed data source in the final output.
```diff python
files = [
    "food_access.csv",
    "language_barriers.csv",
    "social_vulnerability_index.csv",
    "walkability.csv",
    "hospital_beds_total.csv",
    "air_quality.csv",
    "pesticides_total_mass.csv",
+   "new_metric.csv"
]
```
- Still in `notebooks/cleaning/merge.ipynb`, add the new metric to the list of columns that should be part of the final dataset.
```diff python
df = df[
    [
        "fips",
        ...
        "median_aqi",
        "pesticide_mass",
+       "new_metric_01",
        "population"
    ]
]
```
- Run `notebooks/cleaning/merge.ipynb` and verify that the new metrics have been added to the table in `data/final/county_data.csv`.
- In `docs/scripts/data-service.js`, add the new metric with a corresponding label and legend description. The type should indicate whether the metric is available per county or per state.
```diff javascript
const METRICS = [
  ...
+  {
+    id: "new_metric_01",
+    label: "Metric Name",
+    desc: "This metric indicates ...",
+    legend: "Number of xyz per 100,000 residents",
+    type: "county",
+  },
  ...
```
- Verify the new `Metric Name` is available to be selected on the map and the data loads correctly.
