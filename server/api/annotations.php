<?php
require __DIR__.'/bootstrap.php';
$authUser=require_api_user_if_initialized();
$method=$_SERVER['REQUEST_METHOD'];
if($method==='GET'){
 $rows=read_collection('annotations');if(isset($_GET['id'])){foreach($rows as $r)if($r['id']===$_GET['id'])respond(['ok'=>true,'item'=>$r]);fail('Annotation not found.',404);}
 if(isset($_GET['videoId']))$rows=array_values(array_filter($rows,fn($r)=>($r['target']['kind']??'')==='youtube'&&($r['target']['value']['videoId']??'')===$_GET['videoId']));
 if(isset($_GET['targetKey']))$rows=array_values(array_filter($rows,fn($r)=>($r['targetKey']??'')===$_GET['targetKey']));
 usort($rows,fn($a,$b)=>strcmp($b['createdAt']??'',$a['createdAt']??''));respond(['ok'=>true,'items'=>$rows]);
}
if($method==='DELETE'){respond(['ok'=>true,'deleted'=>delete_item('annotations',bounded_string($_GET['id']??null,'id',512))]);}
if($method==='POST'){
 $p=payload_body();validate_annotation($p);if($authUser){$p['author']=$authUser['displayName']??$authUser['username'];$p['authorUserId']=$authUser['id'];}$files=uploads();$placeholders=count(array_filter($p['attachments'],fn($a)=>!empty($a['upload'])));
 if($placeholders && $placeholders!==count($files))fail('Image upload/attachment count mismatch.');
 if(!$placeholders && count($p['attachments'])+count($files)>3)fail('At most three images.');
 foreach($p['attachments'] as $a)if(empty($a['upload']))validate_media($a);
 // Decode before creating media: corrupt collections cannot trigger new durable uploads.
 read_collection('annotations');$new=save_images($files);$attachments=[];$i=0;
 foreach($p['attachments'] as $a){if(!empty($a['upload'])){$file=$new[$i++];$file['id']=$a['id'];$attachments[]=$file;}else{unset($a['blobId'],$a['serverBase'],$a['serverUrl']);$attachments[]=$a;}}
 if(!$placeholders)$attachments=array_merge($attachments,$new);$p['attachments']=$attachments;
 respond(['ok'=>true,'item'=>upsert_item('annotations',$p)],201);
}
fail('Method not allowed.',405);
