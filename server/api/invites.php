<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
$u=require_user();
if($_SERVER['REQUEST_METHOD']==='GET'){
    $items=array_values(array_filter(read_collection('invites'),fn($r)=>($r['createdByUserId']??'')===$u['id']));
    usort($items,fn($a,$b)=>strcmp($b['createdAt']??'',$a['createdAt']??''));
    respond(['ok'=>true,'items'=>$items,'nextResetAt'=>invite_reset_at(),'system'=>system_settings()]);
}
if($_SERVER['REQUEST_METHOD']!=='POST')fail('Method not allowed.',405);
$sys=system_settings();if(!$sys['invitesEnabled'])fail('Invitation creation is disabled by the administrator.',403,'invitesDisabled');if(($u['canCreateInvites']??true)!==true)fail('This account cannot create invitations.',403,'invitesDisabled');
$item=auth_lock(function()use($u){$today=invite_day_key(gmdate('c'));foreach(read_collection('invites') as $r)if(($r['createdByUserId']??'')===$u['id']&&invite_day_key((string)$r['createdAt'])===$today)fail('You can create one invitation per EST calendar day.',429,'inviteDailyLimit');
    $existing=array_flip(array_map(fn($r)=>(string)($r['code']??''),read_collection('invites')));do{$code=random_base62(12);}while(isset($existing[$code]));$item=['id'=>uuid_like('invite'),'code'=>$code,'createdByUserId'=>$u['id'],'createdByUsername'=>$u['username'],'createdAt'=>gmdate('c'),'usedByUserId'=>null,'usedByUsername'=>null,'usedAt'=>null];upsert_item('invites',$item);$mine=profile_read($u['id'],'invitations',[]);$mine[]=$item;profile_write($u['id'],'invitations',$mine);return $item;});
respond(['ok'=>true,'item'=>$item,'nextResetAt'=>invite_reset_at()],201);
