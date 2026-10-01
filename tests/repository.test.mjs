import test from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const php = process.env.PHP_BIN || "php";
test(
  "JSON repository serializes independent writer processes without lost updates",
  { skip: spawnSync(php, ["-n", "-v"]).status !== 0 },
  async () => {
    const dir = await mkdtemp(join(tmpdir(), "xt-lock-"));
    try {
      await Promise.all(
        Array.from(
          { length: 24 },
          (_, i) =>
            new Promise((resolve, reject) => {
              const p = spawn(php, [
                "-n",
                fileURLToPath(
                  new URL("./repository-worker.php", import.meta.url),
                ),
                dir,
                "writer:" + i,
              ]);
              let error = "";
              p.stderr.on("data", (b) => (error += b));
              p.on("error", reject);
              p.on("exit", (code) =>
                code === 0 ? resolve() : reject(new Error(error)),
              );
            }),
        ),
      );
      const rows = JSON.parse(await readFile(join(dir, "events.json"), "utf8"));
      assert.equal(rows.length, 24);
      assert.equal(new Set(rows.map((r) => r.id)).size, 24);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  },
);
