<?php
require __DIR__.'/bootstrap.php';
if($_SERVER['REQUEST_METHOD']!=='GET')fail('Method not allowed.',405);
foreach(['annotations','schemas','snapshots','events','users','sessions','invites','system_settings','direct_messages','group_chats','group_messages'] as $name)read_collection($name);
respond(['ok'=>true,'service'=>'XtraType','version'=>'2.5.0','storage'=>'json','time'=>gmdate('c')]);
