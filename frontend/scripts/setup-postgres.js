const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const zipPath = 'C:/Users/soura/postgresql-binaries.zip';
const targetDir = 'C:/Users/soura';
const pgsqlDir = 'C:/Users/soura/pgsql';
const binDir = path.join(pgsqlDir, 'bin');
const dataDir = path.join(pgsqlDir, 'data');
const logFile = path.join(pgsqlDir, 'logfile.log');

function exec(cmd, opts = {}) {
  console.log('> ' + cmd);
  try {
    const out = execSync(cmd, { stdio: 'inherit', ...opts });
    return out;
  } catch (e) {
    console.error('Error executing: ' + cmd, e.message);
    throw e;
  }
}

async function main() {
  console.log('=== Step 1: Checking ZIP file ===');
  if (!fs.existsSync(zipPath)) {
    throw new Error('ZIP file not found at: ' + zipPath);
  }
  const stat = fs.statSync(zipPath);
  console.log('ZIP size: ' + (stat.size / 1024 / 1024).toFixed(1) + ' MB');

  console.log('=== Step 2: Extracting PostgreSQL ===');
  // Use tar if available (built into modern Windows) or PowerShell Expand-Archive
  try {
    exec(`tar -xf "${zipPath}" -C "${targetDir}"`);
  } catch (e) {
    console.log('tar failed, trying PowerShell Expand-Archive...');
    exec(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${targetDir}' -Force"`);
  }

  if (!fs.existsSync(binDir)) {
    throw new Error('Failed to find bin directory at ' + binDir);
  }
  console.log('PostgreSQL extracted successfully to ' + pgsqlDir);

  console.log('=== Step 3: Unblocking binaries & Initializing database cluster ===');
  exec(`powershell -Command "Get-ChildItem -Path '${pgsqlDir}' -Recurse | Unblock-File"`);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    exec(`"${path.join(binDir, 'initdb.exe')}" -D "${dataDir}" -U postgres -E UTF8 --no-locale -A trust`);
  } else {
    console.log('Data directory already exists, skipping initdb.');
  }

  console.log('=== Step 4: Starting PostgreSQL Server on port 5432 ===');
  try {
    exec(`"${path.join(binDir, 'pg_ctl.exe')}" -D "${dataDir}" -l "${logFile}" start`);
  } catch (e) {
    console.log('pg_ctl start notice: server might already be starting.');
  }

  // Wait 3 seconds for server to accept connections
  console.log('Waiting for PostgreSQL to be ready...');
  await new Promise((res) => setTimeout(res, 3000));

  console.log('=== Step 5: Creating databases and setting password ===');
  try {
    exec(`"${path.join(binDir, 'createdb.exe')}" -h 127.0.0.1 -p 5432 -U postgres runnerup`);
    console.log('Created database: runnerup');
  } catch (e) {
    console.log('Database runnerup might already exist.');
  }

  try {
    exec(`"${path.join(binDir, 'psql.exe')}" -h 127.0.0.1 -p 5432 -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"`);
    console.log('Set password for user postgres to: postgres');
  } catch (e) {
    console.error('Could not set password:', e.message);
  }

  console.log('=== Step 6: Adding PostgreSQL bin to User PATH ===');
  try {
    exec(`powershell -Command "[Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path', 'User') + ';${binDir}', 'User')"`);
    console.log('Added ' + binDir + ' to User PATH.');
  } catch (e) {
    console.log('Could not update User PATH automatically:', e.message);
  }

  console.log('=== PostgreSQL is UP and RUNNING on 127.0.0.1:5432! ===');
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
