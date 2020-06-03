---
layout: post
title: Natively displaying PDFs in iframes with HTML5 sandbox 
date: 2016-11-28 23:10:00.000000000 +00:00
type: post
published: false
status: publish
categories: []
tags:
- html5
- sandbox
- PDF
- note to self
author: David Simpson

---

Gone are the days when you needed Adobe Acrobat Reader plugin to view a PDF file on the web. This can only be a good thing. Happily, we are now at the stage where all browsers can natively display PDF files by themselves without external plugins. This is good news, but have you tried displaying PDF files in iframes with the HTML5 sandbox attribute? With different browsers, result will vary from all good to nothing whatsoever.

https://twitter.com/dvdsmpsn/status/730695578489851904

/Users/david/Dropbox/Public/html5-pdf-iframe/pdf-iframe.html

Firefox generally works with anythingn more that "allow-same-origin allow-scripts" in the sandbox attribute.
Safari and Chrome do not work. Period.

Chromium bug tracker

- [Issue 263567 - Sandbox attribute on an iframe blocks PDF documents from being rendered](https://bugs.chromium.org/p/chromium/issues/detail?id=263567)
- [Issue 406395 - [Chrome PDF Plugin] It is not possible to embed PDFs in web pages any more.](https://bugs.chromium.org/p/chromium/issues/detail?id=406395)
- [Issue 413851 - Sandbox breaks PDF rendering](https://bugs.chromium.org/p/chromium/issues/detail?id=413851)


WebKit bug tracker

- [Bug 118859 - Sandbox attribute on an iframe blocks PDF documents from being rendered](https://bugs.webkit.org/show_bug.cgi?id=118859)


Why is that? 

The problem is that in both Chrome and Safari, the native PDF viewer is actually a browser plugin which is shipped with the browser. This browser plugin being blocked by the sandboxing. Firefox handles security in a different manner to Chrome and Safari, so has no such problem displaying PDF files in snadboxed iframes.

How can I get around it?

If you really need to display PDF files in sandboxed iframes, it is possible, you just need a fresh approach. If your sandbox has the "allow-same-origin allow-scripts" features enabled, you are in luck.  Instead of displaying the PDF directly, instead you can use ViewerJS and PDF.js to render the PDF with client side JavaScript.

Why does this work?

With a browser native PDF viewer, the sandbox blocks the browser add-on which is uesed to display the PDF.  By using client side JavaScript only, the limitation is lifted


/Users/david/Dropbox/Public/html5-pdf-iframe/pdf-iframe-with-viewer.html
