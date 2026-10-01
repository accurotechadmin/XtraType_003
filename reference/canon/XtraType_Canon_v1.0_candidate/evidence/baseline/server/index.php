<?php $config = require __DIR__ . '/config.php'; ?>
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#172033"><title>XtraType</title><link rel="stylesheet" href="assets/style.css"></head>
<body>
<header><div class="brand"><span>XT</span><div><strong>XtraType</strong><small>PortaShape context surface</small></div></div><button id="locate">Use location</button></header>
<nav><button data-tab="post" class="active">Post</button><button data-tab="nearby">Nearby</button><button data-tab="feed">All context</button><button data-tab="schemas">Schemas</button></nav>
<main>
<section id="tab-post" class="tab active">
<form id="post-form" class="card">
<div class="title"><b>Attach context</b><span class="pill">server + mobile</span></div>
<label>Attach to<select id="target-kind"></select></label><div id="target-fields"></div>
<label>Highlighted / quoted text<textarea id="highlighted" rows="2" maxlength="10000"></textarea></label>
<label>Comment<textarea id="body" rows="5" maxlength="20000" required></textarea></label>
<label class="file">Add up to 3 images<input id="images" type="file" accept="image/png,image/jpeg,image/webp" multiple hidden></label><div id="previews"></div>
<button class="primary" type="submit">Post annotation</button><p id="post-status" class="status"></p>
</form></section>
<section id="tab-nearby" class="tab"><div class="card"><div class="title"><b>Nearby GPS context</b><span id="location-state" class="pill">location needed</span></div><p class="muted">Annotations appear here when your browser position is inside their radius. Bare coordinates use the default <?= (int)$config['default_gps_radius_meters'] ?> m gate.</p><div id="nearby-list" class="feed"></div></div></section>
<section id="tab-feed" class="tab"><div class="card"><div class="title"><b>All context</b><button id="refresh">Refresh</button></div><div id="feed" class="feed"></div></div></section>
<section id="tab-schemas" class="tab"><div class="card"><div class="title"><b>Structured anchor schemas</b><span class="pill">JSON</span></div><p class="muted">Install object-style JSON Schemas to make new target types available alongside URL, GPS and YouTube.</p><label class="file">Install JSON schema<input id="schema-file" type="file" accept=".json,application/json" hidden></label><p id="schema-status" class="status"></p><div id="schemas"></div></div></section>
</main><script>window.XT_CONFIG={defaultGpsRadius:<?= (int)$config['default_gps_radius_meters'] ?>};</script><script type="module" src="assets/app.js"></script></body></html>
