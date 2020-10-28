<?php
header("Access-Control-Allow-Origin: https://mirumoe.netlify.app");
$url = str_replace("$", "&", $_GET['url']);
    if (substr($url, 0, 25) === "https://nyaa.si/?page=rss")
    {
		$query = explode("?page=rss", $url) [1];
		$query_check = basename(realpath($query));
		if ($query_check === "") {
			if (strpos($query, '/') === false) {
				$cache_file = './cache_nyaa/' . $query;
				//echo $url.'\n';
				//echo $cache_file.'\n';
					if (file_exists($cache_file) && (filemtime($cache_file) > (time() - 60 * 1)))
					{
						// Cache file is less than five minutes old.
						// Don't bother refreshing, just use the file as-is.
						$file = file_get_contents($cache_file);
						header('Content-Type: text/xml');
						//echo 'case fucking 1';
						echo $file;
					}
					else
					{
						// Our cache is out-of-date, so load the data from our remote server,
						// and also save it over our cache for next time.
						$file = file_get_contents(str_replace(" ", "+", $url));
						file_put_contents($cache_file, $file, LOCK_EX);
						header('Content-Type: text/xml');
						// echo 'case fucking 2';
						echo $file;
					}
			}
		}
	}
    elseif (substr($url, 0, 31) === "https://www.erai-raws.info/rss-") {
		$query = explode("https://www.erai-raws.info/rss-", $url) [1];
		$query_check = basename(realpath($query));
		if ($query_check === "") {
			if (strpos($query, '/') === false) {
				$cache_file = './cache_erai/' . $query;
				// echo $url.'\n';
				// echo $cache_file.'\n';
					if (file_exists($cache_file) && (filemtime($cache_file) > (time() - 60 * 1))) {
						// Cache file is less than five minutes old.
						// Don't bother refreshing, just use the file as-is.
						$file = file_get_contents($cache_file);
						header('Content-Type: text/xml');
						//echo 'case fucking 1';
						echo $file;
					}
					else {
						// Our cache is out-of-date, so load the data from our remote server,
						// and also save it over our cache for next time.
						$file = file_get_contents(str_replace(" ", "+", $url));
						file_put_contents($cache_file, $file, LOCK_EX);
						header('Content-Type: text/xml');
						// echo 'case fucking 2';
						echo $file;
					}
			}
		}
	}
?>
