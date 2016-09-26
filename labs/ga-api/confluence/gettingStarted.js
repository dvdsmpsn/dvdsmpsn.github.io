// Load the Google data JavaScript client library.
google.load('gdata', '1.x', {packages: ['analytics']});

// Set the callback function when the library is ready.
google.setOnLoadCallback(init);

/**
 * This is called once the Google Data JavaScript library has been loaded.
 * It creates a new AnalyticsService object, adds a click handler to the
 * authentication button and updates the button text depending on the status.
 */
function init() {
  myService = new google.gdata.analytics.AnalyticsService('gaExportAPI_acctSample_v1.0');
  scope = 'https://www.google.com/analytics/feeds';
  var button = document.getElementById('authButton');

  // Add a click handler to the Authentication button.
  button.onclick = function() {
    // Test if the user is not authenticated.
    if (!google.accounts.user.checkLogin(scope)) {
      // Authenticate the user.
      google.accounts.user.login(scope);
    } else {
      // Log the user out.
      google.accounts.user.logout();
      getStatus();
    }
  }
  getStatus();
}

/**
 * Utility method to display the user controls if the user is 
 * logged in. If user is logged in, get Account data and
 * get Report Data buttons are displayed.
 */
function getStatus() {
  var getAccountButton = document.getElementById('getAccount');
  getAccountButton.onclick = getAccountFeed;
  
  var getDataButton = document.getElementById('getData');
  getDataButton.onclick = getDataFeed;

  var dataControls = document.getElementById('dataControls');
  var loginButton = document.getElementById('authButton');
  if (!google.accounts.user.checkLogin(scope)) {
    dataControls.style.display = 'none';   // hide control div
    loginButton.innerHTML = 'Access Google Analytics';
  } else {
    dataControls.style.display = 'block';  // show control div
    loginButton.innerHTML = 'Logout';
  }
}

/**
 * Main method to get account data from the API.
 */

function getAccountFeed() {
  var myFeedUri =
      'https://www.google.com/analytics/feeds/accounts/default?max-results=50';
  myService.getAccountFeed(myFeedUri, handleAccountFeed, handleError);
}

/**
 * Handle the account data returned by the Export API by constructing the inner parts
 * of an HTML table and inserting into the HTML file.
 * @param {object} result Parameter passed back from the feed handler.
 */
function handleAccountFeed(result) {
  // An array of analytics feed entries.
  var entries = result.feed.getEntries();

  // Create an HTML Table using an array of elements.
  var outputHtml = '<select id="profileId">'

  // Iterate through the feed entries and add the data as select options.
  for (var i = 0, entry; entry = entries[i]; ++i) 
  {
	outputHtml += '<option value="' + entry.getTableId().getValue() + '">' 
		+ entry.getTitle().getText() + '</option>';
  }
  outputHtml += '</select>';

  // Insert the table into the UI.
  document.getElementById('profilesDiv').innerHTML = 
	'<label for="profileId">Select Confluence Profile:</label> ' + outputHtml
	+ ' <button id="getSpaces">List Spaces</button>';
	
	
	var getSpacesButton = document.getElementById('getSpaces');
	getSpacesButton.onclick = getSpacesFeed;
	
	document.getElementById('dateRange').style.display = 'block';
}

function getSpacesFeed() {

	var profileIdSelect = document.getElementById('profileId');
	var profileIdValue = profileIdSelect[profileIdSelect.selectedIndex].value;	
	var startDateValue = document.getElementById('startDate').value;
	var endDateValue = document.getElementById('endDate').value;
	
	// there isn't currently a content drilldown, so we have to cheat
	// Get a list of all pages by popularity and hope a lot of the spaces are listed

	var myFeedUri = 'https://www.google.com/analytics/feeds/data' +
	    '?start-date=' + startDateValue +
	    '&end-date=' + endDateValue +
	    '&dimensions=ga:pagePath' +
	    '&metrics=ga:pageviews' +
	    '&sort=-ga:pageviews' +
	    '&max-results=500' +
		'&filters=ga:pagePath%3D~%5E/display/*' +
	    '&ids=' + profileIdValue;

	  myService.getDataFeed(myFeedUri, handleSpacesFeed, handleError);	
}

