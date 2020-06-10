---
layout: post
title: How to disable lazy loading of charts in Grafana
date: 2020-06-10 10:10:00.000000000 +00:00
type: post
published: true
status: publish
categories: []
tags:
- grafana
- charts
- lazy loading
- javascript
author: David Simpson

---

Lazy loading charts in Grafana 6.2+ is very cool - only rendering items as required is a saving which in most cases is helpful. 

But sometimes it isn't. If you have Grafana loading in an iframe, and set the iframe to resize to the height of its content, then lazy loading is a hinderance - it prevents load of the panels that were initially hidden "below the fold" of the iframe.

But, how do you disable lazy loading in Grafana?

The simple answer is that you do not. There is no feature flag allowing you to turn this off and on, so stop and go home at this point.

If however, you can build Grafana from source before you deploy it, then there is a very simple way to achieve this.

In my situation, I am displaying Grafana within an iframe, so can add a new request parameter `disableLazyLoad=true` to the URL to change the behaviour.

After that, it is a simple matter of screwing with the source code.

## Source code changings

In `/public/app/features/dashboard/dashgrid/DashboardGrid.tsx` you'll see the following lines:

```
isInView = (panel: PanelModel): boolean => {
  if (panel.fullscreen || panel.isEditing) {
    return true;
  }
  ... 
```

This can be adapted to:

```
isInView = (panel: PanelModel): boolean => {
  const urlParams = new URLSearchParams(window.location.href);
  const disableLazyLoad = urlParams.has('disableLazyLoad') && urlParams.get('disableLazyLoad') === 'true';
 
  if (panel.fullscreen || panel.isEditing || disableLazyLoad) {
    return true;
  }
  ...
```

After that, build Grafana, and you have a simple mechanism with which to disable the lazy loading of Panels in Grafana.

It's simple, but means that pages with the request parameter `disableLazyLoad=true` appended to the URL will always be "tricked" into believing that they are in view, so the lazy loading logic will display all charts from the get go.
