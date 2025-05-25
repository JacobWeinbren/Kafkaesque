---
title: "Israeli Socio-Economic Classification"
datePublished: Fri Mar 01 2024 20:23:20 GMT+0000 (Coordinated Universal Time)
cuid: cm6v06iik00020al8byoc5foi
slug: israeli-socio-economic-classification
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1738949898450/c0a5e4b8-ba56-4271-8cfc-b4a2f8f6b969.png
tags: map, israel, deprivation

---

A new day, a new map!

This deprivation map is based on Israel Bureau of Statistic's [socio-economic classification of statistical areas](https://www.cbs.gov.il/en/publications/Pages/2023/socio-2019-e.aspx). The source data has been combined, overlayed with the statistical areas of Israel (2011), intersected with Open Street Map Building data, compressed, vectorised, and uploaded to a tile server. There it is served via the GPU on the browser.

Some interesting findings - Jerusalem's East / West divide is evident, as well as the broad affluence of North Tel Aviv (presumably, this is why the peripherality index is based on the distance to this location).

<iframe src="https://israeli-deprivation-index.pages.dev/" style="width:100%" height="800"></iframe>

You can find the full map [here](https://israeli-deprivation-index.pages.dev/).

The source code is on [GitHub](https://github.com/JacobWeinbren/Israeli-Deprivation-Index).