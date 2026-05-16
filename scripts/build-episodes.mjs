import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const yamlPath = path.join(root, "data", "episodes.yaml");
const jsonPath = path.join(root, "data", "episodes.json");

const raw = fs.readFileSync(yamlPath, "utf8");
const data = yaml.load(raw);
if (!Array.isArray(data)) {
  console.error("episodes.yaml must be a YAML list at the top level.");
  process.exit(1);
}
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n");
console.log("Wrote", path.relative(root, jsonPath));

const jsPath = path.join(root, "data", "episodes.js");
const compact = JSON.stringify(data);
fs.writeFileSync(
  jsPath,
  `/** Generated from episodes.yaml — do not edit by hand. Run npm run build. */\nwindow.__MC_EPISODES__ = ${compact};\n`
);
console.log("Wrote", path.relative(root, jsPath));
