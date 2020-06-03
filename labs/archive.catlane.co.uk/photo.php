<?php

	function getMachineTagId ($infoArray,$prefix)
	{
		$returnValue = false;
		$tags = $infoArray['tags']['tag'];

		if (Count($tags) > 0)
		{
			foreach ($tags as $key => $val)
			{
				if (preg_match('/^'.$prefix.'\:/', $val['raw']))
				{
					$returnValue = substr($val['raw'], strlen($prefix)+1);
					break;
				}
			}
		}
		return $returnValue;
	}
	
	function getTags($infoArray)
	{
		$returnValue = array();
		$tags = $infoArray['tags']['tag'];
		$i = 0;

		if (Count($tags) > 0)
		{
			foreach ($tags as $key => $val)
			{
	
					$returnValue[$i] = $val['raw'];
					$i++;
			}
		}
		return $returnValue;	
	}
	
	
	
	require_once("./phpFlickr/phpFlickr.php");
	
	$flickrApiKey = "39c4a32eb68190887394b59d6f727847"; // for user "catlane.friesians"

	$phpFlickr = new phpFlickr($flickrApiKey);	
	
	if ($_SERVER['HTTP_HOST'] != 'localhost')
	{
		$phpFlickr->enableCache("fs", "./phpFlickrCache"); // apache needs write access to this directory
	}
	
	$id = $_GET['id'];
	$photoInfo = $phpFlickr->photos_getInfo($id);
	
//	echo '<pre>';
//	print_r($photoInfo);
//	echo '</pre>';

	$smallHeading = "Photo";
	$title = $photoInfo['title'];


	include 'header.php';


?>
	<div id="photo"><img src="<?=$phpFlickr->buildPhotoURL($photoInfo)?>" title="<?=$photo['title']?>" /></div>
	
<?php	
		if ($photoInfo['description'] != '')
		{
			$photoInfo['description'] = preg_replace('/\n\n/s', "</p><p>", $photoInfo['description']);
			$photoInfo['description'] = preg_replace('/\n/s',   "<br/>", $photoInfo['description']);
			
			echo '<p>' . $photoInfo['description'] . '</p>';
		}

	    $animalId = getMachineTagId($photoInfo,'huk');	

		if ($animalId)
		{
			echo "
				<h4>Animal Data from <a href=\"http://holstein-uk.org/\">Holstein UK</a></h4>
				<ul id=\"huk\">
					<li><a class=\"iframe\" href=\"http://ukcows.com/holsteinUK/publicweb/AnimalData/data/ASAncestrydetails.asp?{$animalId}\">Ancestry</a></li>
					<li><a class=\"iframe\" href=\"http://ukcows.com/holsteinUK/publicweb/AnimalData/data/ASFemalefs.asp?{$animalId}\">Fact Sheet</a></li>
				</ul>
			";
		}
		
		$tags = getTags($photoInfo);
		
		if (Count(tags) > 0)
		{
			echo '<h4>Tags</h4><p>This photo is listed in the following categories:</p><ul id="tags" class="inline">';
			
			foreach ($tags as $tag)
			{
				echo "<li><a href=\"./?tags={$tag}\">{$tag}</a></li>";
			}
			echo '</ul>';
		}

?>

	<div id="flickrCredits"><a href="http://www.flickr.com/photos/catlane/<?=$id?>"><img src="images/flickr-logo.gif" title="Photos hosted by flickr.com" /></a></div>
	
<?php include 'footer.php'; ?>