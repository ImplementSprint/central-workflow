import fs from "node:fs";

const [systemsPath, renderPath] = process.argv.slice(2);

if (!systemsPath || !renderPath) {
  console.error(
    "Usage: node scripts/render-blueprint/validate-backend-render-yaml.mjs <systems-json-path> <render-yaml-path>",
  );
  process.exit(1);
}

const systems = JSON.parse(fs.readFileSync(systemsPath, "utf8").replace(/^\uFEFF/, ""));
const renderYaml = fs.readFileSync(renderPath, "utf8");

if (!Array.isArray(systems) || systems.length === 0) {
  throw new Error("systems JSON must be a non-empty array");
}

function normalizeRelativePath(value) {
  return String(value || "").replace(/^\.\/+/, "");
}

function parseServiceBlocks(yamlText) {
  const blocks = [];
  let current = null;

  for (const line of yamlText.split(/\r?\n/)) {
    const typeMatch = line.match(/^  - type:\s+(\S+)\s*$/);

    if (typeMatch) {
      if (current) {
        blocks.push(current);
      }

      current = {
        name: "",
        type: typeMatch[1].trim(),
        plan: "",
        dockerfilePath: "",
        healthCheckPath: "",
      };
      continue;
    }

    if (!current) {
      continue;
    }

    const fieldMatch = line.match(/^    (name|plan|dockerfilePath|healthCheckPath):\s+(.+)\s*$/);

    if (fieldMatch) {
      current[fieldMatch[1]] = fieldMatch[2].trim();
    }
  }

  if (current) {
    blocks.push(current);
  }

  return blocks.filter((block) => block.name);
}

const renderServices = parseServiceBlocks(renderYaml);
const renderByName = new Map(renderServices.map((service) => [service.name, service]));
const systemNames = systems.map((system) => system.name);
const duplicateSystemNames = systemNames.filter((name, index) => systemNames.indexOf(name) !== index);

if (duplicateSystemNames.length > 0) {
  throw new Error(`Duplicate systems JSON service names: ${[...new Set(duplicateSystemNames)].join(", ")}`);
}

const missingInRender = systemNames.filter((name) => !renderByName.has(name));

if (missingInRender.length > 0) {
  throw new Error(`render.yaml is missing services: ${missingInRender.join(", ")}`);
}

const extraInRender = renderServices
  .map((service) => service.name)
  .filter((name) => !systemNames.includes(name));

if (extraInRender.length > 0) {
  throw new Error(`render.yaml has services missing from systems JSON: ${extraInRender.join(", ")}`);
}

for (const system of systems) {
  const dockerfile = normalizeRelativePath(system.dockerfile_path);

  if (!dockerfile) {
    throw new Error(`${system.name} is missing dockerfile_path`);
  }

  const renderService = renderByName.get(system.name);
  const expectedDockerfilePath = `./${dockerfile}`;
  const expectedType = system.render_service_type === "private" ? "pserv" : system.render_service_type || (system.name === "api" ? "web" : "private");
  const expectedPlan = String(system.render_plan || (renderService.type === "web" ? "free" : "starter")).toLowerCase();

  if (renderService.dockerfilePath !== expectedDockerfilePath) {
    throw new Error(
      `${system.name} dockerfile mismatch: expected ${expectedDockerfilePath}, got ${renderService.dockerfilePath || "(missing)"}`,
    );
  }

  const expectedHealthPath = system.healthcheck_path || "/api/v1/health";

  if (expectedType === "web" && renderService.type !== "web") {
    throw new Error(`${system.name} should be type web for the configured Render plan`);
  }

  if (renderService.type === "pserv" && renderService.plan === "free") {
    throw new Error(`${system.name} is type pserv and cannot use Render plan free`);
  }

  if (renderService.plan && renderService.plan !== expectedPlan) {
    throw new Error(
      `${system.name} plan mismatch: expected ${expectedPlan}, got ${renderService.plan}`,
    );
  }

  if (renderService.type === "pserv" && renderService.healthCheckPath) {
    throw new Error(`${system.name} is type pserv and must not set healthCheckPath`);
  }

  if (renderService.healthCheckPath && renderService.healthCheckPath !== expectedHealthPath) {
    throw new Error(
      `${system.name} healthCheckPath mismatch: expected ${expectedHealthPath}, got ${renderService.healthCheckPath}`,
    );
  }
}

console.log(`Validated ${systems.length} backend Render Blueprint services.`);
