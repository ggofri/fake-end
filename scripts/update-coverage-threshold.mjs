#!/usr/bin/env bun

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COVERAGE_INCREMENT = 5;
const CONFIG_FILE = path.join(__dirname, '../src/config/test.ts');

function getCurrentThreshold() {
  const configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
  const match = configContent.match(/COVERAGE:\s*(\d+)/);
  return match ? parseInt(match[1], 10) : 30;
}

function updateThreshold(newThreshold) {
  const configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
  const updatedContent = configContent.replace(
    /COVERAGE:\s*\d+/,
    `COVERAGE: ${newThreshold}`
  );
  fs.writeFileSync(CONFIG_FILE, updatedContent);
  console.log(`✅ Updated coverage threshold from ${getCurrentThreshold()} to ${newThreshold}%`);
}

function getCoverageFromReport() {
  const coverageFile = path.join(__dirname, '../coverage/coverage-summary.json');
  
  if (!fs.existsSync(coverageFile)) {
    console.log('⚠️  No coverage report found. Run tests with coverage first.');
    return null;
  }

  try {
    const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
    const { lines, functions, branches, statements } = coverage.total;
    
    const minCoverage = Math.min(
      lines.pct,
      functions.pct,
      branches.pct,
      statements.pct
    );
    
    return Math.floor(minCoverage);
  } catch (error) {
    console.error('❌ Error reading coverage report:', error.message);
    return null;
  }
}

function main() {
  const currentThreshold = getCurrentThreshold();
  const actualCoverage = getCoverageFromReport();
  
  if (actualCoverage === null) {
    process.exit(1);
  }
  
  console.log(`📊 Current threshold: ${currentThreshold}%`);
  console.log(`📈 Actual coverage: ${actualCoverage}%`);
  
  // Calculate the maximum possible threshold based on actual coverage
  const newThreshold = actualCoverage - (actualCoverage % COVERAGE_INCREMENT);
  
  if (newThreshold > currentThreshold) {
    updateThreshold(newThreshold);
    console.log(`🎉 Coverage improved! New target: ${newThreshold}%`);
  } else {
    const nextMilestone = Math.ceil(currentThreshold / COVERAGE_INCREMENT) * COVERAGE_INCREMENT + COVERAGE_INCREMENT;
    console.log(`✨ Coverage is good at ${actualCoverage}%. Target remains ${currentThreshold}%`);
    console.log(`🎯 Next milestone: ${nextMilestone}%`);
  }
}

if (import.meta.main) {
  main();
}

export { getCurrentThreshold, updateThreshold, getCoverageFromReport };