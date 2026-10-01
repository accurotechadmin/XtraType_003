<?php
declare(strict_types=1);

/** The only persistence interface consumed by the HTTP layer.
 * A future SQL adapter must preserve atomic mutate(), ID semantics and errors.
 */
interface Repository {
    public function read(string $collection): array;
    public function mutate(string $collection, callable $mutator): mixed;
}
final class JsonRepository implements Repository {
    public function __construct(private string $directory) {
        if (!is_dir($directory) && !mkdir($directory,0700,true) && !is_dir($directory)) throw new RuntimeException('Storage directory unavailable.');
    }
    private function path(string $name): string {
        if (!in_array($name,['annotations','schemas','snapshots','events','users','sessions','invites','system_settings','direct_messages','group_chats','group_messages'],true)) throw new InvalidArgumentException('Unknown collection.');
        return $this->directory.'/'.$name.'.json';
    }
    private function decode(string $path): array {
        if (!is_file($path)) return [];
        $raw=file_get_contents($path);
        if ($raw===false) throw new RuntimeException('Cannot read collection.');
        try { $data=json_decode($raw,true,64,JSON_THROW_ON_ERROR); }
        catch (JsonException $e) { throw new RuntimeException('Corrupt collection; restore a known-good backup. No overwrite performed.',0,$e); }
        if (!str_starts_with(ltrim($raw),'[')||!is_array($data)||!array_is_list($data)) throw new RuntimeException('Collection must be a JSON array. No overwrite performed.');
        $ids=[];
        foreach ($data as $row) {
            if(!is_array($row)||!isset($row['id'])||!is_string($row['id'])||isset($ids[$row['id']])) throw new RuntimeException('Invalid or duplicate record in collection. No overwrite performed.');
            $ids[$row['id']]=true;
        }
        return $data;
    }
    public function read(string $collection): array {
        $path=$this->path($collection);$lock=fopen($path.'.lock','c');
        if(!$lock||!flock($lock,LOCK_SH))throw new RuntimeException('Cannot lock collection.');
        try{return $this->decode($path);}finally{flock($lock,LOCK_UN);fclose($lock);}
    }
    public function mutate(string $collection,callable $mutator): mixed {
        $path=$this->path($collection);$lock=fopen($path.'.lock','c');$tmp=null;
        if(!$lock||!flock($lock,LOCK_EX))throw new RuntimeException('Cannot lock collection.');
        try {
            [$next,$result]=$mutator($this->decode($path));
            $json=json_encode(array_values($next),JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR)."\n";
            $tmp=$path.'.tmp.'.bin2hex(random_bytes(8));$handle=fopen($tmp,'xb');
            if(!$handle)throw new RuntimeException('Cannot stage collection.');
            try {
                $offset=0;while($offset<strlen($json)){$n=fwrite($handle,substr($json,$offset));if($n===false||$n===0)throw new RuntimeException('Incomplete collection write.');$offset+=$n;}
                if(!fflush($handle))throw new RuntimeException('Cannot flush collection.');
                if(function_exists('fsync')&&!fsync($handle))throw new RuntimeException('Cannot sync collection.');
            } finally {fclose($handle);}
            chmod($tmp,0600);
            if(!rename($tmp,$path))throw new RuntimeException('Cannot replace collection atomically. Original retained.');
            return $result;
        } finally {if($tmp&&is_file($tmp))unlink($tmp);flock($lock,LOCK_UN);fclose($lock);}
    }
}
