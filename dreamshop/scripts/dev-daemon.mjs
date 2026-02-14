import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function parseArgs(argv) {
  const out = { cmd: "status", port: 3001 };
  const [cmd, ...rest] = argv.slice(2);
  if (cmd) out.cmd = cmd;
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--port" || a === "-p") out.port = Number(rest[++i]);
  }
  return out;
}

const args = parseArgs(process.argv);
const cwd = process.cwd();

const pidFile = path.resolve(cwd, ".dev.pid");
const logFile = path.resolve(cwd, ".dev.log");

function readPid() {
  try {
    const raw = fs.readFileSync(pidFile, "utf8").trim();
    const pid = Number(raw);
    return Number.isFinite(pid) ? pid : null;
  } catch {
    return null;
  }
}

function isRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForExit(pid, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (!isRunning(pid)) return true;
    await sleep(80);
  }
  return !isRunning(pid);
}

function resolveNextBin() {
  try {
    return require.resolve("next/dist/bin/next");
  } catch {
    console.error("Cannot resolve next binary. Run `npm i` first.");
    process.exit(1);
  }
}

async function start() {
  const existing = readPid();
  if (existing && isRunning(existing)) {
    console.log(
      `Already running (pid ${existing}): http://localhost:${args.port}`
    );
    return;
  }

  const out = fs.openSync(logFile, "a");
  const nextBin = resolveNextBin();

  const child = spawn(process.execPath, [nextBin, "dev", "-p", String(args.port)], {
    cwd,
    detached: true,
    stdio: ["ignore", out, out],
    env: { ...process.env },
  });
  child.unref();

  fs.writeFileSync(pidFile, String(child.pid));
  console.log(`Started (pid ${child.pid}): http://localhost:${args.port}`);
  console.log(`Logs: ${logFile}`);
}

async function stop() {
  const pid = readPid();
  if (!pid) {
    console.log("Not running.");
    return;
  }

  if (!isRunning(pid)) {
    try {
      fs.unlinkSync(pidFile);
    } catch {}
    console.log("Not running.");
    return;
  }

  process.kill(pid, "SIGTERM");
  const ok = await waitForExit(pid, 2500);
  if (!ok) {
    process.kill(pid, "SIGKILL");
    await waitForExit(pid, 1500);
  }

  try {
    fs.unlinkSync(pidFile);
  } catch {}
  console.log("Stopped.");
}

async function status() {
  const pid = readPid();
  if (pid && isRunning(pid)) {
    console.log(`Running (pid ${pid}): http://localhost:${args.port}`);
  } else {
    console.log("Not running.");
  }
}

if (args.cmd === "start") await start();
else if (args.cmd === "stop") await stop();
else await status();

