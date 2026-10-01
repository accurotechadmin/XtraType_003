<?php
require __DIR__.'/bootstrap.php';
$authUser=require_api_user_if_initialized();
if($_SERVER['REQUEST_METHOD']==='GET'){$rows=read_collection('snapshots');if(isset($_GET['pageKey']))$rows=array_values(array_filter($rows,fn($r)=>($r['pageKey']??'')===$_GET['pageKey']));usort($rows,fn($a,$b)=>strcmp($b['capturedAt']??'',$a['capturedAt']??''));respond(['ok'=>true,'items'=>$rows]);}
if($_SERVER['REQUEST_METHOD']==='POST'){
 $p=payload_body();record_id($p,'snapshot');if(($p['recordType']??'')!=='Revision.Snapshot'||($p['schemaVersion']??0)!==1)fail('Expected Revision.Snapshot v1.');
 bounded_string($p['pageKey']??null,'pageKey',16000);$url=bounded_string($p['url']??null,'URL',8192);if(!preg_match('~^https?://~',$url))fail('Snapshots need HTTP(S) URLs.');$u=parse_url($url);if(!$u||empty($u['host'])||isset($u['user']))fail('Invalid snapshot URL.');$bare=$u['scheme'].'://'.$u['host'].(isset($u['port'])?':'.$u['port']:'').($u['path']??'/');if($p['pageKey']!=='url:'.$bare)fail('Snapshot pageKey mismatch.');
 if(!in_array($p['mode']??'',['visible','full-page'],true))fail('Invalid capture mode.');
 bounded_string($p['renderedHtml']??'','HTML',20000000,false);bounded_string($p['renderedText']??'','Text',8000000,false);$p['capturedAt']=timestamp($p['capturedAt']??gmdate('c'));
 $files=uploads();if(count($files)>1)fail('One screenshot per snapshot.');if(!$files&&!isset($p['screenshot']))fail('Screenshot required.');if(isset($p['screenshot']))validate_media($p['screenshot']);
 read_collection('snapshots');$saved=save_images($files);if($saved)$p['screenshot']=$saved[0];$p['syncState']='synced';unset($p['screenshotBlobId'],$p['syncError'],$p['syncBase']);respond(['ok'=>true,'item'=>upsert_item('snapshots',$p)],201);
}fail('Method not allowed.',405);
