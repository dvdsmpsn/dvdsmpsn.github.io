<?php

	require_once("./phpFlickr/phpFlickr.php");

	$flickrApiKey = "39c4a32eb68190887394b59d6f727847"; // for user "catlane.friesians"

	$phpFlickr = new phpFlickr($flickrApiKey);	

	if ($_SERVER['HTTP_HOST'] != 'localhost')
	{
		$phpFlickr->enableCache("fs", "./phpFlickrCache"); // apache needs write access to this directory
	}

	$tags = 'catlane';

	if (isset($_GET['tags']))
	{
		$tags = str_replace( '\+', '\,' , $_GET['tags'] );
	}

	$photos = $phpFlickr->photos_search( 
		array(
			"user_id"=>"47611082@N04", // for "catlane.friesians", // http://idgettr.com/
			"tags"=>$tags,
			"tag_mode"=>"all"
		) 
	);
	
	$title = ucfirst($tags);
	
	if ($tags == 'catlane')
	{
		$title = 'All Photos';
	}
	
	if (isset($_GET['title']))
	{
		$title = $_GET['title'];
	}
	$smallHeading = "Category";
	
	
	include 'header.php';
	

?>

	<ul class="inline thumbnails">
<?php

	foreach ($photos['photo'] as $photo)
	{
		$thumbnailUrl = $phpFlickr->buildPhotoURL($photo, "Thumbnail");
		echo "
			<li>
				<a href=\"photo.php?id={$photo['id']}\"><img title=\"{$photo['title']}\" src=\"{$thumbnailUrl}\" /></a>
			</li>
			";
	}

?>
	</ul>

	
	
	<div id="flickrCredits"><a href="http://www.flickr.com/photos/catlane/"><img src="images/flickr-logo.gif" title="Photos hosted by flickr.com" /></a></div>


<?php include 'footer.php'; ?>