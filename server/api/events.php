<?php
require __DIR__.'/bootstrap.php';
$authUser=require_api_user_if_initialized();
if($_SERVER['REQUEST_METHOD']==='GET')respond(['ok'=>true,'items'=>read_collection('events')]);
if($_SERVER['REQUEST_METHOD']==='POST'){$p=json_body();record_id($p,'event');bounded_string($p['type']??null,'Event type',200);$p['occurredAt']=timestamp($p['occurredAt']??gmdate('c'));if(strlen(json_encode($p))>262144)fail('Event too large.');respond(['ok'=>true,'item'=>upsert_item('events',$p)],201);}fail('Method not allowed.',405);
