---
layout: post
title: How to get the license status of an Atlassian Connect app 
date: 2023-09-27 10:10:00.000000000 +00:00
type: post
published: true
status: publish
categories: []
tags:
- atlassian
- confluence
- atlassian-connect
- note to self
author: David Simpson

---

*I'm writing this down here as I often question my knowledge of what is correct and I'd like to find this information in a single article. 
If you wish to comment to correct this, please do so and I'll update the post with the corrected information. 
This article was previously also posted [here](https://community.developer.atlassian.com/t/how-to-get-the-license-status-of-an-atlassian-connect-app/57066).*

For Atlassian Connect apps, there are 2 license states that can be found from within the app:

* active
* none

…but several ways to locate this information.

## Getting the license status

There are various methods:

### Get license status from the request parameter on the app's URL

Jira & Confluence will request your app with a URL similar to this

```
https://your-special.app/some-screen?jwt={jwt}&{...}&lic=active
https://your-special.app/some-screen?jwt={jwt}&{...}&lic=none
```

Simply test for this request parameter:

```
const getUrlSearchParam = (key) =>
  new URLSearchParams(location.search).get(key);
		
const license = getUrlSearchParam('lic'); // `active` or `none`
```

### Get license status from the context

#### When using JWT based auth

`AP.context.getToken` gives a JSON object

```
AP.context.getToken((token) => { // token is a JSON object
  const isLicenseActive = token.context.license.active; // true or false
});
```

#### When auth is `NONE`

`AP.context.getToken` gives a JWT string that needs parsing...

```
const parseJwt = (token) => { // @see: https://stackoverflow.com/a/38552302
  var base64 = token.split(".")[1].base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(window.atob(base64).split("").map((c) =>  "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)) .join(""));
  return JSON.parse(jsonPayload) || null;
};

AP.context.getToken((token) => { // token is a JSON object
  const payload = parseJwt(token); // parse the token to reveal the payload
  const isLicenseActive = payload?.context?.license?.active || false;
});
```

### Get the license from the REST API for the app

🔴  &nbsp; *Warning, this may give false data because of [MC-1001](https://ecosystem.atlassian.net/browse/MC-1001)*



This method gives you the most detail on the “current state” of the license:

```
AP.request('/rest/atlassian-connect/1/addons/{addon-key}')
  .then(data => JSON.parse(data.body))
  .then(data => {
  	console.log(data); // spew out everything
	const isLicenseActive = data?.license?.active || false;
  });
```

Examples output of the console.log output…

#### Unlicensed app

This may just be what you get from a developer license/private listing – need to confirm this.

```
{
	"key": "{addon-key}",
	"version": "X.Y.Z-AC",
	"installedDate": "2021-11-10T10:17:14Z",
	"lastUpdated": "2021-11-25T15:03:43Z",
	"state": "ENABLED",
	"host": {
		"product": "Confluence"
	},
	"links": {
		"marketplace": [
			{
				"href": "https://marketplace.atlassian.com/plugins/{addon-key}"
			}
		],
		"self": [
			{
				"href": "https://yourinstance.atlassian.net/wiki/rest/atlassian-connect/1/addons/{addon-key}"
			}
		]
	}
}
```

#### Active evaluation license

```
{
	"key": "{addon-key}",
	"version": "X.Y.Z-AC",
	"installedDate": "2021-11-10T10:17:14Z",
	"lastUpdated": "2021-11-25T15:03:43Z",
	"state": "ENABLED",
	"host": {
		"product": "Confluence"
	},
	"license": {
		"active": true,
		"type": "COMMERCIAL",
		"evaluation": true,
		"supportEntitlementNumber": "SEN-XXXXX",
		"entitlementId": "abcdef-ghi-jki-9103-gfdgfdg12345",
		"entitlementNumber": "E-XXX-XXX-XXX-XXX"
	},
	"links": {
		"marketplace": [
			{
				"href": "https://marketplace.atlassian.com/plugins/{addon-key}"
			}
		],
		"self": [
			{
				"href": "https://yourinstance.atlassian.net/wiki/rest/atlassian-connect/1/addons/{addon-key}"
			}
		]
	}
}
```

That's it. Let me know if there's any other ways :slight_smile: 

In my [next post](https://community.developer.atlassian.com/t/what-is-the-atlassian-connect-licensing-lifecycle/57067), I'm asking what do `lic=active` & `lic=none` actually mean?
