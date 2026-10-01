<?php
declare(strict_types=1);

const XTRATYPE_SESSION_DAYS = 30;
const XTRATYPE_INVITE_TZ = 'Etc/GMT+5'; // Fixed EST, as requested (UTC-05:00 year-round).

function auth_lock(callable $fn): mixed {
    global $config;
    $path=$config['data_dir'].'/.auth.lock';
    if(!is_dir($config['data_dir'])&&!mkdir($config['data_dir'],0700,true)&&!is_dir($config['data_dir']))throw new RuntimeException('Storage directory unavailable.');
    $h=fopen($path,'c');if(!$h||!flock($h,LOCK_EX))throw new RuntimeException('Cannot lock account registry.');
    try{return $fn();}finally{flock($h,LOCK_UN);fclose($h);}
}
function canonical_username(string $username): string {return strtolower($username);}
function validate_username(mixed $value): string {
    $u=trim(bounded_string($value,'Username',32));
    if(strlen($u)<3||!preg_match('/^[A-Za-z0-9][A-Za-z0-9_.-]{1,30}[A-Za-z0-9]$/',$u))fail('Username must be 3-32 characters using letters, numbers, dot, underscore or hyphen.');
    return $u;
}
function validate_password(mixed $value): string {
    $p=bounded_string($value,'Password',200);
    if(strlen($p)<10)fail('Password must be at least 10 characters.');
    return $p;
}
function user_by_id(string $id): ?array {foreach(read_collection('users') as $u)if(($u['id']??'')===$id)return $u;return null;}
function user_by_username(string $username): ?array {$c=canonical_username($username);foreach(read_collection('users') as $u)if(($u['usernameCanonical']??canonical_username($u['username']??''))===$c)return $u;return null;}
function public_user(array $u): array {return ['id'=>$u['id'],'username'=>$u['username'],'displayName'=>$u['displayName']??$u['username'],'role'=>$u['role']??'user','enabled'=>($u['enabled']??true)===true,'canCreateInvites'=>($u['canCreateInvites']??true)===true,'createdAt'=>$u['createdAt']??null];}
function account_setup_required(): bool {return count(read_collection('users'))===0;}
function system_settings(): array {
    foreach(read_collection('system_settings') as $row)if(($row['id']??'')==='system:global')return ['id'=>'system:global','systemEnabled'=>($row['systemEnabled']??true)===true,'invitesEnabled'=>($row['invitesEnabled']??true)===true,'updatedAt'=>$row['updatedAt']??null];
    return ['id'=>'system:global','systemEnabled'=>true,'invitesEnabled'=>true,'updatedAt'=>null];
}
function save_system_settings(array $next): array {$next=['id'=>'system:global','systemEnabled'=>($next['systemEnabled']??true)===true,'invitesEnabled'=>($next['invitesEnabled']??true)===true,'updatedAt'=>gmdate('c')];return upsert_item('system_settings',$next);}
function bearer_token(): ?string {
    $h=$_SERVER['HTTP_AUTHORIZATION']??'';
    if(!preg_match('/^Bearer\s+([A-Za-z0-9_-]{32,256})$/',$h,$m))return null;
    return $m[1];
}
function auth_user(bool $required=true,bool $allowSystemDisabled=false): ?array {
    $token=bearer_token();
    if(!$token){if($required)fail('Login required.',401,'authRequired');return null;}
    $hash=hash('sha256',$token);$now=time();$session=null;
    foreach(read_collection('sessions') as $s)if(hash_equals((string)($s['tokenHash']??''),$hash)){$session=$s;break;}
    if(!$session||strtotime((string)($session['expiresAt']??''))<$now){if($required)fail('Session expired. Log in again.',401,'sessionExpired');return null;}
    $u=user_by_id((string)$session['userId']);
    if(!$u||($u['enabled']??true)!==true){if($required)fail('This account is disabled.',403,'accountDisabled');return null;}
    $sys=system_settings();
    if(!$allowSystemDisabled&&!$sys['systemEnabled']&&($u['role']??'user')!=='admin'){if($required)fail('XtraType server access is currently disabled by the administrator.',403,'systemDisabled');return null;}
    return $u;
}
function require_user(bool $allowSystemDisabled=false): array {return auth_user(true,$allowSystemDisabled);}
function require_admin(): array {$u=require_user(true);if(($u['role']??'user')!=='admin')fail('Administrator access required.',403,'adminRequired');return $u;}
function require_api_user_if_initialized(): ?array {if(account_setup_required())return null;return require_user(false);}
function issue_session(array $u): array {
    $token=rtrim(strtr(base64_encode(random_bytes(32)),'+/','-_'),'=');$now=gmdate('c');$expires=(new DateTimeImmutable('now',new DateTimeZone('UTC')))->modify('+'.XTRATYPE_SESSION_DAYS.' days')->format('c');
    $row=['id'=>uuid_like('session'),'userId'=>$u['id'],'tokenHash'=>hash('sha256',$token),'createdAt'=>$now,'expiresAt'=>$expires];upsert_item('sessions',$row);
    return ['token'=>$token,'expiresAt'=>$expires];
}
function revoke_bearer_session(): void {$token=bearer_token();if(!$token)return;$hash=hash('sha256',$token);repository()->mutate('sessions',function(array $rows)use($hash){$next=array_values(array_filter($rows,fn($s)=>!hash_equals((string)($s['tokenHash']??''),$hash)));return[$next,null];});}
function revoke_user_sessions(string $userId): void {repository()->mutate('sessions',function(array $rows)use($userId){return[array_values(array_filter($rows,fn($s)=>($s['userId']??'')!==$userId)),null];});}
function profile_key(string $userId): string {return preg_replace('/[^A-Za-z0-9_-]/','_',str_replace('user:','',$userId));}
function profile_dir(string $userId): string {global $config;$dir=rtrim($config['profile_dir'],'/\\').'/'.profile_key($userId);if(!is_dir($dir)&&!mkdir($dir,0700,true)&&!is_dir($dir))throw new RuntimeException('Profile storage unavailable.');return $dir;}
function profile_read(string $userId,string $doc,array $fallback=[]): array {$path=profile_dir($userId).'/'.$doc.'.json';if(!is_file($path))return $fallback;$raw=file_get_contents($path);if($raw===false)throw new RuntimeException('Cannot read profile document.');try{$v=json_decode($raw,true,64,JSON_THROW_ON_ERROR);}catch(JsonException $e){throw new RuntimeException('Corrupt profile document.',0,$e);}return is_array($v)?$v:$fallback;}
function profile_write(string $userId,string $doc,array $value): void {$dir=profile_dir($userId);$path=$dir.'/'.$doc.'.json';$tmp=$path.'.tmp.'.bin2hex(random_bytes(6));$json=json_encode($value,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR)."\n";if(file_put_contents($tmp,$json,LOCK_EX)===false)throw new RuntimeException('Cannot stage profile document.');chmod($tmp,0600);if(!rename($tmp,$path)){@unlink($tmp);throw new RuntimeException('Cannot replace profile document.');}}
function invite_day_key(string $iso): string {$d=new DateTimeImmutable($iso);return $d->setTimezone(new DateTimeZone(XTRATYPE_INVITE_TZ))->format('Y-m-d');}
function invite_reset_at(): string {$tz=new DateTimeZone(XTRATYPE_INVITE_TZ);$next=(new DateTimeImmutable('now',$tz))->modify('tomorrow')->setTime(0,0);return $next->format('c');}
function random_base62(int $length): string {$alphabet='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';$out='';for($i=0;$i<$length;$i++)$out.=$alphabet[random_int(0,61)];return $out;}
function decorate_message(array $m): array {$s=user_by_id((string)($m['senderUserId']??''));$r=user_by_id((string)($m['recipientUserId']??''));$out=$m;unset($out['internal']);$out['sender']=$s?public_user($s):null;$out['recipient']=$r?public_user($r):null;return $out;}
function decorate_group_message(array $m): array {$u=user_by_id((string)($m['senderUserId']??''));return [...$m,'sender'=>$u?public_user($u):null];}
