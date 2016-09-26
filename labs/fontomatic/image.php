<?php
	/*
	 *   Copyright (c) 2006-7 Concise Web Design Limited.
	 *       All Rights Reserved
	 *
	 *   This work is an unpublished work and contains confidential, proprietary,
	 *   and trade secret information of Concise Web Design Limited.  Access to this
	 *   work is restricted.  No part of this work may be used, practiced, performed,
	 *   copied, distributed, reproduced, revised, modified, translated,
	 *   abridged, condensed, expanded, collected, compiled, linked, recast,
	 *   transformed, adapted, or reverse engineered without the prior written
	 *   consent of Concise Web Design Limited.  Any use or exploitation of this work
	 *   without express authorization could subject the perpetrator to criminal
	 *   and civil liability.
	 *
     *   Created on 16-May-2006  david
     *   Updated on 22-Nov-2007  david
 	 */
	
	header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1 
	header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
	
	session_start();
	
	include_once ("./includes/fontomatic.class.php");

	// EXAMPLE TEXT
	// On the Special Day Direct website, the text is retrieved from a database
	$display_text = "
Lorem ipsum dolor sit amet, consectetur 
adipisicing elit, sed do eiusmod tempor 
incididunt ut labore et dolore magna 
aliqua. 

Ut enim ad minim veniam, quis nostrud 
exercitation ullamco laboris nisi ut 
aliquip ex ea commodo consequat. Duis 
aute irure dolor in reprehenderit in 
voluptate velit esse cillum 
dolore eu fugiat nulla pariatur. 
Excepteur sint occaecat cupidatat non 
proident, sunt in culpa qui officia deserunt 
mollit anim id est laborum.
"; 

	// ***** Set defaults

    $font_size    = 14; //font size
    $font_face    = "arial";

	$item = $_REQUEST['sessionItem'];

	if (isset($_SESSION[$item.'text']))
	{
		$display_text = $_SESSION[$item.'text'];
	}

	if (isset($_SESSION[$item."font"]))
	{
		$font_face = $_SESSION[$item."font"];
	}
//	$display_text .= $font_face;
	
	switch ($font_face){
		
		case "Lettering Style 111":
			$font_size = 12;
			break;
			
		case "Gill Sans":
		case "Lettering Style 109":
		case "Lettering Style 110":
			$font_size = 13;
			break;

		case "Arial":
			$font_size = 14;
			break;

		case "Carlton":
		case "English Script":
		case "Old English":
		case "Freehand":
		case "Pyrennesi":
		case "Lettering Style 101":
		case "Lettering Style 103":
		case "Lettering Style 104":
		case "Lettering Style 106":
			$font_size = 16;
			break;

		case "Lino Script":
		case "Nuptial Script":
		case "Lettering Style 102":
		case "Lettering Style 107":
		case "Lettering Style 108":
			$font_size = 18;
			break;

		case "Bickley":
		case "Lettering Style 105":
			$font_size = 20;
			break;
			
		default:
			// font_size already set - we hope!
			break;
	}

/*

?>
	<p>text: <?=$_SESSION['text']?></p>
	<p>font: <?=$_SESSION['font']?></p>

	<p>display_text: <?=$display_text?></p>
	<p>font_face: <?=$font_face?></p>

<?
	exit;
*/
	$colors = explode( ',', $_SESSION[$item.'color'] );
	
	// Create the image
	$image = new fontomatic();
	
	$image->setText($display_text);
	$image->setTextAlignment( $_SESSION[$item.'align'] );
	
	$image->setFontColor( $colors[0], $colors[1], $colors[2] );
	$image->setFontLocation("./includes/fonts/$font_face.ttf");
	$image->setFontSize($font_size);
	
	$image->output();
	
?>
