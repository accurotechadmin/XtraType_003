import { copyFile } from "node:fs/promises";
for (const name of ["anchors.js", "schemas.js"])
  await copyFile(
    new URL("../ext/core/" + name, import.meta.url),
    new URL("../server/assets/core/" + name, import.meta.url),
  );
