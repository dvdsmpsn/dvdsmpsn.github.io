---
layout: page
title: PII Viewer for Google Analytics
date: 2014-04-08 12:00:43.000000000 +01:00
type: page
published: true
status: publish
categories: []
tags: []
meta:
  _edit_last: "1"
  _yoast_wpseo_focuskw: personally identifiable information
  _yoast_wpseo_linkdex: "61"
  _wp_page_template: default
  _thumbnail_id: "2973"
author: David Simpson
excerpt_separator: <!--more-->
---

<img src="{{ site.baseurl }}/assets/icon1281.png" width="64" height="64" class="alignleft size-full wp-image-2653" style="float:left; margin: 0 1em 1em 0;" />

**<abbr title="personally identifiable information">PII</abbr> Viewer for Google Analytics is a browser extension for Chromium-based browsers such as Microsoft Edge and Google Chrome. It allows you to map the user ID stored in Google Analytics to locally stored personally identifiable information (PII) such as name and email address.**

[ ![Mailchimp in GA - with PII](/wp-content/uploads/2014/04/Mailchimp-in-GA-with-PII.png) ](/wp-content/uploads/2014/04/Mailchimp-in-GA-with-PII.png)

<p style="text-align: center;"><a target="_blank" title="Add to Google Chrome" href="https://chrome.google.com/webstore/detail/pii-viewer-for-google-ana/kocaompbindpaanpabjeeechkofidmbh"><img src="{{ site.baseurl }}/wp-content/uploads/2014/04/add-to-chrome.png" alt="" /></a></p>

## How it works

Sending personally identifiable information (PII) to Google Analytics is strictly prohibited, but sending a unique user ID <em>is</em> in a custom dimension is permitted. This extension allows you to map the user ID stored in Google Analytics to locally stored PII such as name and email address.

Rather than building your own custom integration to map this data together, you can simply reference a locally stored CSV file (or use the in-built Mailchimp integration) and let this extension do the hard work. This means that you full comply with the Google Analytics privacy policy, but get to understand your visitor data.

**Update**

PII Viewer for Google Analytics now supports identifying users in [Behaviour Flow](https://support.google.com/analytics/answer/2785577?hl=en) and [Mailchimp integration](http://mailchimp.com/).

<a href="/wp-content/uploads/2014/04/behavior-flow.png"><img src="{{ site.baseurl }}/assets/behavior-flow.png" alt="behavior-flow"  /></a>

## Tutorials

- [How to send user IDs to Google Analytics (including with custom dimensions)](/2014/04/20/tutorial-send-user-ids-google-analytics/)
- [Using the PII Viewer for Google Analytics browser extension](/2014/04/22/tutorial-using-pii-viewer-google-analytics-chrome-extension/)
- [Displaying Mailchimp subscribers in Google Analytics using PII Viewer](/2014/09/24/displaying-mailchimp-subscribers-google-analytics/)

## Releases

- [Release Notes](/pii-viewer-for-google-analytics/pii-viewer-for-google-analytics-releases-notes)

## Compliance with Google Analytics Terms of Service

This extension uses PII which is locally stored only, therefore this extension is fully compliant with the Google Analytics Terms of Service.

Contacts at Google have confirmed that the extension is compliant with the terms of service.


<h2 id="data-security">Data security and privacy statement</h2>

**We do not read your data.**

Our extensions are served by static files, and as such, store no data. All markup is rendered client-side, so no data is transmitted to our servers.

Any configuration data saved is saved within your browser on your own computer and only accessed by client-side JavaScript.


### Privacy
**We do not read your data.**

We do however reserve the right to track usage with web analytics software such as Google Analytics.


#### Google Analytics
Our extensions use Google Analytics. Items currently being tracked by Google Analytics:

- Options page loadServer Base URL
-- *e.g. /options.html*
- Some events such as button clicks on the options page
-- Attempts to upload a file into your browser 
-- Whether the upload was successful or not
-- A count of how many users were in the file, but not their details
-- When the user mapping is updated




<h2 id="donate">Did you find this useful?</h2>

If you found this browser extension useful, why not say thanks by buying me a pot of tea to contribute to its maintenance. I don't do coffee.

<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top"><input type="hidden" name="cmd" value="_s-xclick" /><input type="hidden" name="hosted_button_id" value="47SSZXRKTN6FJ" /><input type="image" src="https://www.paypalobjects.com/en_GB/i/btn/btn_donate_SM.gif" border="0" name="submit" alt="PayPal – The safer, easier way to pay online." /><img alt="" border="0" src="{{ site.baseurl }}/assets/pixel.gif" width="1" height="1" /></form>
