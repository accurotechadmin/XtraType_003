<?php
require __DIR__ . '/bootstrap.php';

function builtins(): array {
    $out=[];
    foreach (glob(SCHEMA_DIR . '/*.schema.json') ?: [] as $path) {
        $value=json_decode(file_get_contents($path) ?: '{}', true);
        if (is_array($value) && !empty($value['$id'])) $out[]=$value;
    }
    return $out;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $byId=[];
    foreach (array_merge(builtins(), read_collection('schemas')) as $entry) { $schema = isset($entry['schema']) && is_array($entry['schema']) ? $entry['schema'] : $entry; if (!empty($schema['$id'])) $byId[$schema['$id']]=$schema; }
    respond(['ok'=>true,'items'=>array_values($byId)]);
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body=json_body();
    $schema=$body['schema'] ?? $body;
    if (!is_array($schema) || empty($schema['$id']) || ($schema['type'] ?? '') !== 'object' || !is_array($schema['properties'] ?? null)) fail('Schema must have $id, type: object, and properties.');
    if (str_starts_with((string)$schema['$id'], 'xtratype.anchor.')) fail('Built-in XtraType schema ids cannot be replaced.');
    $record=['id'=>(string)$schema['$id'], '$id'=>$schema['$id'], 'schema'=>$schema, 'updatedAt'=>gmdate('c')];
    upsert_item('schemas',$record);
    respond(['ok'=>true,'schema'=>$schema],201);
}
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id=$_GET['id'] ?? '';
    if ($id==='') fail('id is required.');
    respond(['ok'=>true,'deleted'=>delete_item('schemas',$id)]);
}
fail('Method not allowed.',405,'methodNotAllowed');
