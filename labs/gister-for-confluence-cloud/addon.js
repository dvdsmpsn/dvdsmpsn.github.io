// polyfill
if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function(searchString, position) {
      position = position || 0;
      return this.lastIndexOf(searchString, position) === position;
    }
  });
}

$(function(){

	
	// a helper function
	getParameter = function (param) {
		var codedParams = (new RegExp(param + '=([^&]+)')).exec(window.location.search);
		if (codedParams != null) {
			return decodeURIComponent(codedParams[1]);
		}
		return '';
	};

	// atlassian-connect/all.js
	var contextPath = getParameter('xdm_e') + getParameter('cp');
	var allUrl      = contextPath + '/atlassian-connect/all.js';
	var gistUrl     = getParameter("gistUrl");

	// check for valid URL
	if (gistUrl.startsWith('https://gist.github.com/') == false) {
		gistUrl = 'https://gist.github.com/dvdsmpsn/b836ceb8b34f937a9b1b'; // default error message
	}

	// Measure with Google Analytics
	var analytics = function () {

		// Vanilla Google Analytics script
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

		// Collect the data
		var userKey  = getParameter("user_key");	
		var timezone = getParameter("tz");
		var location = getParameter("loc");
		var license  = getParameter("lic");
		var cv       = getParameter("cv");

		// Send the data to Google Analytics
		ga('create', 'UA-920590-11', 'auto');

		ga('set',    'dimension1', contextPath); 
		ga('set',    'dimension2', gistUrl); 
		// dimension3 is not currently used
		ga('set',    'dimension4', userKey); 
		ga('set',    'dimension5', timezone); 
		ga('set',    'dimension6', location); 
		ga('set',    'dimension7', license); 
		ga('set',    'dimension8', cv); 
		ga('set',    'dimension9', 'Gister for Confluence Cloud');	


		ga('send',   'pageview');
	};
	
	// Display the Gist 
	var gistCallback = function(data) {
		$('head').append( '<link rel="stylesheet" href="' + data.stylesheet + '" media="all">');
		$('#gister').append(data.div);
		$('a').attr('target', '_top'); // break out of the iframe
	};
	
	// Atlassian Connect is ready
	var onScriptLoad = function () {
		$.ajax({ url: gistUrl + '.json',  dataType: 'jsonp', success: gistCallback  });
		analytics();
	};

	$.getScript(allUrl, onScriptLoad);
});	