<?php
declare(strict_types=1);
function normalize_schema(array $s): array {
    bounded_string($s['$id']??null,'Schema id',512);
    if(str_starts_with($s['$id'],'xtratype.anchor.'))fail('Built-in schema IDs are reserved.');
    if(($s['type']??'')!=='object'||!is_array($s['properties']??null)||count($s['properties'])>50)fail('Schema needs at most 50 primitive properties.');
    $allowed=['$schema','$id','title','description','type','properties','required','additionalProperties','x-xtratype'];
    foreach(array_keys($s) as $k)if(!in_array($k,$allowed,true))fail('Unsupported schema keyword: '.$k);
    if(isset($s['additionalProperties'])&&!is_bool($s['additionalProperties']))fail('additionalProperties must be boolean.');
    if(isset($s['required'])&&(!is_array($s['required'])||!array_is_list($s['required'])))fail('required must be a list.');
    foreach($s['required']??[] as $key)if(!is_string($key)||!array_key_exists($key,$s['properties']))fail('Required property does not exist.');
    foreach($s['properties'] as $name=>$d){
        if(in_array($name,['__proto__','constructor','prototype'],true)||!is_array($d))fail('Invalid property.');
        foreach(array_keys($d) as $k)if(!in_array($k,['type','title','description','enum','minimum','maximum','minLength','maxLength','default'],true))fail('Unsupported property keyword: '.$k);
        $ts=is_array($d['type']??null)?$d['type']:[$d['type']??'string'];
        if(count(array_filter($ts,fn($t)=>$t!=='null'))!==1||array_diff($ts,['string','number','integer','boolean','null']))fail('Unsupported primitive type.');
        foreach(['minimum','maximum','minLength','maxLength'] as $k)if(isset($d[$k])&&(!is_numeric($d[$k])||is_string($d[$k])||(str_ends_with($k,'Length')&&(!is_int($d[$k])||$d[$k]<0))))fail('Invalid schema bound.');
        if((isset($d['minimum'],$d['maximum'])&&$d['minimum']>$d['maximum'])||(isset($d['minLength'],$d['maxLength'])&&$d['minLength']>$d['maxLength']))fail('Reversed bounds.');
        if(isset($d['enum'])&&(!is_array($d['enum'])||!count($d['enum'])||count($d['enum'])>100))fail('Invalid enum.');
        foreach($d['enum']??[] as $v)validate_field($d,$v,$name);
        if(array_key_exists('default',$d))validate_field($d,$d['default'],$name);
    }
    if(isset($s['x-xtratype'])&&!is_array($s['x-xtratype']))fail('Invalid schema metadata.');
    if(isset($s['x-xtratype']['kind'])&&$s['x-xtratype']['kind']!=='custom')fail('Custom schemas cannot claim reserved kinds.');
    $s['x-xtratype']=array_merge($s['x-xtratype']??[],['kind'=>'custom','label'=>$s['x-xtratype']['label']??$s['title']??$s['$id']]);return $s;
}
function validate_field(array $d,mixed $v,string $name): void {
    $types=is_array($d['type']??null)?$d['type']:[$d['type']??'string'];$ok=false;
    foreach($types as $t)$ok=$ok||match($t){'null'=>$v===null,'string'=>is_string($v),'number'=>is_int($v)||is_float($v),'integer'=>is_int($v)||(is_float($v)&&floor($v)===$v),'boolean'=>is_bool($v),default=>false};
    if(!$ok)fail($name.' has the wrong type.');
    if(isset($d['enum'])&&!array_filter($d['enum'],fn($x)=>$x===$v||((is_int($x)||is_float($x))&&(is_int($v)||is_float($v))&&$x==$v)))fail($name.' is not an allowed enum value.');
    if(is_int($v)||is_float($v)){if((isset($d['minimum'])&&$v<$d['minimum'])||(isset($d['maximum'])&&$v>$d['maximum']))fail($name.' is out of range.');}
    if(is_string($v)){$len=preg_match_all('/./us',$v);if((isset($d['minLength'])&&$len<$d['minLength'])||(isset($d['maxLength'])&&$len>$d['maxLength']))fail($name.' has invalid length.');}
}
function schema_catalog(): array {
    $by=[];foreach(glob(dirname(__DIR__,2).'/server/schemas/*.schema.json') as $f){$s=json_decode(file_get_contents($f),true,64,JSON_THROW_ON_ERROR);$by[$s['$id']]=$s;}
    foreach(read_collection('schemas') as $r){$s=$r['schema']??$r;if(!str_starts_with($s['$id']??'','xtratype.anchor.'))$by[$s['$id']]=normalize_schema($s);}return array_values($by);
}
// Validate the existing JS-rounded key without re-rounding it with PHP's different tie rules.
function quantized_component(string $part, int|float $value, int $places): bool {
    if (!preg_match('/^-?\d+\.\d{'.$places.'}$/D', $part)) return false;
    $tolerance = 0.5 * pow(10, -$places) + PHP_FLOAT_EPSILON * max(1, abs($value));
    return abs((float)$part - $value) <= $tolerance;
}
function validate_target(array $t,string $key): void {
    $kind=$t['kind']??'';$v=$t['value']??null;if(!is_array($v))fail('Target value is required.');
    if($kind!=='custom'&&($t['schemaId']??'')!=='xtratype.anchor.'.$kind.'@1')fail('Target schema mismatch.');
    if(!str_starts_with($key,$kind.':'))fail('Target key kind mismatch.');
    if($kind==='url'){
        $url=bounded_string($v['url']??null,'URL',8192);$u=parse_url($url);
        if(!$u||!in_array($u['scheme']??'',['http','https'],true)||empty($u['host'])||isset($u['user'])||isset($u['query'])||isset($u['fragment']))fail('URL anchor needs a bare HTTP(S) URL.');
        if(!in_array($v['queryMode']??'',['ignore','selected','all'],true)||!in_array($v['fragmentMode']??'',['ignore','include'],true)||!is_array($v['queryParameters']??null))fail('Invalid URL matching options.');
        $pairs=[];foreach($v['queryParameters'] as $p){if(!is_array($p)||!is_string($p['key']??null)||!is_string($p['value']??null)||!is_bool($p['include']??null))fail('Invalid URL query pair.');if($v['queryMode']==='all'||($v['queryMode']==='selected'&&$p['include']))$pairs[]=$p['key']."\0".$p['value'];}
        $ku=parse_url(substr($key,4));if(!$ku||($ku['scheme']??'')!==$u['scheme']||($ku['host']??'')!==$u['host']||($ku['port']??null)!==($u['port']??null)||($ku['path']??'/')!==($u['path']??'/'))fail('URL key does not match target.');
        $actual=[];if(isset($ku['query'])&&$ku['query']!=='')foreach(explode('&',$ku['query']) as $pair){$parts=explode('=',$pair,2);$actual[]=urldecode($parts[0])."\0".urldecode($parts[1]??'');}sort($actual);sort($pairs);if($actual!==$pairs)fail('URL key query mismatch.');
        if(($ku['fragment']??'')!==($v['fragmentMode']==='include'?($v['fragment']??''):''))fail('URL fragment key mismatch.');
    }elseif($kind==='gps'){
        foreach(['latitude'=>90,'longitude'=>180] as $n=>$limit)if(!isset($v[$n])||(!is_int($v[$n])&&!is_float($v[$n]))||abs($v[$n])>$limit)fail('Invalid GPS coordinates.');
        if(isset($v['radiusMeters'])&&((!is_int($v['radiusMeters'])&&!is_float($v['radiusMeters']))||$v['radiusMeters']<=0))fail('Invalid GPS radius.');
        if(!preg_match('/^gps:([^,@]+),([^@]+)(?:@(.+))?$/D',$key,$m)||!quantized_component($m[1],$v['latitude'],6)||!quantized_component($m[2],$v['longitude'],6)||isset($m[3])!==isset($v['radiusMeters'])||(isset($m[3])&&(!is_numeric($m[3])||(float)$m[3]!=(float)$v['radiusMeters'])))fail('GPS key mismatch.');
    }elseif($kind==='youtube'){
        if(!is_string($v['videoId']??null)||!preg_match('/^[A-Za-z0-9_-]{1,128}$/',$v['videoId']))fail('Invalid video ID.');
        foreach(['startSeconds','endSeconds'] as $n)if(isset($v[$n])&&((!is_int($v[$n])&&!is_float($v[$n]))||$v[$n]<0))fail('Invalid video time.');
        if(isset($v['endSeconds'])&&(!isset($v['startSeconds'])||$v['endSeconds']<$v['startSeconds']))fail('Invalid video range.');
        $u=parse_url($v['videoUrl']??'');if(!$u||!in_array($u['scheme']??'',['http','https'],true)||!preg_match('/(^|\.)youtube\.com$/',$u['host']??''))fail('Invalid video URL.');parse_str($u['query']??'',$q);if(($q['v']??'')!==$v['videoId'])fail('Video ID/URL mismatch.');
        $prefix='youtube:'.$v['videoId'];if(!isset($v['startSeconds'])){if($key!==$prefix)fail('Video key mismatch.');}
        elseif(!str_starts_with($key,$prefix.'@')||!preg_match('/^(\d+\.\d{3})(?:-(\d+\.\d{3}))?$/D',substr($key,strlen($prefix)+1),$m)||!quantized_component($m[1],$v['startSeconds'],3)||isset($m[2])!==isset($v['endSeconds'])||(isset($m[2])&&!quantized_component($m[2],$v['endSeconds'],3)))fail('Video key mismatch.');
    }elseif($kind==='time'){
        $timestamp=$v['timestamp']??null;$start=$v['startTime']??null;$end=$v['endTime']??null;
        $iso=function($value): bool {
            if(!is_string($value)||!preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/D',$value))return false;
            try{$d=new DateTimeImmutable($value);return $d->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s.v\Z')===$value;}catch(Throwable){return false;}
        };
        if($timestamp!==null){
            if(!$iso($timestamp)||$start!==null||$end!==null||$key!=='time:'.$timestamp)fail('Invalid time target.');
        }else{
            if(!$iso($start)||!$iso($end)||strtotime($end)<=strtotime($start)||$key!=='time:'.$start.'/'.$end)fail('Invalid timeframe target.');
        }
    }elseif($kind==='custom'){
        $s=null;foreach(schema_catalog() as $entry)if($entry['$id']===($t['schemaId']??null))$s=$entry;if(!$s)fail('Custom target schema is not installed.');$s=normalize_schema($s);
        foreach($s['required']??[] as $n)if(!isset($v[$n])||$v[$n]==='')fail($n.' is required.');
        foreach($v as $n=>$value){if(!isset($s['properties'][$n])){if(($s['additionalProperties']??true)===false)fail('Unknown target property.');}else validate_field($s['properties'][$n],$value,$n);}
        $prefix='custom:'.$t['schemaId'].':';if(!str_starts_with($key,$prefix))fail('Custom key schema mismatch.');$kv=json_decode(substr($key,strlen($prefix)),true);if($kv!=$v)fail('Custom key value mismatch.');
    }else fail('Unsupported target kind.');
}
function validate_annotation(array &$p): void {
    record_id($p,'annotation');
    if(($p['recordType']??'')!=='Context.Annotation'||($p['schemaVersion']??0)!==2)fail('Expected Context.Annotation v2.');
    bounded_string($p['body']??null,'Comment',80000);bounded_string($p['highlightedText']??'','Quote',80000,false);bounded_string($p['author']??'Local user','Author',200);
    $key=bounded_string($p['targetKey']??null,'Target key',16000);if(!is_array($p['target']??null))fail('Target required.');validate_target($p['target'],$key);
    if(isset($p['parentAnnotationId']))bounded_string($p['parentAnnotationId'],'Parent ID',512);
    if(!is_array($p['attachments']??null)||!array_is_list($p['attachments'])||count($p['attachments'])>3)fail('At most three attachments.');
    foreach($p['attachments'] as $a){if(!is_array($a))fail('Invalid attachment.');bounded_string($a['id']??null,'Attachment ID',512);}
    $p['createdAt']=timestamp($p['createdAt']??gmdate('c'));$p['updatedAt']=timestamp($p['updatedAt']??gmdate('c'));$p['syncState']='synced';unset($p['syncError'],$p['syncBase']);
}
