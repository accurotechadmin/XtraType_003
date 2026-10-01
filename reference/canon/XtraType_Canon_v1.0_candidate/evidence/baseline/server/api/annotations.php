<?php
require __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    $items = read_collection('annotations');
    if (!empty($_GET['id'])) {
        foreach ($items as $item) if (($item['id'] ?? '') === $_GET['id']) respond(['ok'=>true,'item'=>$item]);
        fail('Annotation not found.', 404, 'notFound');
    }
    if (!empty($_GET['videoId'])) $items = array_values(array_filter($items, fn($x) => (($x['target']['kind'] ?? '') === 'youtube' && ($x['target']['value']['videoId'] ?? '') === $_GET['videoId'])));
    if (!empty($_GET['targetKey'])) $items = array_values(array_filter($items, fn($x) => ($x['targetKey'] ?? '') === $_GET['targetKey']));
    usort($items, fn($a,$b) => strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? ''));
    respond(['ok'=>true,'items'=>$items]);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if ($id === '') fail('id is required.');
    respond(['ok'=>true,'deleted'=>delete_item('annotations',$id)]);
}

if ($method === 'POST') {
    $payload = [];
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (str_starts_with($contentType, 'multipart/form-data')) {
        $payload = json_decode($_POST['payload'] ?? '{}', true);
        if (!is_array($payload)) fail('Invalid payload JSON.');
        $newFiles = save_uploaded_images(flattened_uploads());
        $payload['attachments'] = array_values(array_merge($payload['attachments'] ?? [], $newFiles));
        if (count($payload['attachments']) > ($config['max_images'] ?? 3)) fail('At most three images are allowed.');
    } else $payload = json_body();
    if (empty($payload['id'])) $payload['id'] = uuid_like('annotation');
    if (($payload['recordType'] ?? '') !== 'Context.Annotation') $payload['recordType'] = 'Context.Annotation';
    $payload['schemaVersion'] = 2;
    if (empty($payload['target']) || !is_array($payload['target'])) fail('Annotation target is required.');
    if (!isset($payload['body']) || !is_string($payload['body']) || trim($payload['body']) === '') fail('Comment text is required.');
    if (strlen($payload['body']) > 80000) fail('Comment is too long.');
    $now = gmdate('c');
    $payload['createdAt'] = $payload['createdAt'] ?? $now;
    $payload['updatedAt'] = $now;
    $payload['syncState'] = 'synced';
    $item = upsert_item('annotations', $payload);
    respond(['ok'=>true,'item'=>$item], 201);
}

fail('Method not allowed.', 405, 'methodNotAllowed');
