<?php
// Local-default deployment. XtraType 2.5 includes a bounded account/ACL layer; public-network deployment is not certified.
return [
 'data_dir'=>getenv('XTRATYPE_DATA_DIR') ?: dirname(__DIR__).'/var/data',
 'media_dir'=>getenv('XTRATYPE_MEDIA_DIR') ?: dirname(__DIR__).'/var/media',
 'profile_dir'=>getenv('XTRATYPE_PROFILE_DIR') ?: dirname(__DIR__).'/var/profiles',
 'allowed_hosts'=>array_filter(explode(',',getenv('XTRATYPE_ALLOWED_HOSTS') ?: 'localhost,127.0.0.1,[::1]')),
 'allowed_origins'=>array_filter(explode(',',getenv('XTRATYPE_ALLOWED_ORIGINS') ?: 'http://localhost:8787,http://127.0.0.1:8787')),
 'extension_ids'=>array_filter(explode(',',getenv('XTRATYPE_EXTENSION_IDS') ?: '')),
 'max_images'=>3,'max_image_bytes'=>8388608,'max_request_bytes'=>33554432,
 'default_gps_radius_meters'=>75,
];
