---
title: "2025 German Bundestag Elections"
datePublished: Sun Mar 30 2025 00:08:26 GMT+0000 (Coordinated Universal Time)
cuid: cm8uvtnvj000009jr4bv20w9w
slug: 2025-german-bundestag-elections
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1743293241783/45af6479-8de6-43d0-8b32-e000eacdcd3c.webp
tags: germany, elections

---

*Before I start, I want to give immense thanks to* [*Samuel Scheit*](https://samuelscheit.com/)*. You can see how he managed to collect the results, with the help of* [*Paul Menzel*](https://github.com/paulmenzel)*,* [*on Sam’s blog here.*](https://samuelscheit.com/blog/2025/bundestagswahl) *The repo is* [*here*](https://github.com/SamuelScheit/bundestagswahl2025)*. Beyond this, my main contribution was just to create a geocoding server using* [*Pelias*](https://pelias.io/) *and geocode the stations and map the data below.*

Just over a month ago, the people of Germany decided who they wanted to lead them. Some friends on Github were curious if the results were available by the electoral district (the most granular of results), and this led us down a long and winding rabbit hole.

The answer is you can - mostly, with the exception of Saxony. The difficulty is municipalities and communes publish their results in different ways, much like different councils in the UK publish their election results. This proves very difficult for accessing on scale.

However, after much effort, we came around to this map!

You can see that the the AfD, the far right party, does best in East Germany. Whereas the more mainstream conservative CDU does better in West Germany. Aside from that, there are lots of interesting underlying trends you can explore at a very in-depth level.

<iframe src="https://jacobweinbren.github.io/German-Elections-2025-Map/" width="100%" height="600" style="border:none">
</iframe>

Furthermore, I decided to do some analysis by socioeconomic deprivation by the [postal-5 areas](https://www.suche-postleitzahl.org/downloads) - with much credit to the scientists behind it - including [Niels Michalski](https://zenodo.org/records/6840304). You can see the AfD does best in deprived areas, the CDU meanwhile does best in less deprived areas.

<iframe id="datawrapper-chart-Ig1dU" src="https://datawrapper.dwcdn.net/Ig1dU/" style="width:0;min-width:100%;border:none" height="498"></iframe>

And as well as that, I made a correlation heatmap between the parties in the polling stations. You can see that BSW, a socially conservative left party, correlates well with the AfD.

<iframe id="datawrapper-chart-4Yiv2" src="https://datawrapper.dwcdn.net/4Yiv2/" style="width:0;min-width:100%;border:none" height="412"></iframe>

I am back to exams and coursework - so I can’t provide much further commentary, but I hope this is of as much interest to you as is it is to me!