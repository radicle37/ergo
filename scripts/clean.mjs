#!/usr/bin/env node
/**
 * Cross-platform replacement for `git clean -Xdfq` that reliably preserves
 * specific paths (e.g. `tmp/`), working around the long-standing bug where
 * `git clean -e <pattern>` / `-- . ':!pattern'` silently ignore the exclusion
 * once the path is collapsed into git's ignored-directory listing.
 *
 * How it works:
 *   1. Ask git for every ignored file/directory (`git ls-files --others
 *      --ignored --exclude-standard --directory`), which is the exact same
 *      source list `git clean -X` uses internally.
 *   2. Filter out anything under the preserved paths ourselves, in plain
 *      JS — no reliance on git's own exclude-matching for this step.
 *   3. Delete what's left with Node's `fs.rmSync`, which behaves the same
 *      on Windows, macOS, and Linux (no dependency on `rm -rf`/`xargs`).
 *
 * Usage:
 *   node clean.mjs                # deletes ignored files, preserving defaults below
 *   node clean.mjs --dry-run      # lists what would be deleted, deletes nothing
 *   node clean.mjs -n             # same as --dry-run
 *
 * Configure PRESERVE below with repo-root-relative paths to keep.
 */

import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";

// Paths (relative to repo root, forward slashes) to never delete.
const PRESERVE = ["tmp", ".claude"];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run") || args.includes("-n");

function git(...cmdArgs) {
  return execFileSync("git", cmdArgs, { encoding: "utf8" });
}

const repoRoot = git("rev-parse", "--show-toplevel").trim();

// -z uses NUL separators so filenames with spaces/newlines are handled safely.
// --directory collapses a fully-ignored directory into a single entry
// (e.g. "tmp/" or "node_modules/"), matching what `git clean -X` would remove.
const raw = git(
  "ls-files",
  "-z",
  "--others",
  "--ignored",
  "--exclude-standard",
  "--directory"
);

const entries = raw.split("\0").filter(Boolean);

function isPreserved(entry) {
  const normalized = entry.replace(/\/$/, ""); // strip trailing slash on dirs
  return PRESERVE.some(
    (p) => normalized === p || normalized.startsWith(p + "/")
  );
}

const toDelete = entries.filter((e) => !isPreserved(e));
const skipped = entries.filter(isPreserved);

if (skipped.length) {
  console.log("Preserving:");
  for (const s of skipped) console.log(`  ${s}`);
}

if (!toDelete.length) {
  console.log("Nothing to clean.");
  process.exit(0);
}

console.log(dryRun ? "Would remove:" : "Removing:");
for (const entry of toDelete) {
  console.log(`  ${entry}`);
  if (!dryRun) {
    const fullPath = path.join(repoRoot, entry);
    rmSync(fullPath, { recursive: true, force: true });
  }
}

console.log(
  dryRun
    ? `\nDry run: ${toDelete.length} item(s) would be removed.`
    : `\nRemoved ${toDelete.length} item(s).`
);
