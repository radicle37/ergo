#!/usr/bin/env node
// Turns each package version published by `changeset publish` into a GitHub
// Release, using that version's own CHANGELOG.md section as the release
// notes. Expects CHANGESETS_PUBLISHED_PACKAGES to hold the JSON array from
// changesets/action's `publishedPackages` output: [{ name, version }, ...].

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const raw = process.env.CHANGESETS_PUBLISHED_PACKAGES;
if (!raw) {
  console.log("No published packages; skipping GitHub release creation.");
  process.exit(0);
}

const published = JSON.parse(raw);
if (!Array.isArray(published) || published.length === 0) {
  console.log("No published packages; skipping GitHub release creation.");
  process.exit(0);
}

function extractChangelogSection(changelogPath, version) {
  const contents = readFileSync(changelogPath, "utf8");
  const lines = contents.split("\n");
  const startIndex = lines.findIndex(
    (line) => line.trim() === `## ${version}`
  );
  if (startIndex === -1) return null;

  const rest = lines.slice(startIndex + 1);
  const endOffset = rest.findIndex((line) => line.startsWith("## "));
  const section = endOffset === -1 ? rest : rest.slice(0, endOffset);
  return section.join("\n").trim();
}

for (const { name, version } of published) {
  const tag = `${name}@${version}`;
  const changelogPath = `packages/${name}/CHANGELOG.md`;
  const notes = extractChangelogSection(changelogPath, version);

  const args = [
    "release",
    "create",
    tag,
    "--title",
    tag,
    "--notes",
    notes || `Release ${tag}`,
  ];

  console.log(`Creating GitHub release for ${tag}`);
  try {
    execFileSync("gh", args, { stdio: ["ignore", "inherit", "pipe"] });
  } catch (error) {
    const stderr = error.stderr?.toString() ?? "";
    process.stderr.write(stderr);
    // A prior attempt (or a retried request that actually succeeded server-side)
    // can leave the release already created; treat that as a no-op, not a failure.
    if (!/already exists/i.test(stderr)) throw error;
    console.log(`Release ${tag} already exists; skipping.`);
  }
}
