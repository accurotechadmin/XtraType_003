<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
$admin=require_admin();
if($_SERVER['REQUEST_METHOD']==='GET')respond(['ok'=>true,'system'=>system_settings(),'users'=>array_map('public_user',read_collection('users'))]);
if($_SERVER['REQUEST_METHOD']!=='POST')fail('Method not allowed.',405);
$p=json_body();$action=bounded_string($p['action']??null,'action',40);
if($action==='setInvitesEnabled'||$action==='setSystemEnabled'){$s=system_settings();if($action==='setInvitesEnabled')$s['invitesEnabled']=($p['enabled']??false)===true;else $s['systemEnabled']=($p['enabled']??false)===true;respond(['ok'=>true,'system'=>save_system_settings($s)]);}
if($action==='updateUser'){$id=bounded_string($p['userId']??null,'userId',512);$target=user_by_id($id);if(!$target)fail('User not found.',404,'userNotFound');if($target['id']===$admin['id']&&array_key_exists('enabled',$p)&&$p['enabled']!==true)fail('The seed administrator cannot disable their own account.');if(array_key_exists('enabled',$p))$target['enabled']=$p['enabled']===true;if(array_key_exists('canCreateInvites',$p))$target['canCreateInvites']=$p['canCreateInvites']===true;upsert_item('users',$target);if(($target['enabled']??true)!==true)revoke_user_sessions($target['id']);profile_write($target['id'],'profile',public_user($target));respond(['ok'=>true,'user'=>public_user($target)]);}
fail('Unknown admin action.');
