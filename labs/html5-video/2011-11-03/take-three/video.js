// see also: http://www.w3.org/2010/05/video/mediaevents.html


$(function() {
	

	var syndicationTargetPageId = 'xxxxx-syndication-target-xxxxx-'+getTime();
	var videoGuid = 'xxxx-video-guid-here-xxxx-'+getTime();

	$('video').bind('loadedmetadata', function(){
		// wait for metadata to be loaded before finding the duration
		// http://stackoverflow.com/questions/2221029/problem-retrieving-html5-video-duration
		$('#console').append('<li>Loaded (Duration: '+Math.round(this.duration*10)/10+'s)</li>');
		
		dcsMultiTrack(
			'DCS.dcssip', location.host, 
			'DCS.dcsuri', getVirtualPageView('loaded'),      
			'WT.ti', 'Event: Loaded',
			
			'DCSext.w_item_id',	'item-id-test-one',
			'DCSext.w_item_type',	'item-type-test-one',
			
			'DCSext.w_syndication_target_page_id', syndicationTargetPageId, 
			'DCSext.w_video_guid', videoGuid,  
			'DCSext.w_event_type','Loaded (Duration: '+Math.round(this.duration*10)/10+'s)'
		);
	});
	
	$('video').bind('play', function(){
		
		percentPlayed = 100*(this.currentTime/this.duration);
		
		if (this.currentTime == 0){
			$('#console').append('<li>Started</li>');
			dcsMultiTrack(
				'DCS.dcssip', location.host, 
				'DCS.dcsuri', getVirtualPageView('started'),      
				'WT.ti', 'Event: Started',
				
				'DCSext.w_item_id',	'item-id-test-one',
				'DCSext.w_item_type',	'item-type-test-one',

				'DCSext.w_syndication_target_page_id', syndicationTargetPageId, 
				'DCSext.w_video_guid', videoGuid,  
				'DCSext.w_event_type','Started'
			);			
		}else{
			var eventText = 'Play: ' + getMediaTiming(this);
			$('#console').append('<li>'+eventText+'</li>');
			dcsMultiTrack(
				'DCS.dcssip', location.host, 
				
				'DCSext.w_item_id',	'item-id-test-one',
				'DCSext.w_item_type',	'item-type-test-one',
				
				'DCSext.w_syndication_target_page_id', syndicationTargetPageId, 
				'DCSext.w_video_guid', videoGuid,  
				'DCSext.w_event_type',eventText
			);
		}
	});

	
	$('video').bind('pause', function(){
		
		var eventText = 'Pause: ' + getMediaTiming(this);
		percentPlayed = 100*(this.currentTime/this.duration);
		
		$('#console').append('<li>'+eventText+'</li>');
		dcsMultiTrack(
			'DCS.dcssip', location.host, 
			'DCS.dcsuri', getVirtualPageView('paused/'+percentPlayed),      
			'WT.ti', 'Event:' + eventText,	  
			
			'DCSext.w_item_id',	'item-id-test-one',
			'DCSext.w_item_type',	'item-type-test-one',      

			'DCSext.w_syndication_target_page_id', syndicationTargetPageId, 
			'DCSext.w_video_guid', videoGuid,  
			'DCSext.w_event_type', eventText
		);		
	});

	$('video').bind('ended', function(){
		
		$('#console').append('<li>Ended</li>');
		dcsMultiTrack(
			'DCS.dcssip', location.host, 
			'DCS.dcsuri', getVirtualPageView('ended'),      
			'WT.ti', 'Event: Ended',
			
			'DCSext.w_item_id',	'item-id-test-one',
			'DCSext.w_item_type',	'item-type-test-one',
				        
			'DCSext.w_syndication_target_page_id', syndicationTargetPageId, 
			'DCSext.w_video_guid', videoGuid,  
			'DCSext.w_event_type','Ended'
		);		
	});
	
	
	
	$('video').bind('volumechange', function(){
		if (this.muted){
			var eventText = 'Volume change: muted';
			$('#console').append('<li>Volume change: muted</li>');	
			dcsMultiTrack(
				'DCS.dcssip', location.host, 
				'DCS.dcsuri', getVirtualPageView('volumechanged/muted'),      
				'WT.ti', 'Event:' + eventText,	  
				
				'DCSext.w_item_id',	'item-id-test-one',
				'DCSext.w_item_type',	'item-type-test-one',      

				'DCSext.w_syndication_target_page_id', syndicationTargetPageId, 
				'DCSext.w_video_guid', videoGuid,  
				'DCSext.w_event_type','Volume change: muted'
			);			
		}else{
			var eventText = 'Volume change: '+Math.round(this.volume*100)+'%';
			$('#console').append('<li>'+eventText+'</li>');
			dcsMultiTrack(
				'DCS.dcssip', location.host, 
				'DCS.dcsuri', getVirtualPageView('volumechanged/'+Math.round(this.volume*100)),      
				'WT.ti', 'Event:' + eventText,	
				
				'DCSext.w_item_id',	'item-id-test-one',
				'DCSext.w_item_type',	'item-type-test-one',        
				
				'DCSext.w_syndication_target_page_id', syndicationTargetPageId, 
				'DCSext.w_video_guid', videoGuid,  
				'DCSext.w_event_type', eventText
			);	
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
		
		var eventText = 'Percent of video played: '+Math.round(percentPlayed*10)/10+'%';
		
		if (percentPlayed < 100){
		
			$('#console').append('<li>'+eventText+'</li>');
			alert('beforeunload. '+eventText);
			dcsMultiTrack(
				'DCS.dcssip', location.host,
				'DCS.dcsuri', getVirtualPageView('abandoned/'+percentPlayed),      
				'WT.ti', 'Event:' + eventText,
				
				'DCSext.w_item_id',	'item-id-test-one',
				'DCSext.w_item_type',	'item-type-test-one',	 
			       
				'DCSext.w_syndication_target_page_id', syndicationTargetPageId, 
				'DCSext.w_video_guid', videoGuid,  
				'DCSext.w_event_type',eventText
			);	
		}		
	});

	
	
	
	/***************************************/
	
	$('#clear-console').click( function(e){	
		$('#console').empty();
		e.preventDefault();
	});



	function getMediaTiming(media){
		var percentPlayed = 100*(media.currentTime/media.duration);

		return Math.round(percentPlayed*10)/10
		+'% ('+Math.round(media.currentTime*10)/10
		+'s of '
		+Math.round(media.duration*10)/10
		+'s)';	
	}

	function getVirtualPageView(eventValue){
		return '/virtual/syndication/'+syndicationTargetPageId+'/video/'+videoGuid+'/event/'+eventValue;
	}
	
	function getTime(){
		var date = new Date();

		var hour = date.getHours();
		var minute = date.getMinutes();
		if (hour < 10){
			hour = '0'+hour;
		}
		if (minute < 10){
			minute = '0'+minute;
		}
		return hour+''+minute;
	}

});
	