<?php
require __DIR__ . '/bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $items=read_collection('snapshots');
    if (!empty($_GET['pageKey'])) $items=array_values(array_filter($items, fn($x)=>($x['pageKey']??'')===$_GET['pageKey']));
    usort($items, fn($a,$b)=>strcmp($b['capturedAt']??'', $a['capturedAt']??''));
    respond(['ok'=>true,'items'=>$items]);
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $contentType=$_SERVER['CONTENT_TYPE'] ?? '';
    if (str_starts_with($contentType,'multipart/form-data')) {
        $payload=json_decode($_POST['payload']??'{}',true);
        if (!is_array($payload)) fail('Invalid payload.');
        $files=save_uploaded_images(flattened_uploads());
        if ($files) $payload['screenshot']=$files[0];
    } else $payload=json_body();
    if (empty($payload['id'])) $payload['id']=uuid_like('snapshot');
    $payload['recordType']='Revision.Snapshot';
    $payload['capturedAt']=$payload['capturedAt']??gmdate('c');
    respond(['ok'=>true,'item'=>upsert_item('snapshots',$payload)],201);
}
fail('Method not allowed.',405,'methodNotAllowed');
