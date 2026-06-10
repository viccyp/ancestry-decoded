#!/usr/bin/env node
/**
 * Build a customer report from a JSON data file.
 *
 * Usage:
 *   node scripts/build-report.js path/to/customer.json
 *   npm run build:customer -- path/to/customer.json
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const customerPath = process.argv[2];
const dataDest = path.join(__dirname, "../src/_data/report.json");

if (!customerPath) {
  console.error("Usage: node scripts/build-report.js <customer-data.json>");
  process.exit(1);
}

const resolved = path.resolve(customerPath);
if (!fs.existsSync(resolved)) {
  console.error(`File not found: ${resolved}`);
  process.exit(1);
}

fs.copyFileSync(resolved, dataDest);
console.log(`Using customer data: ${resolved}`);

execSync("npx eleventy", { stdio: "inherit", cwd: path.join(__dirname, "..") });
console.log("Report built to dist/");
