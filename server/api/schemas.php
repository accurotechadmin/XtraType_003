<?php
require __DIR__.'/bootstrap.php';
$authUser=require_api_user_if_initialized();
if($_SERVER['REQUEST_METHOD']==='GET')respond(['ok'=>true,'items'=>schema_catalog()]);
if($_SERVER['REQUEST_METHOD']==='POST'){$body=json_body();$s=normalize_schema($body['schema']??$body);upsert_item('schemas',['id'=>$s['$id'],'$id'=>$s['$id'],'schema'=>$s,'updatedAt'=>gmdate('c')]);respond(['ok'=>true,'schema'=>$s],201);}
if($_SERVER['REQUEST_METHOD']==='DELETE'){$id=bounded_string($_GET['id']??null,'id',512);if(str_starts_with($id,'xtratype.anchor.'))fail('Built-ins cannot be deleted.');respond(['ok'=>true,'deleted'=>delete_item('schemas',$id)]);}
fail('Method not allowed.',405);
