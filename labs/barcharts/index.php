<html>
<head>
<style>
	body {
		font-family: sans-serif;	
	}




	.barchart {
		padding-left: 70px;
	}

	.bar { 
		margin-top: 4px; 
		font-family: sans-serif;
		font-size:8pt;
		font-weight: bold;
		text-indent: -70px;
	}
	
	.bar-participant { background: #00A695; }
	.bar-manager { background: #f30; }
	.bar-peer { background: #f60; }
	.bar-reports { background: #FFD900	; }

	span.unit {
		width: 35px;
		border-right: 1px solid #ccc;
		display: inline-block;
		text-align: right;
		font-size:6pt;
	}
	
</style>
</head>
<body>
	
	
	
<?php

	function htmlBarChart($participant, $manager, $peer, $reports, $width=35) {
		return '<div class="barchart">'
			.'<span class="unit">1 &nbsp;</span><span class="unit">2 &nbsp;</span><span class="unit">3 &nbsp;</span><span class="unit">4 &nbsp;</span><span class="unit">5 &nbsp;</span>'
			.'<div class="bar bar-participant" style="width:'. round($width*$participant) .'px;">participant</div>'      
			.'<div class="bar bar-manager"     style="width:'. round($width*$manager) .'px;">manager</div>'
			.'<div class="bar bar-peer"        style="width:'. round($width*$peer) .'px;">peer</div>'     
			.'<div class="bar bar-reports"     style="width:'. round($width*$reports) .'px;">reports</div>'  
		 .'</div>';		
	}	

?>	
	

<?= htmlBarChart(4.5, 3.6, 2.8, 3.57) ?>
<p></p>
<?= htmlBarChart(1.7, 4.1, 2.2, 4.1) ?>

	

</body>
</html>

