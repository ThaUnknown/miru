<?php
$url = str_replace("$", "&", $_GET['url']);
$query = explode("?", $url) [1];
if (strpos($query, '/') === false)
{
    $cache_file = './cache/' . $query;
    if (substr($url, 0, 25) === "https://nyaa.si/?page=rss") {
        if (file_exists($cache_file) && (filemtime($cache_file) > (time() - 60 * 1))) {
            $file = file_get_contents($cache_file);
            header('Content-Type: text/xml');
            echo $file;
        } else {
            $file = file_get_contents(str_replace(" ", "+", $url));
            file_put_contents($cache_file, $file, LOCK_EX);
            header('Content-Type: text/xml');
            echo $file;
        }
    } elseif (substr($url, 0, 41) === "http://www.horriblesubs.info/rss.php?res="){
        if (file_exists($cache_file) && (filemtime($cache_file) > (time() - 60 * 0.5))) {
            $file = file_get_contents($cache_file);
            header('Content-Type: text/xml');
            echo $file;
        } else {
            $file = file_get_contents(str_replace(" ", "+", $url));
            file_put_contents($cache_file, $file, LOCK_EX);
            header('Content-Type: text/xml');
            echo $file;
        }
    }
}
?>