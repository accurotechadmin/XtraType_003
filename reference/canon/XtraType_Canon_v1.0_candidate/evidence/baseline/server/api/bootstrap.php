<?php
declare(strict_types=1);

$config = require __DIR__ . '/../config.php';
const DATA_DIR = __DIR__ . '/../data';
const MEDIA_DIR = __DIR__ . '/../media';
const SCHEMA_DIR = __DIR__ . '/../schemas';

function cors(): void {
    global $config;
    header('Access-Control-Allow-Origin: ' . ($config['cors_origin'] ?? '*'));
    header('Access-Control-Allow-Headers: Content-Type, X-XtraType-Client');
    header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
    header('Cache-Control: no-store');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
}

function respond($data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $status = 400, string $code = 'invalidRequest'): never {
    respond(['ok' => false, 'error' => $code, 'message' => $message], $status);
}

function ensure_dirs(): void {
    foreach ([DATA_DIR, MEDIA_DIR] as $dir) if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) fail('Storage directory unavailable.', 500, 'storageUnavailable');
}

function collection_path(string $name): string {
    if (!preg_match('/^[a-z0-9_-]+$/', $name)) fail('Invalid collection.', 500);
    return DATA_DIR . '/' . $name . '.json';
}

function read_collection(string $name): array {
    ensure_dirs();
    $path = collection_path($name);
    if (!is_file($path)) return [];
    $raw = file_get_contents($path);
    if ($raw === false || trim($raw) === '') return [];
    $value = json_decode($raw, true);
    return is_array($value) ? $value : [];
}

function write_collection(string $name, array $items): void {
    ensure_dirs();
    $path = collection_path($name);
    $lockPath = $path . '.lock';
    $lock = fopen($lockPath, 'c');
    if (!$lock || !flock($lock, LOCK_EX)) fail('Could not lock data store.', 500, 'storageLockFailed');
    $tmp = $path . '.tmp.' . bin2hex(random_bytes(4));
    $json = json_encode(array_values($items), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($json === false || file_put_contents($tmp, $json) === false || !rename($tmp, $path)) {
        @unlink($tmp); flock($lock, LOCK_UN); fclose($lock); fail('Could not write data store.', 500, 'storageWriteFailed');
    }
    flock($lock, LOCK_UN); fclose($lock);
}

function mutate_collection(string $name, callable $mutator) {
    ensure_dirs();
    $path = collection_path($name);
    $lockPath = $path . '.lock';
    $lock = fopen($lockPath, 'c');
    if (!$lock || !flock($lock, LOCK_EX)) fail('Could not lock data store.', 500, 'storageLockFailed');
    $raw = is_file($path) ? file_get_contents($path) : '[]';
    $items = json_decode($raw ?: '[]', true);
    if (!is_array($items)) $items = [];
    [$next, $result] = $mutator($items);
    $tmp = $path . '.tmp.' . bin2hex(random_bytes(4));
    $json = json_encode(array_values($next), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($json === false || file_put_contents($tmp, $json) === false || !rename($tmp, $path)) {
        @unlink($tmp); flock($lock, LOCK_UN); fclose($lock); fail('Could not write data store.', 500, 'storageWriteFailed');
    }
    flock($lock, LOCK_UN); fclose($lock);
    return $result;
}

function upsert_item(string $collection, array $item): array {
    if (empty($item['id']) || !is_string($item['id'])) fail('Record id is required.');
    return mutate_collection($collection, function(array $items) use ($item) {
        $found = false;
        foreach ($items as $i => $existing) {
            if (($existing['id'] ?? null) === $item['id']) { $items[$i] = $item; $found = true; break; }
        }
        if (!$found) $items[] = $item;
        return [$items, $item];
    });
}

function delete_item(string $collection, string $id): bool {
    return mutate_collection($collection, function(array $items) use ($id) {
        $before = count($items);
        $next = array_values(array_filter($items, fn($x) => ($x['id'] ?? null) !== $id));
        return [$next, count($next) !== $before];
    });
}

function json_body(): array {
    $raw = file_get_contents('php://input');
    $value = json_decode($raw ?: '{}', true);
    if (!is_array($value)) fail('Request body must be JSON.');
    return $value;
}

function uuid_like(string $prefix): string { return $prefix . ':' . bin2hex(random_bytes(16)); }

function sanitize_filename(string $name): string {
    $name = preg_replace('/[^A-Za-z0-9._-]+/', '-', basename($name));
    return trim((string)$name, '-.') ?: 'upload';
}

function save_uploaded_images(array $files): array {
    global $config;
    $saved = [];
    $count = 0;
    foreach ($files as $file) {
        if ($count >= ($config['max_images'] ?? 3)) fail('At most three images are allowed.');
        if (!isset($file['error']) || $file['error'] === UPLOAD_ERR_NO_FILE) continue;
        if ($file['error'] !== UPLOAD_ERR_OK) fail('Image upload failed.');
        if (($file['size'] ?? 0) > ($config['max_image_bytes'] ?? 8388608)) fail('Each image must be 8 MiB or smaller.');
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);
        $exts = ['image/png'=>'png', 'image/jpeg'=>'jpg', 'image/webp'=>'webp'];
        if (!isset($exts[$mime])) fail('Only PNG, JPEG and WebP images are allowed.');
        $month = gmdate('Y-m');
        $dir = MEDIA_DIR . '/' . $month;
        if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) fail('Could not create media directory.', 500);
        $id = uuid_like('media');
        $diskName = str_replace(':', '-', $id) . '.' . $exts[$mime];
        $dest = $dir . '/' . $diskName;
        if (!move_uploaded_file($file['tmp_name'], $dest)) fail('Could not store upload.', 500);
        $saved[] = [
            'id'=>$id, 'name'=>sanitize_filename($file['name'] ?? $diskName), 'type'=>$mime,
            'size'=>(int)$file['size'], 'url'=>'/media/' . $month . '/' . $diskName
        ];
        $count++;
    }
    return $saved;
}

function flattened_uploads(): array {
    $out = [];
    foreach ($_FILES as $file) {
        if (is_array($file['name'] ?? null)) {
            foreach ($file['name'] as $i => $name) $out[] = ['name'=>$name,'type'=>$file['type'][$i] ?? '', 'tmp_name'=>$file['tmp_name'][$i] ?? '', 'error'=>$file['error'][$i] ?? UPLOAD_ERR_NO_FILE, 'size'=>$file['size'][$i] ?? 0];
        } else $out[] = $file;
    }
    return $out;
}

cors();
ensure_dirs();
