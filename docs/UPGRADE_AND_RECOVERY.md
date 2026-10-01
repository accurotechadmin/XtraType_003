# Upgrade, rollback and recovery

1. Stop writes and the old server. Close Chrome fully before copying a profile.
2. Back up the entire old server directory, including JSON and media, and the relevant Chrome profile using your OS backup method. The metadata export alone cannot restore IndexedDB blobs.
3. Test this release against copies. Copy old `server/data/*.json` to `var/data/` and old `server/media/` into `var/media/`. Do not merge records manually or overwrite populated files with shipped empty arrays.
4. Keep the installed extension's existing unpacked path when replacing source, or otherwise preserve its extension identity. Removing/reinstalling under a different ID loses access to the old origin's IndexedDB. Replace extension files at the old path and use Reload in chrome://extensions. Keep the old source backup.
5. Verify health, local notes and images offline, each target family, server sync, one reply, and visible/full capture. Review errors before continuing normal use.
6. Rollback: stop both clients/server. Restore the complete backed-up server JSON/media and Chrome profile together, then restore the old extension source. Do not run both versions against live data while troubleshooting.

A corrupt JSON collection is never reset automatically. Stop the server, preserve the bad file for diagnosis, and restore a verified backup. Empty/truncated JSON is corruption; a legitimate empty collection is `[]`. Health checks decode all four collections and report failure.

If a sync failed, the client keeps the local record and image references. Fix the server/network and choose Sync now. If an image Blob is actually missing, keep the record and inspect backups; metadata cannot recreate image bytes. Existing v2.3 lost Blob links may require manual recovery from a backed-up profile. New fixes do not repair irretrievably missing data.

Uploaded orphan media is not automatically deleted. To inspect storage, stop writes, copy JSON/media, and compare references offline. Avoid deleting files just because a current client does not display them. Server DELETE endpoints remain available for compatibility, but no distributed tombstones are created; an offline client can re-upload a deleted record.

`XTRATYPE_DATA_DIR` and `XTRATYPE_MEDIA_DIR` can set absolute private storage paths. Keep both outside the public web root. `XTRATYPE_ALLOWED_HOSTS`, `XTRATYPE_ALLOWED_ORIGINS`, and `XTRATYPE_EXTENSION_IDS` are comma-separated configuration values. Broader reachability requires a separate security review; these options do not implement accounts.

For Apache, enable rewrite support and honor server/.htaccess. For other hosts, route only the five API endpoints, index, assets/schemas and validated media; deny config/bootstrap and directory listing. The supplied PHP built-in launcher/router is the tested reference. Its built-in server is for local use; it is not a public production hosting recommendation.
