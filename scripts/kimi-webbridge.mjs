#!/usr/bin/env node
/**
 * Minimal, dependency-free client for the local Kimi WebBridge daemon.
 *
 * The script deliberately talks to loopback only. It is a transport helper
 * for skills; it does not store cookies, credentials, or application data.
 *
 * Examples:
 *   node scripts/kimi-webbridge.mjs status
 *   node scripts/kimi-webbridge.mjs command --body-file request.json
 */

import { readFile } from "node:fs/promises";

const DEFAULT_BASE_URL = "http://127.0.0.1:10086";
const DEFAULT_TIMEOUT_MS = 120_000;
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);

function usage() {
  console.log(`Usage:
  node scripts/kimi-webbridge.mjs status
  node scripts/kimi-webbridge.mjs command --body-file <json-file>
  node scripts/kimi-webbridge.mjs command --action <action> [--session <name>] [--args-json <json>]

Environment:
  KIMI_WEBBRIDGE_URL       Loopback daemon URL (default: ${DEFAULT_BASE_URL})
  KIMI_WEBBRIDGE_TIMEOUT_MS Request timeout (default: ${DEFAULT_TIMEOUT_MS})

The command body is {"action":"...","args":{...},"session":"..."}.
`);
}

function option(args, name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function requireOption(args, name) {
  const value = option(args, name);
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}`);
  }
  return value;
}

function getBaseUrl() {
  const raw = process.env.KIMI_WEBBRIDGE_URL || DEFAULT_BASE_URL;
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`Invalid KIMI_WEBBRIDGE_URL: ${raw}`);
  }
  if (url.protocol !== "http:" || !LOOPBACK_HOSTS.has(url.hostname)) {
    throw new Error("KIMI_WEBBRIDGE_URL must use http://127.0.0.1, localhost, or [::1]");
  }
  return url.toString().replace(/\/$/, "");
}

function getTimeoutMs() {
  const value = Number(process.env.KIMI_WEBBRIDGE_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
  if (!Number.isFinite(value) || value < 1 || value > 600_000) {
    throw new Error("KIMI_WEBBRIDGE_TIMEOUT_MS must be between 1 and 600000");
  }
  return value;
}

async function request(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), getTimeoutMs());
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    let body;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    if (!response.ok) {
      const detail = typeof body === "string" ? body : JSON.stringify(body);
      throw new Error(`WebBridge HTTP ${response.status}: ${detail}`);
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

async function readJsonFile(path) {
  let text;
  try {
    text = await readFile(path, "utf8");
  } catch (error) {
    throw new Error(`Cannot read request body file ${path}: ${error.message}`);
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON in ${path}: ${error.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const subcommand = args[0];
  if (!subcommand || subcommand === "--help" || subcommand === "-h") {
    usage();
    return;
  }

  const baseUrl = getBaseUrl();
  if (subcommand === "status") {
    console.log(JSON.stringify(await request(`${baseUrl}/status`)));
    return;
  }

  if (subcommand !== "command") {
    throw new Error(`Unknown subcommand: ${subcommand}`);
  }

  const bodyFile = option(args, "--body-file");
  let body;
  if (bodyFile) {
    body = await readJsonFile(bodyFile);
  } else {
    const action = requireOption(args, "--action");
    const session = option(args, "--session");
    const argsJson = option(args, "--args-json");
    let commandArgs = {};
    if (argsJson) {
      try {
        commandArgs = JSON.parse(argsJson);
      } catch (error) {
        throw new Error(`Invalid --args-json: ${error.message}`);
      }
    }
    body = { action, args: commandArgs };
    if (session) body.session = session;
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("The request body must be a JSON object");
  }
  if (typeof body.action !== "string" || !body.action) {
    throw new Error("The request body needs a non-empty action");
  }

  console.log(JSON.stringify(await request(`${baseUrl}/command`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })));
}

main().catch((error) => {
  console.error(`Kimi WebBridge: ${error.message}`);
  process.exitCode = 1;
});
