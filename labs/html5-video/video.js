// see also: http://www.w3.org/2010/05/video/mediaevents.html

var mediaEvents = [
	'abort',             // 
	'canplay',           // 
	'canplaythrough',    // 
	'durationchange',    // 
	'emptied',           // 
	'ended',             // 
	'error',             // 
	'loadeddata',        // 
	'loadedmetadata',    // 
	'loadstart',         // 
	'pause',             // 
	'play',              // 
	'playing',           // 
	'progress',          // 
	'ratechange',        // 
	'readystatechange',  // 
	'seeked',            // 
	'seeking',           // 
	'stalled',           // 
	'suspend',           // 
	'timeupdate',        // 
	'volumechange',      // 
	'waiting'
	];
	
	

$(function() {
	
	
	$.each(mediaEvents, function(){
		
		$('video').bind(this, function(i){
			// wait for metadata to be loaded before finding the duration
			// http://stackoverflow.com/questions/2221029/problem-retrieving-html5-video-duration
			$('#console').append('<li>'+mediaEvents[i]+'</li>');
		});
		
	});

	$('video').bind('loadedmetadata', function(){
		// wait for metadata to be loaded before finding the duration
		// http://stackoverflow.com/questions/2221029/problem-retrieving-html5-video-duration
		$('#console').append('<li>Duration: '+Math.round(this.duration*10)/10+'s</li>');
	});
	
	$('video').bind('play', function(){
		
		percentPlayed = 100*(this.currentTime/this.duration);
		// $('#console').append('<li>Play</li>');
		$('#console').append('<li>Play: '
			+ Math.round(percentPlayed*10)/10
			+'% ('+Math.round(this.currentTime*10)/10
			+'s of '
			+Math.round(this.duration*10)/10
			+'s)</li>'
		);		
	});

	
	$('video').bind('pause', function(){
		
		percentPlayed = 100*(this.currentTime/this.duration);
		
		$('#console').append('<li>Pause: '
			+ Math.round(percentPlayed*10)/10
			+'% ('+Math.round(this.currentTime*10)/10
			+'s of '
			+Math.round(this.duration*10)/10
			+'s)</li>'
		);
		
	});

	$('video').bind('ended', function(){
		
		$('#console').append('<li>Ended</li>');
	});
	
	
	
	$('video').bind('volumechange', function(){
		if (this.muted){
			$('#console').append('<li>Volume change: muted</li>');			
		}else{
			$('#console').append('<li>Volume change: '+Math.round(this.volume*100)+'%</li>');
		}
	});
	
	$('video').bind('error', function(){
		
		$('#console').append('<li>Error</li>');
	});
	
	// Note: unload & beforeunload events do not trigger in Chrome 15 (works on Firefox 7.0.1 & Safari 5.1.1)
	// http://stackoverflow.com/questions/870623/ajax-or-jsonp-on-unload-with-safari-chrome
	$(window).bind('beforeunload', function(){
		
		$me = $('video')[0];
		percentPlayed = 100*($me.currentTime/$me.duration);
		//window.open('http://davidsimpson.me/#!/finishedAt/'+Math.round(percentPlayed*10)/10);
		alert('beforeunload. Percent of video played: '+Math.round(percentPlayed*10)/10);
	});

	
	
	
	/***************************************/
	
	$('#clear-console').click( function(e){	
		$('#console').empty();
		e.preventDefault();
	});

});