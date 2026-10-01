<?php
require dirname(__DIR__).'/src/server/Repository.php';
$r=new JsonRepository($argv[1]);
$r->mutate('events',function($rows)use($argv){usleep(2000);$rows[]=['id'=>$argv[2]];return [$rows,null];});
