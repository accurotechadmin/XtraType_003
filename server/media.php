<?php
require_once __DIR__.'/api/bootstrap.php';$path=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
if(!preg_match('~^/media/((?:[0-9]{4}-[0-9]{2}/)?[A-Za-z0-9_-]+\.(png|jpg|webp))$~',$path,$m)){http_response_code(404);exit;}
$file=$config['media_dir'].'/'.$m[1];if(!is_file($file)){http_response_code(404);exit;}
header('Content-Type: '.['png'=>'image/png','jpg'=>'image/jpeg','webp'=>'image/webp'][$m[2]]);header('X-Content-Type-Options: nosniff');header('Cache-Control: private, max-age=3600');readfile($file);
