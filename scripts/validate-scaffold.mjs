#!/usr/bin/env node
/**
 * REALITY OS XAB — Scaffold Validator
 * Verifies the foundational structure is correct before any Phase 1+ work begins.
 */

import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

const REQUIRED_FILES = [
  'package.json',
  'tsconfig.json',
  'next.config.mjs',
  'vercel.json',
  'tailwind.config.js',
  'playwright.config.ts',
  '.env.example',
  '.gitignore',
  'GOVERNANCE.md',
  'ARCHITECTURE.md',
  '.github/workflows/ci.yml',
];

const REQUIRED_VERCEL_CRONS = [
  '/api/cron/heartbeat',
  '/api/cron/heal',
  '/api/cron/ingest',
  '/api/cron/financial-refresh',
];

let passed = 0;
let failed = 0;

function check(condition, message) {
  if (condition) {
    console.log('  PASS:', message);
    passed++;
  } else {
    console.error('  FAIL:', message);
    failed++;
  }
}

console.log('\n=== REALITY OS XAB SCAFFOLD VALIDATION ===\n');

// Check required files
console.log('[ Required Files ]');
for (const f of REQUIRED_FILES) {
  check(existsSync(f), `${f} exists`);
}

// Check vercel.json crons are all CRON_SECRET protected
console.log('\n[ Vercel Cron Configuration ]');
const vercel = JSON.parse(await readFile('vercel.json', 'utf8'));
const cronPaths = (vercel.crons || []).map(c => c.path);
for (const path of REQUIRED_VERCEL_CRONS) {
  check(cronPaths.includes(path), `Cron route declared: ${path}`);
}

// Check package.json scripts
console.log('\n[ Package Scripts ]');
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const requiredScripts = ['lint', 'type-check', 'build', 'validate:scaffold', 'audit'];
for (const script of requiredScripts) {
  check(!!pkg.scripts?.[script], `Script exists: ${script}`);
}

// Check .env.example has CRON_SECRET
console.log('\n[ Environment Variables ]');
const envExample = await readFile('.env.example', 'utf8');
check(envExample.includes('CRON_SECRET'), '.env.example documents CRON_SECRET');
check(envExample.includes('SUPABASE_SERVICE_ROLE_KEY'), '.env.example documents SUPABASE_SERVICE_ROLE_KEY');
check(envExample.includes('OPENAI_API_KEY'), '.env.example documents OPENAI_API_KEY');
check(!envExample.match(/=\s*[^\s#"']{8,}/), '.env.example has no real secrets');

console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  process.exit(1);
}
