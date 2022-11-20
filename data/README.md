# Data

## Raw

This folder contains raw datasets that are downloaded from a variety of sources. The notebooks that clean these files can be found in `notebooks/cleaning`. The [README.md](raw/README.md) in that directory details the sources of all the datasets.

## Processed

This contains slightly processed versions of each of the raw datasets. Most of these will be keyed by `county_fips`. Generally each data source will be consolidated into a single, processed dataset.

## Final

These are the final data files that will be fed into the web application that is part of this project.