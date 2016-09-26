<?php
	/*
	 *   Copyright (c) 2006 Concise Web Design Limited.
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
     *
 	 */
 	 
 	class fontomatic{
 
		var $imageWidth = '400';
		
		var $text = '';
		var $textAlign = 'C'; // default center
 		
 		// Default the text colours
 		var $fontColorR  = "93";
 		var $fontColorG  = "45";
 		var $fontColorB  = "70";
		
		var $fontFileLocation;
		var $fontSize = 12;


	    function fontomatic (){ }
	
		function output(){

			$lines = explode("\n", $this->text);
			$lineHeight = 1.5*$this->fontSize;
			$imageHeight  = (Count($lines) * $lineHeight) + 8;
	
			$im         = imagecreate($this->imageWidth, $imageHeight);
			$white      = imagecolorallocate($im, 255, 255, 255);
			$black      = imagecolorallocate($im, 0, 0, 0);
	
			$angle      = 0;
			$x          = $this->imageWidth/2;
			$y          = 0;
	
			// Set the text color
	   		$color     = imagecolorallocate($im, $this->fontColorR, $this->fontColorG, $this->fontColorB);
	
			// For each line in the text
			for ($i=0; $i<Count($lines); $i++){
				// Move down a line
				$y += $lineHeight;
				// Create a text box with $alignment [L|C|R]
				$this->imagettftextalign($im, $this->fontSize, $angle, $x, $y, $color, $this->fontFileLocation, $lines[$i], $this->textAlign);
			}
			
			// Ensure that the image is not cached
			header("Cache-Control: no-cache, must-revalidate");
			// Specific content type
			header("Content-type: image/gif");
	
			imageGif($im);
			imagedestroy($im);			
		}

		
 		function setImageWidth($imageWidth){
	
 			$this->imageWidth  = $imageWidth;
 		}
 		function setFontSize($fontSize){
	
 			$this->fontSize  = $fontSize;
 		}	    
		function setFontLocation($location){
			
			$this->fontFileLocation  = $location;
		}
	    function setText($display_text){
		
	    	$this->text = $display_text;
	    }
		function setTextAlignment($align){
			
			$this->textAlign = $align;
		}
		
	
 		function setFontColor ($r, $g, $b){
			
 			$this->fontColorR = $r;
 			$this->fontColorG = $g;
 			$this->fontColorB = $b;
 		}
	    
		function imagettftextalign($image, $size, $angle, $x, $y, $color, $font, $text, $alignment='L') {
	
		   //check width of the text
		   $bbox = imagettfbbox ($size, $angle, $font, $text);
		   $textWidth = $bbox[2] - $bbox[0];
		   switch ($alignment) {
			   case "R":
				   $x =  $this->imageWidth - $textWidth;
				   break;
			   case "C":
				   $x -= $textWidth / 2;
				   break;
			   default:
					$x = 0;
			   	   break;
		   }
		   //write text
		   imagettftext ($image, $size, $angle, $x, $y, $color, $font, $text);
		}

 	 }

?>