<?php
declare(strict_types=1);
require_once dirname(__DIR__,2).'/src/server/Repository.php';
$config=require dirname(__DIR__).'/config.php';
ini_set('display_errors','0');
set_exception_handler(function(Throwable $e): never {
    error_log('XtraType: '.$e->getMessage());
    fail($e instanceof RuntimeException?$e->getMessage():'The request could not be processed.',500,'storageOrServerFailure');
});
function respond(mixed $data,int $status=200): never {
    http_response_code($status);header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');header('X-Content-Type-Options: nosniff');
    echo json_encode($data,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);exit;
}
function fail(string $message,int $status=400,string $code='invalidRequest'): never {respond(['ok'=>false,'error'=>$code,'message'=>$message],$status);}
function guard_request(): void {
    global $config;
    $host=preg_replace('/:\d+$/','',strtolower($_SERVER['HTTP_HOST']??''));
    if(!in_array($host,$config['allowed_hosts'],true))fail('Host is not allowed. Configure deployment explicitly.',403,'hostDenied');
    $origin=$_SERVER['HTTP_ORIGIN']??'';
    $scheme=(!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off')?'https':'http';
    $same=$scheme.'://'.($_SERVER['HTTP_HOST']??'');
    $extension=preg_match('/^chrome-extension:\/\/([a-p]{32})$/',$origin,$m) && (!$config['extension_ids']||in_array($m[1],$config['extension_ids'],true));
    if($origin && $origin!==$same && !in_array($origin,$config['allowed_origins'],true) && !$extension)fail('Origin is not allowed.',403,'originDenied');
    if($origin){header('Access-Control-Allow-Origin: '.$origin);header('Vary: Origin');}
    header('Access-Control-Allow-Headers: Content-Type, X-XtraType-Client, Authorization');header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
    if(($_SERVER['REQUEST_METHOD']??'')==='OPTIONS'){http_response_code(204);exit;}
    if((int)($_SERVER['CONTENT_LENGTH']??0)>$config['max_request_bytes'])fail('Request exceeds 32 MiB.',413,'requestTooLarge');
    if(in_array($_SERVER['REQUEST_METHOD'],['POST','DELETE'],true) && !in_array($_SERVER['HTTP_X_XTRATYPE_CLIENT']??'',['chrome-extension','web','test'],true))fail('X-XtraType-Client header required.',403,'clientHeaderRequired');
}
function repository(): Repository {static $r;global $config;return $r??=new JsonRepository($config['data_dir']);}
function read_collection(string $name): array{return repository()->read($name);}
function upsert_item(string $collection,array $item): array {
    return repository()->mutate($collection,function(array $rows)use($item){foreach($rows as $i=>$row)if($row['id']===$item['id']){$rows[$i]=$item;return[$rows,$item];}$rows[]=$item;return[$rows,$item];});
}
function delete_item(string $name,string $id): bool{return repository()->mutate($name,function(array $rows)use($id){$next=array_values(array_filter($rows,fn($r)=>$r['id']!==$id));return[$next,count($next)!==count($rows)];});}
function parse_json(string $raw): array {
    try{$v=json_decode($raw,true,64,JSON_THROW_ON_ERROR);}catch(JsonException){fail('Malformed JSON.');}
    if(!is_array($v)||!str_starts_with(ltrim($raw),'{'))fail('Request must be a JSON object.');return $v;
}
function json_body(): array{return parse_json(file_get_contents('php://input')?:'');}
function payload_body(): array {
    if(str_starts_with($_SERVER['CONTENT_TYPE']??'','multipart/form-data'))return parse_json($_POST['payload']??'');
    if(!str_starts_with($_SERVER['CONTENT_TYPE']??'','application/json'))fail('Use JSON or multipart/form-data.',415);return json_body();
}
function uuid_like(string $prefix): string{return $prefix.':'.bin2hex(random_bytes(16));}
function bounded_string(mixed $v,string $name,int $max,bool $required=true): string {
    if(!is_string($v)||strlen($v)>$max||($required&&trim($v)===''))fail($name.' must be a valid bounded string.');return $v;
}
function record_id(array &$p,string $prefix): void {$p['id']=$p['id']??uuid_like($prefix);bounded_string($p['id'],'id',512);}
function timestamp(mixed $v): string {
    if(!is_string($v)||!preg_match('/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,6})?(?:Z|[+-]\d\d:\d\d)$/',$v))fail('Invalid timestamp.');
    try{new DateTimeImmutable($v);$errors=DateTimeImmutable::getLastErrors();if($errors&&($errors['warning_count']||$errors['error_count']))fail('Invalid timestamp.');}catch(Exception){fail('Invalid timestamp.');}return $v;
}
function uploads(): array {
    $out=[];foreach($_FILES as $f){if(is_array($f['name']??null)){foreach($f['name'] as $i=>$n)$out[]=['name'=>$n,'tmp_name'=>$f['tmp_name'][$i],'error'=>$f['error'][$i],'size'=>$f['size'][$i]];}else $out[]=$f;}return $out;
}
// Validate every upload before persisting any; content-addressed files make lost-response retries stable.
function save_images(array $files): array {
    global $config;$validated=[];if(count($files)>3)fail('At most three images.');
    foreach($files as $f){
        if(($f['error']??-1)!==UPLOAD_ERR_OK||!is_uploaded_file($f['tmp_name']))fail('Image upload failed.');
        $size=filesize($f['tmp_name']);if(!$size||$size>$config['max_image_bytes'])fail('Each image must be at most 8 MiB.');
        $type=(new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);$ext=['image/png'=>'png','image/jpeg'=>'jpg','image/webp'=>'webp'][$type]??null;
        $dim=getimagesize($f['tmp_name']);if(!$ext||!$dim||$dim[0]*$dim[1]>40000000)fail('Use valid PNG, JPEG or WebP images up to 40 million pixels.');
        $hash=hash_file('sha256',$f['tmp_name']);$validated[]=[$f,$size,$type,$ext,$hash];
    }
    $saved=[];$dir=$config['media_dir'];if(!is_dir($dir)&&!mkdir($dir,0700,true)&&!is_dir($dir))throw new RuntimeException('Media storage unavailable.');
    foreach($validated as [$f,$size,$type,$ext,$hash]){
        $name=$hash.'.'.$ext;$dest=$dir.'/'.$name;
        if(!is_file($dest)){if(!move_uploaded_file($f['tmp_name'],$dest))throw new RuntimeException('Could not store image.');chmod($dest,0600);}
        $saved[]=['id'=>'media:'.$hash,'name'=>substr(preg_replace('/[^A-Za-z0-9._-]/','-',basename($f['name'])),0,200),'type'=>$type,'size'=>$size,'url'=>'/media/'.$name];
    }return $saved;
}
function validate_media(array $a): array {
    global $config;$url=bounded_string($a['url']??null,'image URL',1024);
    if(!preg_match('~^/media/(?:[0-9]{4}-[0-9]{2}/)?[A-Za-z0-9_-]+\.(png|jpg|webp)$~',$url))fail('Only media stored by this server may be referenced.');
    if(!is_file($config['media_dir'].'/'.substr($url,7)))fail('Referenced media is missing.');
    return $a;
}
guard_request();
require_once dirname(__DIR__,2).'/src/server/Auth.php';
require_once dirname(__DIR__,2).'/src/server/Validation.php';
