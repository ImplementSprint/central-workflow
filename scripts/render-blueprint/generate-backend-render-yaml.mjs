import fs from "node:fs";

const inputPath = process.argv[2];

if (!inputPath) {
  console.error(
    "Usage: node scripts/render-blueprint/generate-backend-render-yaml.mjs <systems-json-path>",
  );
  process.exit(1);
}

const systems = JSON.parse(fs.readFileSync(inputPath, "utf8"));

if (!Array.isArray(systems) || systems.length === 0) {
  throw new Error("systems JSON must be a non-empty array");
}

function renderType(system) {
  const raw = String(
    system.render_service_type || (system.name === "api" ? "web" : "private"),
  ).toLowerCase();

  if (raw === "web") return "web";
  if (raw === "private" || raw === "pserv" || raw === "private-service") return "pserv";

  throw new Error(`Unsupported render_service_type for ${system.name}: ${raw}`);
}

function requireString(system, key) {
  const value = system[key];

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required ${key} for ${system.name || "unnamed service"}`);
  }

  return value.trim();
}

function normalizeRelativePath(value) {
  return value.replace(/^\.\/+/, "");
}

const lines = ["services:"];

for (const system of systems) {
  const name = requireString(system, "name");
  const dockerfilePath = normalizeRelativePath(requireString(system, "dockerfile_path"));
  const healthPath = system.healthcheck_path || "/api/v1/health";
  const dockerContext = system.render_docker_context || system.dir || ".";
  const serviceType = renderType(system);

  lines.push(`  - type: ${serviceType}`);
  lines.push(`    name: ${name}`);
  lines.push("    runtime: docker");
  lines.push(`    dockerfilePath: ./${dockerfilePath}`);
  lines.push(`    dockerContext: ${dockerContext}`);
  if (serviceType === "web") {
    lines.push(`    healthCheckPath: ${healthPath}`);
  }
  lines.push("    envVars:");
  lines.push("      - key: NODE_ENV");
  lines.push("        value: production");
  lines.push("      - key: APICENTER_TRIBE_SECRET");
  lines.push("        sync: false");
  lines.push("");
}

process.stdout.write(`${lines.join("\n").trimEnd()}\n`);
