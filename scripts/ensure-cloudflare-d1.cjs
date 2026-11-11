const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DB_NAME = 'visiontechnextjs-db';
const CONFIGS = [
  path.join(ROOT, 'wrangler.jsonc'),
  path.join(ROOT, 'apps', 'frontend', 'wrangler.jsonc'),
];

function shouldRun() {
  return Boolean(
    process.env.CLOUDFLARE_API_TOKEN ||
      process.env.CLOUDFLARE_ACCOUNT_ID ||
      process.env.CF_ENSURE_D1 === '1'
  );
}

function run(cmd) {
  return execSync(cmd, {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, CI: process.env.CI || 'true' },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function parseJsonFromOutput(out) {
  const idx = [...out].findIndex((_, i) => out[i] === '[' || out[i] === '{');
  if (idx < 0) throw new Error(`No JSON in Wrangler output:\n${out}`);
  return JSON.parse(out.slice(idx));
}

function listDatabases() {
  const parsed = parseJsonFromOutput(run('npx wrangler d1 list --json'));
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.result)) return parsed.result;
  if (Array.isArray(parsed.databases)) return parsed.databases;
  return [];
}

function findDb(list) {
  return list.find((row) => row && (row.name === DB_NAME || row.database_name === DB_NAME));
}

function dbId(row) {
  return row.uuid || row.id || row.database_id;
}

function patchConfigs(id) {
  for (const file of CONFIGS) {
    const source = fs.readFileSync(file, 'utf8');
    const next = source.replace(/"database_id"\s*:\s*"[^"]*"/, `"database_id": "${id}"`);
    if (next === source) {
      throw new Error(`Could not patch database_id in ${path.relative(ROOT, file)}`);
    }
    fs.writeFileSync(file, next);
    console.log(`Updated ${path.relative(ROOT, file)} database_id=${id}`);
  }
}

function main() {
  if (!shouldRun()) {
    console.log('Skipping D1 ensure (no Cloudflare CI credentials).');
    return;
  }

  console.log('Ensuring Cloudflare D1 database for this account...');
  let list = listDatabases();
  let row = findDb(list);
  if (!row) {
    console.log(`Creating D1 database ${DB_NAME}...`);
    run(`npx wrangler d1 create ${DB_NAME}`);
    list = listDatabases();
    row = findDb(list);
  }
  if (!row || !dbId(row)) {
    throw new Error(`D1 database ${DB_NAME} was not found after create.`);
  }

  const id = dbId(row);
  patchConfigs(id);
  console.log(`Applying D1 migrations on ${DB_NAME} (${id})...`);
  execSync(`npx wrangler d1 migrations apply ${DB_NAME} --remote --config wrangler.jsonc`, {
    cwd: ROOT,
    env: { ...process.env, CI: process.env.CI || 'true' },
    stdio: 'inherit',
  });
  console.log('D1 is ready for deploy.');
}

main();
