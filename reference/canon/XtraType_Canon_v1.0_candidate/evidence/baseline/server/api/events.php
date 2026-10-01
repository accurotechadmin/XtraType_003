<?php
require __DIR__ . '/bootstrap.php';
if ($_SERVER['REQUEST_METHOD']==='GET') respond(['ok'=>true,'items'=>read_collection('events')]);
if ($_SERVER['REQUEST_METHOD']==='POST') {
    $event=json_body();
    $event['id']=$event['id']??uuid_like('event');
    $event['occurredAt']=$event['occurredAt']??gmdate('c');
    respond(['ok'=>true,'item'=>upsert_item('events',$event)],201);
}
fail('Method not allowed.',405,'methodNotAllowed');
