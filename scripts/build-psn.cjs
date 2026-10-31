const path = require("node:path"),
  fs = require("node:fs"),
  { buildSync } = require("esbuild");
const root = path.resolve(__dirname, "..");
fs.mkdirSync(path.join(root, "app/vendor"), { recursive: true });
buildSync({
  entryPoints: [require.resolve("psn-api")],
  outfile: path.join(root, "app/vendor/psn-api.cjs"),
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node22",
  define: { fetch: "psnFetch" },
  banner: {
    js: '// psn-api 2.18.1 (MIT). See ../third-party-licenses/psn-api.md\nconst { psnFetch } = require("../psn-http.cjs");',
  },
  logLevel: "warning",
});
