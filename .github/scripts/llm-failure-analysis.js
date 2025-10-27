#!/usr/bin/env node
/**
 * llm-failure-analysis.js
 *
 * - Scans `allure-results` for failed test result JSON files
 * - For each failed test, prepares a prompt and calls Ollama (HTTP or CLI)
 * - Writes analysis output to `allure-results/<test-uuid>-llm-analysis.txt`
 * - Adds an attachment entry to the corresponding test JSON so Allure shows it
 *
 * Usage:
 *  node .github/scripts/llm-failure-analysis.js --allure-dir=allure-results --model=llama2
 *
 * Environment variables:
 *  OLLAMA_URL (optional) - if set, the script will POST to ${OLLAMA_URL}/api/generate
 *
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const DEFAULT_ALLURE_DIR = 'allure-results';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  args.forEach(a => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  });
  return out;
}

async function callOllamaHttp(ollamaUrl, apiPath, model, prompt, maxTokens = 800) {
  const base = ollamaUrl.replace(/\/$/, '');
  const url = (apiPath || '/api/generate').startsWith('/') ? base + (apiPath || '/api/generate') : base + '/' + apiPath;
  const body = { model, prompt, max_tokens: Number(maxTokens) || 800 };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Ollama HTTP error ${res.status} ${res.statusText}`);
    const text = await res.text();
    // Try to parse JSON first. Ollama may return text; if JSON parse fails, return raw text
    try { return JSON.parse(text); } catch (e) { return { raw: text }; }
  } catch (err) {
    throw new Error('Ollama HTTP call failed: ' + err.message);
  }
}

function callOllamaCli(model, prompt, maxTokens = 800) {
  // Use ollama CLI if available. We pass prompt on stdin to avoid quoting issues.
  try {
    const child = spawnSync('ollama', ['generate', model, '--max-tokens', String(maxTokens)], {
      input: prompt,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    });
    if (child.error) throw child.error;
    if (child.status !== 0) throw new Error(child.stderr || 'ollama CLI failed');
    return child.stdout;
  } catch (err) {
    throw new Error('Ollama CLI call failed: ' + err.message);
  }
}

function findFailedResults(allureDir) {
  if (!fs.existsSync(allureDir)) return [];
  const files = fs.readdirSync(allureDir).filter(f => f.endsWith('.json'));
  const failed = [];
  files.forEach(file => {
    const p = path.join(allureDir, file);
    try {
      const json = JSON.parse(fs.readFileSync(p, 'utf8'));
      // Allure test result JSON typically has status field
      if (json.status && (json.status === 'failed' || json.status === 'broken')) {
        failed.push({ file: p, json });
      }
    } catch (e) {
      // ignore parse errors
    }
  });
  return failed;
}

function buildPrompt(test) {
  const lines = [];
  lines.push('You are an expert Playwright + Cucumber engineer.');
  lines.push('Analyze the failing test and provide a concise JSON with keys: summary, probable_root_cause, confidence, suggested_fix, immediate_workaround, files_to_change (array), allure_attachment (markdown string).');
  lines.push('Do not include secrets. Keep suggested_fix short and actionable.');
  lines.push('---');
  lines.push(`Test name: ${test.json.name || 'Unknown'}`);
  if (test.json.fullName) lines.push(`Full name: ${test.json.fullName}`);
  if (test.json.statusDetails && test.json.statusDetails.message) {
    lines.push('Error message:');
    lines.push(test.json.statusDetails.message);
  }
  if (Array.isArray(test.json.steps) && test.json.steps.length > 0) {
    lines.push('Steps:');
    test.json.steps.forEach((s, i) => {
      const status = s.status || 'unknown';
      lines.push(`${i + 1}. ${s.name || '<step>'} - ${status}`);
      if (s.status === 'failed' && s.statusDetails && s.statusDetails.message) {
        lines.push('   Step error: ' + s.statusDetails.message);
      }
    });
  }
  // Include any statusDetails.trace if present
  if (test.json.statusDetails && test.json.statusDetails.trace) {
    lines.push('Stack trace:');
    lines.push(test.json.statusDetails.trace.toString().slice(0, 3000));
  }
  lines.push('---');
  lines.push('Provide the JSON only.');
  return lines.join('\n');
}

async function analyzeFailures(opts) {
  const allureDir = opts.allureDir || DEFAULT_ALLURE_DIR;
  const model = opts.model || 'llama2';
  const ollamaUrl = opts.ollamaUrl || process.env.OLLAMA_URL || process.env.OLLAMA_HOST;
  const maxTokens = opts.maxTokens || 800;

  const failures = findFailedResults(allureDir);
  if (failures.length === 0) {
    console.log('No failed tests found in', allureDir);
    return 0;
  }

  console.log(`Found ${failures.length} failed test(s).`);

  for (const f of failures) {
    const uuid = path.basename(f.file).replace(/[^a-zA-Z0-9._-]/g, '_');
    const analysisFileName = `${uuid}-llm-analysis.txt`;
    const analysisPath = path.join(allureDir, analysisFileName);

    const prompt = buildPrompt(f);
    console.log(`Analyzing: ${f.json.name || uuid} ...`);
    let analysisText = '';
    try {
      if (ollamaUrl) {
        const apiPath = opts.apiPath || '/api/generate';
        console.log('Calling Ollama HTTP API at', ollamaUrl, 'path', apiPath);
        // eslint-disable-next-line no-undef
        const res = await callOllamaHttp(ollamaUrl, apiPath, model, prompt, maxTokens);
        // normalize: if response is object with text/output fields, pick best
        if (typeof res === 'string') analysisText = res;
        else if (res.output) analysisText = Array.isArray(res.output) ? res.output.join('\n') : String(res.output);
        else if (res.text) analysisText = res.text;
        else if (res.raw) analysisText = res.raw;
        else analysisText = JSON.stringify(res, null, 2);
      } else {
        console.log('Calling Ollama CLI (ollama generate) for model', model);
        const cliOut = callOllamaCli(model, prompt, maxTokens);
        // attempt to parse JSON from CLI output
        try { analysisText = JSON.parse(cliOut); analysisText = JSON.stringify(analysisText, null, 2); } catch (_) { analysisText = cliOut; }
      }
    } catch (err) {
      console.error('LLM call failed for', uuid, ':', err.message);
      analysisText = `LLM call failed: ${err.message}`;
    }

    // If analysisText looks like JSON string, try to pretty-print and validate
    if (typeof analysisText !== 'string') analysisText = JSON.stringify(analysisText, null, 2);
    let pretty = analysisText;
    try {
      const parsed = JSON.parse(analysisText);
      // If the model returned a non-JSON wrapper like { output: '...' }, try to extract fields
      if (parsed && (parsed.summary || parsed.probable_root_cause || parsed.allure_attachment)) {
        pretty = JSON.stringify(parsed, null, 2);
      } else if (parsed && parsed.raw) {
        pretty = parsed.raw;
      } else {
        // keep pretty as JSON string
        pretty = JSON.stringify(parsed, null, 2);
      }
    } catch (e) {
      // not valid JSON, keep raw text
      pretty = analysisText;
    }

    analysisText = pretty;

    // Save analysis text
    fs.writeFileSync(analysisPath, analysisText, 'utf8');
    console.log('Wrote analysis to', analysisPath);

    // Add attachment record to test JSON
    try {
      const json = f.json;
      json.attachments = json.attachments || [];
      // Avoid duplicate attachments
      const already = json.attachments.find(a => a.source === analysisFileName);
      if (!already) {
        json.attachments.push({ name: 'LLM failure analysis', source: analysisFileName, type: 'text/plain' });
        fs.writeFileSync(f.file, JSON.stringify(json, null, 2), 'utf8');
        console.log('Updated test JSON with analysis attachment:', f.file);
      } else {
        console.log('Attachment already present for', f.file);
      }
    } catch (e) {
      console.error('Failed to attach analysis to', f.file, e.message);
    }
  }

  return 0;
}

// Run
(async () => {
  try {
    const args = parseArgs();
    const opts = {
      allureDir: args['allure-dir'] || args.allureDir || DEFAULT_ALLURE_DIR,
      model: args.model || 'llama2',
      ollamaUrl: args['ollama-url'] || process.env.OLLAMA_URL,
      maxTokens: args['max-tokens'] || args.maxTokens || 800,
    };

    // Ensure global fetch exists (Node 18+). If not, require node-fetch.
    if (typeof fetch === 'undefined') {
      try {
        global.fetch = (...p) => import('node-fetch').then(m => m.default(...p));
      } catch (_) { /* ignore */ }
    }

    const code = await analyzeFailures(opts);
    process.exit(code);
  } catch (err) {
    console.error('Error in llm-failure-analysis:', err);
    process.exit(2);
  }
})();
