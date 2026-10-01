<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';

if($_SERVER['REQUEST_METHOD']==='GET'){
    $u=auth_user(false,true);$sys=system_settings();
    respond(['ok'=>true,'setupRequired'=>account_setup_required(),'inviteRequired'=>!account_setup_required(),'authenticated'=>$u!==null,'user'=>$u?public_user($u):null,'system'=>$sys]);
}
if($_SERVER['REQUEST_METHOD']!=='POST')fail('Method not allowed.',405);
$p=json_body();$action=bounded_string($p['action']??null,'action',40);
if($action==='register'){
    $result=auth_lock(function()use($p){
        $username=validate_username($p['username']??null);$password=validate_password($p['password']??null);$display=trim((string)($p['displayName']??$username));if($display==='')$display=$username;if(strlen($display)>100)fail('Display name is too long.');
        if(user_by_username($username))fail('That username is already registered.',409,'usernameTaken');
        $users=read_collection('users');$first=count($users)===0;$invite=null;
        if(!$first&&!system_settings()['systemEnabled'])fail('XtraType server access is currently disabled by the administrator.',403,'systemDisabled');
        if(!$first){
            $code=trim(bounded_string($p['inviteCode']??null,'Invitation code',80));
            foreach(read_collection('invites') as $row)if(($row['code']??'')===$code){$invite=$row;break;}
            if(!$invite||!empty($invite['usedAt']))fail('Invitation code is invalid or has already been used.',403,'invalidInvite');
            $creator=user_by_id((string)($invite['createdByUserId']??''));if(!$creator||($creator['enabled']??true)!==true)fail('The invitation owner is no longer active.',403,'invalidInvite');
        }
        $now=gmdate('c');$u=['id'=>uuid_like('user'),'username'=>$username,'usernameCanonical'=>canonical_username($username),'displayName'=>$display,'passwordHash'=>password_hash($password,PASSWORD_DEFAULT),'role'=>$first?'admin':'user','enabled'=>true,'canCreateInvites'=>true,'createdAt'=>$now,'invitedByUserId'=>$invite['createdByUserId']??null,'inviteCodeUsed'=>$invite['code']??null];
        upsert_item('users',$u);
        if($invite){$invite['usedByUserId']=$u['id'];$invite['usedByUsername']=$username;$invite['usedAt']=$now;upsert_item('invites',$invite);$ownerInvites=profile_read($invite['createdByUserId'],'invitations',[]);foreach($ownerInvites as &$r)if(($r['code']??'')===$invite['code']){$r['usedByUserId']=$u['id'];$r['usedByUsername']=$username;$r['usedAt']=$now;}unset($r);profile_write($invite['createdByUserId'],'invitations',$ownerInvites);}
        profile_write($u['id'],'profile',['id'=>$u['id'],'username'=>$username,'displayName'=>$display,'role'=>$u['role'],'createdAt'=>$now]);
        profile_write($u['id'],'registration',['registeredAt'=>$now,'invitationCode'=>$invite['code']??null,'invitedByUserId'=>$invite['createdByUserId']??null]);
        profile_write($u['id'],'invitations',[]);profile_write($u['id'],'contact-groups',[]);profile_write($u['id'],'group-chats',[]);
        $session=issue_session($u);return ['user'=>public_user($u),'session'=>$session,'firstAdmin'=>$first];
    });
    respond(['ok'=>true,...$result],201);
}
if($action==='login'){
    $username=validate_username($p['username']??null);$password=bounded_string($p['password']??null,'Password',200);$u=user_by_username($username);
    if(!$u||!password_verify($password,(string)($u['passwordHash']??'')))fail('Username or password is incorrect.',401,'invalidCredentials');
    if(($u['enabled']??true)!==true)fail('This account is disabled.',403,'accountDisabled');
    $sys=system_settings();if(!$sys['systemEnabled']&&($u['role']??'user')!=='admin')fail('XtraType server access is currently disabled by the administrator.',403,'systemDisabled');
    $session=issue_session($u);respond(['ok'=>true,'user'=>public_user($u),'session'=>$session]);
}
if($action==='logout'){auth_user(false,true);revoke_bearer_session();respond(['ok'=>true]);}
fail('Unknown auth action.');
