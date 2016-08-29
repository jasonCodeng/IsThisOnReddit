var content = $("#content");
var status1 = $("#status");

$( document ).ready(function() {
  getCurrentTabUrl(function(url) {
    renderStatus('Checking reddit for \n' + url);
    getSubredditData(url, function(data) {
      renderStatus('Results found! \n' + url);
      parseJSON(data);
    }, function(error) {
      renderStatus('Cannot display data: ' + error);
    })
  })
});

/**
 * Get the current URL of the active tab.
 * * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  chrome.tabs.query({active: true, currentWindow:true}, function(tabs) {
    var activeTab = tabs[0];
    var activeTabUrl = activeTab.url;
    callback(activeTabUrl);
  });
}

/**
 * Gets data from RedditAPI using URL
 * @param {string} url - Url for Reddit search.
 * @param {function(string,number,number)} callback - Called when url has
 *   been found. Returns a JSON response
 * @param {function(string)} errorCallback - Called when url has not been posted.
 */
function getSubredditData(searchUrl, callback, error) {
  var searchUrl = 'http://www.reddit.com/api/info.json?&url=' + encodeURIComponent(searchUrl);

  $.get(searchUrl, function(response) {
    if (!response || !response.data || !response.data.children || response.data.children.length == 0) {
      error("No response from Reddit!")
      return;
    }
    console.log(response);
    callback(response);
  })
}

function renderStatus(statusText) {
  status1.text(statusText);
}

function parseJSON(data) {
	var output = '';
	// heading:
	output +='<h2>Results:</h2><p>' + 'Reddit has ' + data['data']['children'].length +  (data['data']['children'].length == 1?' post':' posts') +  ' for this URL</p>';

	// begin table:
	output +='<table><tr><th>Subreddit</th><th>Date</th><th>Comments</th><th>Score</th><th>Link</th></tr>' ;

	// loop through json data:
	for(i = 0; i < data['data']['children'].length; i++){
		// subreddit cell:
		output +='<td>/r/' + data['data']['children'][i]['data']['subreddit'] + '</td>';
		// date parsing:
		var post_date = new Date(data['data']['children'][i]['data']['created'] * 1000);
		// date cell:
		output +=' <td nowrap=1> ' + post_date.toString().substring(0,15) + '</td>';
		// comments cell:
		output +=' <td> ' + data['data']['children'][i]['data']['num_comments'] + ' </td>';
		// score cell:
		output +='<td>' + data['data']['children'][i]['data']['ups'] + ' </td>' ;
		// link cell and end row:
		output +='<td><a href="http://reddit.com' + data['data']['children'][i]['data']['permalink'] + '">' + data['data']['children'][i]['data']['permalink'] + '</a> </td></tr>' ;
	}
	// close table:
	output +='</table>' ;

	// put content into the #content div
	$('#content').html(output);
}
