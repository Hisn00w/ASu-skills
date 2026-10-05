#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY = JSON.parse(
  fs.readFileSync(path.join(PACKAGE_ROOT, "skills.registry.json"), "utf8"),
);
const SKILLS = REGISTRY.entries.map((entry) => entry.name);
const SHARED_DIRS = ["assets", "references", "scripts"];
const PRODUCTS = ["agents", "codex", "claude-code", "cursor", "opencode", "workbuddy"];
const MANIFEST = ".asu-skills-install.json";

function main(argv = process.argv.slice(2)) {
  const command = argv[0] && !argv[0].startsWith("-") ? argv.shift() : "install";

  try {
    if (argv.includes("--help") || argv.includes("-h") || command === "help") {
      printHelp();
      return;
    }

    const options = parseArgs(argv);
    if (command === "install") {
      install(options);
    } else if (command === "doctor") {
      doctor(options);
    } else {
      throw new Error(`未知命令: ${command}`);
    }
  } catch (error) {
    console.error(`[error] ${error.message}`);
    process.exitCode = 1;
  }
}

function parseArgs(args) {
  const options = {
    product: "",
    project: false,
    all: false,
    dryRun: false,
    force: false,
    customPath: "",
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--project") options.project = true;
    else if (arg === "--all") options.all = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--force") options.force = true;
    else if (arg === "--path") {
      options.customPath = requireValue(args, index, arg);
      index += 1;
    } else if (arg.startsWith("--")) {
      const product = normalizeProduct(arg.slice(2));
      if (!PRODUCTS.includes(product)) throw new Error(`未知选项: ${arg}`);
      if (options.product) throw new Error("一次只能选择一个目标平台，或使用 --all。");
      options.product = product;
    } else {
      throw new Error(`无法识别的参数: ${arg}`);
    }
  }

  if (options.all && (options.product || options.customPath)) {
    throw new Error("--all 不能与平台选项或 --path 同时使用。");
  }
  if (options.customPath && options.product) {
    throw new Error("--path 已指定目标 skills 目录，不能再选择平台。");
  }
  return options;
}

function requireValue(args, index, flag) {
  const value = args[index + 1];
  if (!value || value.startsWith("-")) throw new Error(`${flag} 缺少路径参数。`);
  return value;
}

function normalizeProduct(product) {
  const aliases = { agent: "agents", claude: "claude-code", opencode: "opencode" };
  return aliases[product] || product;
}

function install(options) {
  validatePackage();
  const products = options.all ? PRODUCTS : [options.product || "agents"];
  for (const product of products) {
    const target = resolveTarget(product, options);
    if (options.dryRun) {
      console.log(`[dry-run] ${product}: ${target.skillsRoot}`);
      continue;
    }
    installTarget(product, target, options.force);
  }
}

function installTarget(product, target, force) {
  const manifestPath = path.join(target.platformRoot, MANIFEST);
  const previous = readManifest(manifestPath);
  const managedSkills = new Set(previous?.skills || []);
  const managedFiles = new Set(previous?.files || []);

  const skillConflicts = SKILLS.filter((skill) => {
    const destination = path.join(target.skillsRoot, skill);
    return fs.existsSync(destination) && !managedSkills.has(skill);
  });
  const sharedFiles = SHARED_DIRS.flatMap((directory) =>
    listFiles(path.join(PACKAGE_ROOT, directory), directory),
  );
  const fileConflicts = sharedFiles.filter((relativePath) => {
    const source = path.join(PACKAGE_ROOT, relativePath);
    const destination = path.join(target.platformRoot, relativePath);
    if (!fs.existsSync(destination) || managedFiles.has(relativePath)) return false;
    return !fs.statSync(destination).isFile() || !fs.readFileSync(source).equals(fs.readFileSync(destination));
  });
  if ((skillConflicts.length || fileConflicts.length) && !force) {
    const conflicts = [...skillConflicts, ...fileConflicts];
    throw new Error(
      `目标目录已有非 ASu-skills 管理的同名内容：${conflicts.join(", ")}。请先备份，确认后使用 --force。`,
    );
  }

  fs.mkdirSync(target.skillsRoot, { recursive: true });
  for (const skill of SKILLS) {
    const source = path.join(PACKAGE_ROOT, "skills", skill);
    const destination = path.join(target.skillsRoot, skill);
    fs.rmSync(destination, { recursive: true, force: true });
    fs.cpSync(source, destination, { recursive: true });
  }

  for (const directory of SHARED_DIRS) {
    copyTree(path.join(PACKAGE_ROOT, directory), path.join(target.platformRoot, directory));
  }

  fs.writeFileSync(
    manifestPath,
    `${JSON.stringify({ version: 1, product, skills: SKILLS, files: sharedFiles }, null, 2)}\n`,
    "utf8",
  );
  console.log(`[ok] ${product}: ${SKILLS.length} 个技能已安装到 ${target.skillsRoot}`);
}

