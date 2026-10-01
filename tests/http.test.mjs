import test from "node:test";
import http from "node:http";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, readFile, writeFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseUrlTarget,
  targetKey,
  makeGpsTarget,
  makeYoutubeTarget,
  makeTimeTarget,
} from "../ext/core/anchors.js";
const root = resolve(fileURLToPath(new URL("..", import.meta.url))),
  php = process.env.PHP_BIN || "php";
const phpArgs = process.env.PHP_FILEINFO_EXTENSION
  ? ["-n", "-d", `extension=${process.env.PHP_FILEINFO_EXTENSION}`]
  : [];
const available = spawnSync(php, [...phpArgs, "-v"]).status === 0;
test(
  "PHP HTTP and JSON repository integration",
  { skip: !available },
  async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "xtratype-http-")),
      port = 19000 + Math.floor(Math.random() * 10000),
      base = `http://127.0.0.1:${port}`;
    const proc = spawn(
      php,
      [
        ...phpArgs,
        "-d",
        "display_errors=0",
        "-d",
        "upload_max_filesize=8M",
        "-d",
        "post_max_size=32M",
        "-S",
        `127.0.0.1:${port}`,
        "-t",
        join(root, "server"),
        join(root, "server/router.php"),
      ],
      {
        env: {
          ...process.env,
          XTRATYPE_DATA_DIR: join(dir, "data"),
          XTRATYPE_MEDIA_DIR: join(dir, "media"),
          XTRATYPE_PROFILE_DIR: join(dir, "profiles"),
        },
        stdio: ["ignore", "ignore", "pipe"],
      },
    );
    let errors = "";
    proc.stderr.on("data", (b) => (errors += b));
    const req = async (path, body, options = {}) => {
      const r = await fetch(base + "/api/" + path, {
        ...(body
          ? {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-XtraType-Client": "test",
              },
              body: JSON.stringify(body),
            }
          : {}),
        ...options,
      });
      return { status: r.status, data: await r.json() };
    };
    const note = (id, target = parseUrlTarget("https://example.com/a")) => ({
      id,
      recordType: "Context.Annotation",
      schemaVersion: 2,
      target,
      targetKey: targetKey(target),
      body: "hello",
      highlightedText: "",
      attachments: [],
      author: "Test",
      parentAnnotationId: null,
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
    });
    try {
      let ready = false;
      for (let i = 0; i < 80; i++) {
        try {
          if ((await req("health.php")).status === 200) {
            ready = true;
            break;
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 50));
      }
      assert.ok(ready, errors);
      await t.test(
        "retained URL/GPS/Time/YouTube/custom routes and key contracts",
        async () => {
          for (const [id, target] of [
            ["url", parseUrlTarget("https://example.com/a")],
            ["gps", makeGpsTarget(41.88, -87.63, 75)],
            ["gps-round", makeGpsTarget(-0.0000001, 1.2345675, 1e-7)],
            [
              "yt-round",
              makeYoutubeTarget(
                "https://youtube.com/watch?v=round",
                1.2345,
                1.0625 + 1,
              ),
            ],
            ["yt", makeYoutubeTarget("https://youtube.com/watch?v=abc", 0, 4)],
            ["time", makeTimeTarget("2026-10-01T12:00:00Z")],
            [
              "time-range",
              makeTimeTarget(
                null,
                "2026-10-01T12:00:00Z",
                "2026-10-01T13:00:00Z",
              ),
            ],
          ])
            assert.equal(
              (await req("annotations.php", note(id, target))).status,
              201,
            );
          const custom = {
            kind: "custom",
            schemaId: "example.anchor.book@1",
            value: { isbn: "978-x", page: 2 },
          };
          assert.equal(
            (await req("annotations.php", note("book", custom))).status,
            201,
          );
          const t = parseUrlTarget("https://example.com/a?x=1&x=2#part");
          t.value.queryMode = "all";
          t.value.fragmentMode = "include";
          assert.equal(
            (await req("annotations.php", note("query", t))).status,
            201,
          );
          assert.equal(
            (await req("annotations.php?videoId=abc")).data.items.length,
            1,
          );
          assert.equal(
            (await req("annotations.php?id=book")).data.item.target.value.page,
            2,
          );
        },
      );
      await t.test(
        "invalid inputs, wrong key, reserved kinds and unsupported schema rejected",
        async () => {
          assert.equal(
            (await req("annotations.php", { ...note("bad"), body: "" })).status,
            400,
          );
          assert.equal(
            (
              await req("annotations.php", {
                ...note("bad"),
                targetKey: "url:https://other.test/",
              })
            ).status,
            400,
          );
          assert.equal(
            (
              await req("schemas.php", {
                schema: {
                  $id: "bad",
                  type: "object",
                  properties: {},
                  "x-xtratype": { kind: "gps" },
                },
              })
            ).status,
            400,
          );
          assert.equal(
            (
              await req("schemas.php", {
                schema: {
                  $id: "bad",
                  type: "object",
                  properties: {},
                  allOf: [],
                },
              })
            ).status,
            400,
          );
        },
      );
      await t.test(
        "malformed JSON, CSRF origin, missing client header, DNS host rejection",
        async () => {
          assert.equal(
            (
              await req("annotations.php", null, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-XtraType-Client": "test",
                },
                body: "{",
              })
            ).status,
            400,
          );
          assert.equal(
            (
              await req("annotations.php", note("origin"), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-XtraType-Client": "test",
                  Origin: "https://evil.test",
                },
                body: JSON.stringify(note("origin")),
              })
            ).status,
            403,
          );
          assert.equal(
            (
              await req("annotations.php", null, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(note("csrf")),
              })
            ).status,
            403,
          );
          const hostStatus = await new Promise((resolve, reject) => {
            const r = http.get(
              base + "/api/health.php",
              { headers: { Host: "attacker.test" } },
              (res) => {
                res.resume();
                resolve(res.statusCode);
              },
            );
            r.on("error", reject);
          });
          assert.equal(hostStatus, 403);
        },
      );
      await t.test(
        "image upload, stable retry, valid media delivery and no raw data exposure",
        async () => {
          const png = Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=",
            "base64",
          );
          const upload = async () => {
            const p = note("image");
            p.attachments = [
              {
                id: "attachment:stable",
                upload: true,
                name: "a.png",
                type: "image/png",
                size: png.length,
              },
            ];
            const f = new FormData();
            f.set("payload", JSON.stringify(p));
            f.set("images[]", new Blob([png], { type: "image/png" }), "a.png");
            return req("annotations.php", null, {
              method: "POST",
              headers: { "X-XtraType-Client": "test" },
              body: f,
            });
          };
          const first = await upload();
          assert.equal(first.status, 201, JSON.stringify(first.data));
          assert.equal(first.data.item.attachments[0].id, "attachment:stable");
          assert.equal(
            (await upload()).data.item.attachments[0].url,
            first.data.item.attachments[0].url,
          );
          assert.equal((await readdir(join(dir, "media"))).length, 1);
          assert.equal(
            (await fetch(base + first.data.item.attachments[0].url)).status,
            200,
          );
          for (const path of [
            "/data/annotations.json",
            "/config.php",
            "/api/bootstrap.php",
            "/../var/data/annotations.json",
          ])
            assert.equal((await fetch(base + path)).status, 404);
          const snap = {
            id: "snap",
            recordType: "Revision.Snapshot",
            schemaVersion: 1,
            url: "https://example.com/a",
            pageKey: "url:https://example.com/a",
            mode: "visible",
            renderedHtml: "<p>hello</p>",
            renderedText: "hello",
            capturedAt: "2026-10-01T00:00:00.000Z",
            screenshot: first.data.item.attachments[0],
          };
          assert.equal((await req("snapshots.php", snap)).status, 201);
          assert.equal(
            (
              await req(
                "snapshots.php?pageKey=url%3Ahttps%3A%2F%2Fexample.com%2Fa",
              )
            ).data.items.length,
            1,
          );
        },
      );
      await t.test(
        "concurrent requests retain all records; events and deletion retained",
        async () => {
          await Promise.all(
            Array.from({ length: 20 }, (_, i) =>
              req("annotations.php", note("parallel:" + i)),
            ),
          );
          assert.equal(
            (await req("annotations.php")).data.items.filter((x) =>
              x.id.startsWith("parallel:"),
            ).length,
            20,
          );
          assert.equal(
            (
              await req("events.php", {
                id: "event:x",
                type: "test",
                data: {},
                occurredAt: "2026-10-01T00:00:00.000Z",
              })
            ).status,
            201,
          );
          assert.equal((await req("events.php")).data.items.length, 1);
          assert.equal(
            (
              await req("annotations.php?id=parallel%3A0", null, {
                method: "DELETE",
                headers: { "X-XtraType-Client": "test" },
              })
            ).data.deleted,
            true,
          );
        },
      );
      await t.test(
        "invitation accounts, profile payloads, messaging, group chat access and admin controls",
        async () => {
          const api = async (path, body = null, token = null, method = body ? "POST" : "GET") => {
            const headers = { "X-XtraType-Client": "test" };
            if (body !== null) headers["Content-Type"] = "application/json";
            if (token) headers.Authorization = `Bearer ${token}`;
            const r = await fetch(base + "/api/" + path, {
              method,
              headers,
              ...(body !== null ? { body: JSON.stringify(body) } : {}),
            });
            return { status: r.status, data: await r.json() };
          };
          const first = await api("auth.php", {
            action: "register",
            username: "seed-admin",
            displayName: "Seed Admin",
            password: "correct-horse-1",
          });
          assert.equal(first.status, 201, JSON.stringify(first.data));
          assert.equal(first.data.firstAdmin, true);
          assert.equal(first.data.user.role, "admin");
          const adminToken = first.data.session.token;
          assert.equal((await api("messages.php")).status, 401);

          const invite = await api("invites.php", {}, adminToken);
          assert.equal(invite.status, 201, JSON.stringify(invite.data));
          assert.match(invite.data.item.code, /^[A-Za-z0-9]{12}$/);
          assert.equal((await api("invites.php", {}, adminToken)).status, 429);

          const member = await api("auth.php", {
            action: "register",
            username: "member-one",
            displayName: "Member One",
            password: "correct-horse-2",
            inviteCode: invite.data.item.code,
          });
          assert.equal(member.status, 201, JSON.stringify(member.data));
          const memberToken = member.data.session.token;
          const inviteRows = JSON.parse(await readFile(join(dir, "data", "invites.json"), "utf8"));
          assert.equal(inviteRows[0].usedByUserId, member.data.user.id);
          assert.ok(inviteRows[0].usedAt);
          const adminProfileKey = first.data.user.id.replace(/^user:/, "");
          const adminInviteDoc = JSON.parse(await readFile(join(dir, "profiles", adminProfileKey, "invitations.json"), "utf8"));
          assert.equal(adminInviteDoc[0].usedByUsername, "member-one");

          const contacts = await api("contacts.php", {
            action: "save",
            name: "Friends",
            memberUsernames: ["member-one"],
          }, adminToken);
          assert.equal(contacts.status, 201);
          assert.equal(contacts.data.item.members[0].username, "member-one");

          const dm = await api("messages.php", { recipientUsername: "member-one", body: "hello privately" }, adminToken);
          assert.equal(dm.status, 201);
          const thread = await api("messages.php?with=seed-admin", null, memberToken);
          assert.equal(thread.data.items.at(-1).body, "hello privately");

          const chat = await api("group-chats.php", {
            action: "create",
            name: "Launch Room",
            memberUsernames: ["member-one"],
          }, adminToken);
          assert.equal(chat.status, 201);
          assert.match(chat.data.chat.code, /^[A-Za-z0-9]{5}$/);
          assert.equal(chat.data.chat.url, `https://xtratype.com/gc/${chat.data.chat.code}`);
          const groupPost = await api("group-chats.php", { action: "message", code: chat.data.chat.code, body: "group hello" }, memberToken);
          assert.equal(groupPost.status, 201);
          const groupView = await api(`group-chats.php?code=${chat.data.chat.code}`, null, adminToken);
          assert.equal(groupView.data.messages.at(-1).body, "group hello");

          const users = await api("admin.php", null, adminToken);
          const memberRow = users.data.users.find((u) => u.username === "member-one");
          assert.ok(memberRow);
          assert.equal((await api("admin.php", { action: "updateUser", userId: memberRow.id, canCreateInvites: false }, adminToken)).status, 200);
          assert.equal((await api("invites.php", {}, memberToken)).status, 403);
          assert.equal((await api("admin.php", { action: "setSystemEnabled", enabled: false }, adminToken)).status, 200);
          assert.equal((await api("messages.php", null, memberToken)).status, 403);
          assert.equal((await api("admin.php", null, adminToken)).status, 200);
          assert.equal((await api("admin.php", { action: "setSystemEnabled", enabled: true }, adminToken)).status, 200);
          assert.equal((await api("auth.php", { action: "login", username: "member-one", password: "correct-horse-2" })).status, 200);
        },
      );
      await t.test(
        "corrupt JSON refuses writes without replacing bytes",
        async () => {
          const login = await req("auth.php", {
            action: "login",
            username: "seed-admin",
            password: "correct-horse-1",
          });
          const token = login.data.session.token;
          const p = join(dir, "data", "annotations.json");
          for (const invalid of ["{corrupt", "{}", "", "null"]) {
            await writeFile(p, invalid);
            const r = await req("annotations.php", note("no-overwrite"), {
              headers: {
                "Content-Type": "application/json",
                "X-XtraType-Client": "test",
                Authorization: `Bearer ${token}`,
              },
            });
            assert.equal(r.status, 500);
            assert.equal(await readFile(p, "utf8"), invalid);
          }
        },
      );
    } finally {
      proc.kill();
      await new Promise((r) => proc.once("exit", r));
      await rm(dir, { recursive: true, force: true });
    }
  },
);
