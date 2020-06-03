<?php
	session_start();
	
	$item = $_REQUEST['sessionItem'];
	
	
	if (isset($_REQUEST['text']))
	{
		$_SESSION[$item.'text'] = $_REQUEST['text'];
	}

	if (isset($_REQUEST['text']))
	{
		$_SESSION[$item.'text'] = $_REQUEST['text'];
	}

	if (isset($_REQUEST['font']))
	{
		$_SESSION[$item.'font'] = $_REQUEST['font'];		
	}

	if (isset($_REQUEST['color']))
	{
		$_SESSION[$item.'color'] = $_REQUEST['color'];		
	}

	if (isset($_REQUEST['align']))
	{
		$_SESSION[$item.'align'] = $_REQUEST['align'];		
	}

?>
<p><?=$item?>align: <?=$_SESSION[$item.'align']?></p>
<p><?=$item?>color: <?=$_SESSION[$item.'color']?></p>
<p><?=$item?>font: <?=$_SESSION[$item.'font']?></p>
<p><?=$item?>text: <?=$_SESSION[$item.'text']?></p>

