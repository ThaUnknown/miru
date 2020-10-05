<?php
$url = str_replace("$", "&", $_GET['url']);
    if (substr($url, 0, 25) === "https://nyaa.si/?page=rss")
    {
		$query = explode("?page=rss", $url) [1];
		if (strpos($query, '/') === false)
		{
			$cache_file = './cache_nyaa/' . $query;
				if (file_exists($cache_file) && (filemtime($cache_file) > (time() - 60 * 1)))
				{
					$file = file_get_contents($cache_file);
					header('Content-Type: text/xml');
					echo $file;
				}
				else
				{
					$file = file_get_contents(str_replace(" ", "+", $url));
					file_put_contents($cache_file, $file, LOCK_EX);
					header('Content-Type: text/xml');
					echo $file;
				}
		}
	}
    elseif (substr($url, 0, 30) === "https://www.erai-rss.info/rss-")
    {
		$query = explode("https://www.erai-rss.info/", $url) [1];
		if (strpos($query, '/') === false)
		{
			$cache_file = './cache_erai/' . $query;
				if (file_exists($cache_file) && (filemtime($cache_file) > (time() - 60 * 1)))
				{
					$file = file_get_contents($cache_file);
					header('Content-Type: text/xml');
					echo $file;
				}
				else
				{
					$file = file_get_contents(str_replace(" ", "+", $url));
					file_put_contents($cache_file, $file, LOCK_EX);
					header('Content-Type: text/xml');
					echo $file;
				}
		}
	}
?>
