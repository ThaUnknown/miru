<?php
$url = str_replace("$", "&", $_GET['url']);
$query = explode("&q=", $url) [1];
if (strpos($query, '/') === false)
{
    $cache_file = './cache/' . $query;
    // echo $url.'\n';
    // echo $cache_file.'\n';
    if (substr($url, 0, 25) === "https://nyaa.si/?page=rss") {
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
    }elseif(substr($url, 0, 41) === "http://www.horriblesubs.info/rss.php?res="){
        $file = file_get_contents(str_replace(" ", "+", $url));
        header('Content-Type: text/xml');
        echo $file;
    }
}
?>