function handleSpacesFeed(result) {
	// An array of analytics feed entries.
	var entries = result.feed.getEntries();

	var previousSpacekey = '';

	// Create HTML... 
	var outputHtml = '<select id="spaceKeyId">'

	var keysArray = [];

	// Iterate through the feed entries and add the data as select options.
	for (var i = 0, entry; entry = entries[i]; ++i) 
	{
		// Get the spaceKey from the URI
		var uri = new String( entry.getValueOf('ga:pagePath') );
		var splitty = uri.split("/");

		currentSpaceKey= splitty[2];
		keysArray.push(currentSpaceKey);
	}

	keysArray.sort();

	var outputHtml = '<select id="spaceKeyId">'

	for ( var i in keysArray )
	{
		// Remove duplicates
		if (keysArray[i] != '' && keysArray[i] != 'undefined' && keysArray[i] != previousSpacekey)
		{
			outputHtml += '<option>' + keysArray[i] + '</option>';
		}
		previousSpacekey = keysArray[i];
	}
	outputHtml += '</select>';


  // Insert the table into the UI.
  document.getElementById('spacesDiv').innerHTML = 
	'<label for="profileId">Select Space:</label> ' + outputHtml
	+ ' <button id="getData">Get Report</button>';


	var getDataButton = document.getElementById('getData');
	getDataButton.onclick = getDataFeed;	
	
}


/**
 * Main method to get report data from the Export API.
 */
function getDataFeed() {

	var profileIdSelect = document.getElementById('profileId');
	var profileIdValue = profileIdSelect[profileIdSelect.selectedIndex].value;
	
var spaceKeySelect = document.getElementById('spaceKeyId');
var spaceKeyValue = spaceKeySelect[spaceKeySelect.selectedIndex].value;

var startDateValue = document.getElementById('startDate').value;
var endDateValue = document.getElementById('endDate').value;
	
var myFeedUri = 'https://www.google.com/analytics/feeds/data' +
    '?start-date=' + startDateValue +
    '&end-date=' + endDateValue +
    '&dimensions=ga:pageTitle,ga:pagePath' +
    '&metrics=ga:pageviews' +
    '&sort=-ga:pageviews' +
    '&max-results=20' +
	'&filters=ga:pagePath%3D~%5E/display/' + spaceKeyValue + '/*' +
    '&ids=' + profileIdValue;
  
  myService.getDataFeed(myFeedUri, handleDataFeed, handleError);
}

/**
 * Handle the data returned by the Export API by constructing the 
 * inner parts of an HTML table and inserting into the HTML File.
 * @param {object} result Parameter passed back from the feed handler.
 */
function handleDataFeed(result) {
 
 // An array of Analytics feed entries.
 var entries = result.feed.getEntries();
 
 // Create an HTML Table using an array of elements.
 var outputTable = ['<table><tr>',
                    '<th class="left">Page Title</th>',
                    '<th class="left">Page Path</th>',
                    '<th class="right">Pageviews</th></tr>'];

  // Iterate through the feed entries and add the data as table rows.
  for (var i = 0, entry; entry = entries[i]; ++i) {

     // Add a row in the HTML Table array.
     var row = [
       '>'+entry.getValueOf('ga:pageTitle'),
       '>'+entry.getValueOf('ga:pagePath'),
       ' class="right">'+entry.getValueOf('ga:pageviews')
     ].join('</td><td');
     outputTable.push('<tr><td', row, '</td></tr>');
   }
   outputTable.push('</table>');

  // Insert the table into the UI.
  document.getElementById('outputDiv').innerHTML =
      outputTable.join('');
}

/**
 * Alert any errors that come from the API request.
 * @param {object} e The error object returned by the Analytics API.
 */
function handleError(e) {
  var error = 'There was an error!\n';
  if (e.cause) {
    error += e.cause.status;
  } else {
    error.message;
  }
  alert(error);
}