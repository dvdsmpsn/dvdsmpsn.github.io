<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="en-GB">

<head>
	<title><?=$title?> | Photo Archive | Catlane British Friesians</title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta name="description" content="A blog about web design, technology and life, by Rodrigo Galindez." />
	<meta name="author" content="Rodrigo Galindez" />
	<link rel="stylesheet" href="css/style.css" type="text/css" media="screen" />
	<!--[if IE 6]>
		<link rel="stylesheet" href="css/ie6.css" type="text/css" media="screen" />
	<![endif]-->
	
	

	<script type="text/javascript" src="http://code.jquery.com/jquery-1.4.1.min.js"></script>
	<script type="text/javascript" src="js/fancybox/jquery.fancybox-1.3.0.pack.js"></script>
	<script type="text/javascript" src="js/fancybox/jquery.easing-1.3.pack.js"></script>
	
	<script type="text/javascript">
	$(document).ready(function() {

		$("#huk a").fancybox({
			'width'         : 750,
			'height'        : 600,
			'speedIn'		:	600, 
			'speedOut'		:	200, 
			'overlayShow'	:	false
		});
	});
	</script>
	
	<link rel="stylesheet" href="js/fancybox/jquery.fancybox-1.3.0.css" type="text/css" media="screen" />
		
</head>







<body>
	<div id="wrapper">
		<div id="main-nav" class="col span-12">
			<ul>
				<li class="page_item "><a href="#TODO-FIX-UP-A-WEBSITE">Home</a></li>
				<li class="page_item "><a href="./">Photo Archive</a></li>
				<li class="page_item "><a href="location.php">Location</a></li>
				<li class="page_item "><a href="#TODO-ADD-A-CONTACT-PAGE">Contact Us</a></li>
			</ul>			
		</div>		

		<div id="header" class="col last span-12">
			<h1><a href="./">Catlane British Friesians</a></h1>
			<h2>A photo archive <span class="low">of</span> the last 40 years <span class="low">or so</span></h2>
		</div>

		<hr />

	<div id="content" class="col span-8">

		<div class="col last span-8">
			<h4 class="ver small"><?=$smallHeading?></h4>	
		
			<div class="section">	
				<h3><?=$title?></h3>
				
