<?php
declare(strict_types=1);
$path=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
if($path==='/'||$path==='/index.php'){require __DIR__.'/index.php';return true;}
if(preg_match('~^/api/(health|annotations|schemas|snapshots|events|auth|invites|admin|contacts|messages|group-chats)\.php$~',$path,$m)){require __DIR__.'/api/'.$m[1].'.php';return true;}
if(str_starts_with($path,'/media/')){require __DIR__.'/media.php';return true;}
if(preg_match('~^/(assets/[a-zA-Z0-9_./-]+\.(js|css)|schemas/[a-zA-Z0-9_-]+\.schema\.json)$~',$path)&&!str_contains($path,'..')&&is_file(__DIR__.$path))return false;
http_response_code(404);header('Content-Type: text/plain');echo 'Not found';return true;
