---
layout: post
title: Findings on Table Extensibility in Atlassian Confluence for Connect Apps
date: 2023-03-09 10:10:00.000000000 +00:00
type: post
published: true
status: publish
categories: []
tags:
- atlassian
- confluence
- atlassian-connect
- note to self
- app week
- app week 2023
author: David Simpson

---

I recently went to Atlassian's App Week in Berlin. Here's some findings on Table Extensibility in Confluence.

## Table Extensibility – What is it?

- [Sneak Peak at Referentiality within Confluence](https://community.developer.atlassian.com/t/sneak-peak-at-referentiality-within-confluence/52829) – available and natively working now in Confluence Cloud

Soon available for:

- ✅ Atlassian Connect dynamic content macros
- ❌ Forge – no, not yet

## How to emit data from your macro

Update your macro definition in atlassian-connect.json with refDataSchema like so:

```
"refDataSchema": {
  "outputType": "table-adf"
},
```

Whenever you need to update the emitted data, do this:

```
AP.dataProvider.emitToDataProvider({
  eventData: {
    "table-adf": tableAdf,
  },
});
```

Where `tableAdf` is a table in ADF (JSON) format. 

## 🚀 Demo

<iframe width="560" height="315" src="https://www.youtube.com/embed/TXeJF_6s0A0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 🤷 Gotchas

- Use table-adf rather than table-json 
  - [Developer Preview of Referentiality within Confluence Released!](https://community.developer.atlassian.com/t/developer-preview-of-referentiality-within-confluence-released/54329) suggests you can use either
- Sometimes, but rarely (e.g. after a hard reload) `AP.dataProvider` doesn’t get loaded before your Connect macro, so test it’s there before emitting the event data.
  ```
  AP.dataProvider && AP.dataProvider.emitToDataProvider(...);
  ```
- The data provider was not accepted. My macro was not emitting any data: 
  <img src="/wp-content/uploads/2023/table-extensibility.png" />

  Fix:
  
  - Update the the refDataSchema in the macro descriptor to:
    ```
    "refDataSchema": {
      "inputType": "table-adf",
      "outputType": "table-adf"
    }, 
   ```
   
   I really don’t get why this may be required, likely a bug – it also adds clutter to the macro menus 😞
- Ensure that any empty table cells have something like a `&nbsp;` in them, otherwise `AP.dataProvider.emitToDataProvider` will silently crap out.

## With thanks to…

- GT Deng (Atlassian)