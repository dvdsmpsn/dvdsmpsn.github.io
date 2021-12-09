---
layout: post
title: How to convert an SVG image to PNG on a MacOS using QuickLook
date: 2021-12-09 10:10:00.000000000 +00:00
type: post
published: true
status: publish
categories: []
tags:
- apple
- macos
- svg
- png
- terminal
- note to self
author: David Simpson

---


I needed a high quality PNG version of an SVG logo for a ScreenFlow movie because ScreenFlow doesn't support SVG graphics.

We can use the built in functionality of MacOS to achieve this – [QuickLook](https://developer.apple.com/design/human-interface-guidelines/macos/system-capabilities/quick-look/).


## Procedure

My SVG looks something like this (detail omitted):

```
<?xml version="1.0" encoding="UTF-8"?>
<svg width="192px" height="192px" viewBox="0 0 192 192" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    ...
</svg>
```

### Copy & edit the SVG

Make a copy of the SVG and edit the width & height attributes to be the correct size (otherwise scaling up with just give the image at it's current size and a white background).

I'm aiming for an 8000px square image, so change `width="192px" height="192px"` to `width="8000px" height="8000px"`, like so:

```
<?xml version="1.0" encoding="UTF-8"?>
<svg width="8000px" height="8000px" viewBox="0 0 192 192" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    ...
</svg>
```

Note: When scaling down, you can skip this as QuickLook wi

### In terminal

Open a terminal & type:

```
qlmanage -t -s 8000 -o . logo.svg 
``` 

Let's break that down:

```
qlmanage   \
  -t       \ # displays the Quick Look generated thumbnails (if available) for the specified files.
  -s 8000  \ # the width in pixels
  -o .     \ # output in the same directory
  logo.svg \ # the input file 
  
```

This will produce an 8000 pixel wide `logo.svg.png`.

This massive image can now be used in my movie without any scaling issues.
