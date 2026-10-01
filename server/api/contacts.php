<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
$u=require_user();
if($_SERVER['REQUEST_METHOD']==='GET')respond(['ok'=>true,'items'=>profile_read($u['id'],'contact-groups',[])]);
if($_SERVER['REQUEST_METHOD']!=='POST')fail('Method not allowed.',405);
$p=json_body();$action=bounded_string($p['action']??'save','action',40);$groups=profile_read($u['id'],'contact-groups',[]);
if($action==='delete'){$id=bounded_string($p['id']??null,'id',512);$groups=array_values(array_filter($groups,fn($g)=>($g['id']??'')!==$id));profile_write($u['id'],'contact-groups',$groups);respond(['ok'=>true,'items'=>$groups]);}
if($action!=='save')fail('Unknown contacts action.');$name=trim(bounded_string($p['name']??null,'Group name',100));$names=$p['memberUsernames']??[];if(!is_array($names)||count($names)>100)fail('Contact groups support up to 100 users.');$members=[];$seen=[];foreach($names as $raw){$n=validate_username($raw);$m=user_by_username($n);if(!$m||($m['enabled']??true)!==true)fail('Unknown or disabled user: '.$n);if(isset($seen[$m['id']]))continue;$seen[$m['id']]=true;$members[]=public_user($m);} $id=isset($p['id'])?bounded_string($p['id'],'id',512):uuid_like('contactgroup');$existing=null;foreach($groups as $g)if(($g['id']??'')===$id)$existing=$g;$now=gmdate('c');$group=['id'=>$id,'name'=>$name,'members'=>$members,'createdAt'=>$existing['createdAt']??$now,'updatedAt'=>$now];$found=false;foreach($groups as $i=>$g)if(($g['id']??'')===$id){$groups[$i]=$group;$found=true;break;}if(!$found)$groups[]=$group;profile_write($u['id'],'contact-groups',$groups);respond(['ok'=>true,'item'=>$group,'items'=>$groups],201);
