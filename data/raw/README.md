# Raw data sources

## National Cancer Institute

**Source**: https://gis.cancer.gov/canceratlas/

This data is freely available for research purposes. Most of the datasets cover the time range from 2014 to 2018, and the data is broken down by county.

* `Demographics_US_by_County_Income_Median_Household_Income_(Both_Sexes_-_2014_to_2018)_2014_-_2018.csv`
* `Demographics_US_by_County_Non-English_Language_Language_Isolation_(Both_Sexes_-_2014_to_2018)_2014_-_2018.csv`
* `Demographics_US_by_County_Population_Age_65_and_Over_(Both_Sexes_-_2014_to_2018)_2014_-_2018.csv`
* `Demographics_US_by_County_Population_Asian_Pacific_Islander_(Both_Sexes_-_2014_to_2018)_2014_-_2018.csv`
* `Demographics_US_by_County_Population_Black_(Both_Sexes_-_2014_to_2018)_2014_-_2018.csv`
* `Demographics_US_by_County_Population_Hispanic_(Both_Sexes_-_2014_to_2018)_2014_-_2018.csv`
* `Demographics_US_by_County_Population_White_(Both_Sexes_-_2014_to_2018)_2014_-_2018.csv`
* `Demographics_US_by_County_Poverty_Families_Below_Poverty_(Both_Sexes_-_2014_to_2018)_2014_-_2018.csv`
* `Demographics_US_by_County_Uninsured_Ages__65_at_or_below_138%_of_Poverty_(Both_Sexes_-_2018)_2014_-_2018.csv`
* `Incidence_US_by_County_All_Races_All_Cancer_Sites_(Both_Sexes)_2013_-_2017.csv`
* `Mortality_US_by_County_All_Races_All_Malignant_Cancers_(Both_Sexes)_2014_-_2018.csv`
* `Screening_and_Risk_Factors_US_by_County_(UV_Only)_UV_Exposure_Data_Ultraviolet_Exposure.csv`

## Redlining

**Source**: https://dsl.richmond.edu/panorama/redlining/#loc=11/47.594/-122.524&city=seattle-wa&area=C13&text=downloads

This data is made available through a Creative Commons license from the "Mapping Inequaliy: Redlining in New Deal America" project. This data is generated from scans of HOLC maps. Each polygon has an associated grade from A to D with A being the highest and D being the lowest.

* `fullDownload.geojson`

## Social Vulnerability Index

**Source**: https://www.atsdr.cdc.gov/placeandhealth/svi/index.html

The SVI data contains metrics related to population vulnerability per county, such as socioeconomic status, household characteristics, racial and ethnic minority status, and housing type and transportation. Data from the Center for Disease Control and Prevention, Agency for Toxic Substances and Disease Registry (CDC/ATSDR) for 2020. Snapshots taken on November 20, 2022.

* `Social_Vulnerability_Index_2020_US_COUNTY.csv`

## Access to Healthy Food

**Source**: https://www.ers.usda.gov/data-products/food-access-research-atlas/download-the-data/

This data is made freely available by the US Government. The data is from 2019 and is broken down by census tract to show the share of low income, low access residents. To find the proportion of low income, low access residents in each county, we divide the "Low access, low-income population at 1 mile for urban areas and 10 miles for rural areas, number" by the "Population count from 2010 census".

* `FoodAccessResearchAtlasData2019.csv`

## Insurance Rates

TODO(Danilo)

## Language Barriers

**Source**: https://data.census.gov/table?q=DP02&g=0100000US$0500000&tid=ACSDP5Y2020.DP02

This data is made freely available by the US Government. The data is from the 2020 5-year data profile. From this dataset we are gathering the percent of people over 5 years old who speak a language other than English at home and speak English less than "very well".

* `ACSDP5Y2020.DP02-Data.csv`

## Pesticide Exposure

TODO(Danilo)

## Walkability & Access to Parks

**Source**: https://edg.epa.gov/metadata/catalog/search/resource/details.page?uuid=%7B251AFDD9-23A7-4068-9B27-A3048A7E6012%7D

This data is made available by the EPA. The data is from 2019. The National Walkability Index is a score that takes into account intersection density, proximity to transit, and the employment and household mix. Low scores indicate the least walkable areas while high scores indicate the most walkable areas. To fit within the GitHub limits, this file was pre-processed to remove unnecessary columns.

* `EPA_SmartLocationDatabase_V3_Jan_2021_Final.csv`

## Targeted Advertising for Tobacco

TODO(Danilo)

## Replacement for refineries dataset

TODO(Alison)

## Replacement for hospital locations dataset

TODO(Danilo)