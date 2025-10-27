#!/usr/bin/env node
/**
 * fake-failure.js
 *
 * Creates a minimal fake failed Allure test result JSON so you can test
 * the llm-failure-analysis script locally without running the whole test suite.
 */

const fs = require('fs');
const path = require('path');

const allureDir = path.join(process.cwd(), 'allure-results');
if (!fs.existsSync(allureDir)) fs.mkdirSync(allureDir, { recursive: true });

const uuid = 'fake-failed-1';
const result = {
  uuid: uuid,
  historyId: 'fake_history',
  name: 'Fake failing scenario - LLM test',
  fullName: 'Feature: Fake / Scenario: LLM test',
  status: 'failed',
  stage: 'finished',
  start: Date.now() - 5000,
  stop: Date.now(),
  labels: [ { name: 'feature', value: 'Fake Feature' } ],
  parameters: [],
  steps: [
    { name: 'Given I do something', status: 'passed' },
    { name: 'When I trigger failure', status: 'failed', statusDetails: { message: 'TypeError: foo is not a function', trace: 'TypeError: foo is not a function\n    at Object.<anonymous> (test.js:10:15)' } }
  ],
  attachments: [],
  statusDetails: { message: 'TypeError: foo is not a function', trace: 'TypeError: foo is not a function\n    at Object.<anonymous> (test.js:10:15)' }
};

const filePath = path.join(allureDir, `${uuid}-result.json`);
fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf8');
console.log('Wrote fake failed result to', filePath);
console.log('Now run: node .github/scripts/llm-failure-analysis.js --allure-dir=allure-results --model=llama2');