function listFiles(directory, prefix) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relativePath = path.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(path.join(directory, entry.name), relativePath));
    else files.push(relativePath);
  }
  return files;
}

function copyTree(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const src = path.join(source, entry.name);
    const dst = path.join(destination, entry.name);
    if (entry.isDirectory()) copyTree(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

function doctor(options) {
  const products = options.all ? PRODUCTS : [options.product || "agents"];
  for (const product of products) {
    const target = resolveTarget(product, options);
    const installed = SKILLS.filter((skill) =>
      fs.existsSync(path.join(target.skillsRoot, skill, "SKILL.md")),
    );
    console.log(
      `${product}: ${installed.length}/${SKILLS.length} 个技能可用 (${target.skillsRoot})`,
    );
  }
}

function resolveTarget(product, options) {
  if (options.customPath) {
    const skillsRoot = path.resolve(options.customPath);
    return { skillsRoot, platformRoot: path.dirname(skillsRoot) };
  }

  const base = options.project ? process.cwd() : os.homedir();
  const roots = {
    agents: path.join(base, ".agents"),
    codex: path.join(base, ".codex"),
    "claude-code": path.join(base, ".claude"),
    cursor: path.join(base, ".cursor"),
    opencode: options.project
      ? path.join(base, ".opencode")
      : path.join(base, ".config", "opencode"),
    workbuddy: path.join(base, ".workbuddy"),
  };
  const platformRoot = roots[product];
  return { platformRoot, skillsRoot: path.join(platformRoot, "skills") };
}

function readManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    throw new Error(`安装清单损坏，无法安全覆盖：${manifestPath}`);
  }
}

function validatePackage() {
  for (const skill of SKILLS) {
    if (!fs.existsSync(path.join(PACKAGE_ROOT, "skills", skill, "SKILL.md"))) {
      throw new Error(`缺少技能入口: ${skill}/SKILL.md`);
    }
  }
  for (const directory of SHARED_DIRS) {
    if (!fs.existsSync(path.join(PACKAGE_ROOT, directory))) {
      throw new Error(`缺少共享资源目录: ${directory}`);
    }
  }
}

function printHelp() {
  console.log(`ASu-skills 安装 CLI

用法：
  npx asu-skills install [--agents|--codex|--claude-code|--cursor|--opencode|--workbuddy]
  npx asu-skills install --project [平台选项]
  npx asu-skills install --all
  npx asu-skills doctor [平台选项]

选项：
  --agents       安装到 ~/.agents/skills（默认）
  --codex        安装到 ~/.codex/skills
  --claude-code  安装到 ~/.claude/skills
  --cursor       安装到 ~/.cursor/skills
  --opencode     安装到 ~/.config/opencode/skills
  --workbuddy    安装到 ~/.workbuddy/skills
  --project      安装到当前项目下的平台目录
  --all          安装到所有支持的平台
  --path PATH    安装到指定 skills 目录
  --dry-run      只显示目标目录，不写文件
  --force        覆盖同名的非 ASu-skills 技能目录
  -h, --help     显示帮助
`);
}

main();
