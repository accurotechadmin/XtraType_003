Run from the project root:

```bash
node tests/anchors.mjs
find ext -name '*.js' -print0 | xargs -0 -n1 node --check
find server -name '*.php' -print0 | xargs -0 -n1 php -l
```
