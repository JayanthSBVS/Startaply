import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cssPath = path.join(__dirname, '..', 'src', 'styles', 'index.css');
const htmlPath = path.join(__dirname, '..', 'index.html');

test('Design Tokens in index.css', (t) => {
  const css = fs.readFileSync(cssPath, 'utf8');

  t.test('Required light semantic CSS variables exist', () => {
    assert.match(css, /--color-bg:/);
    assert.match(css, /--color-surface:/);
    assert.match(css, /--color-brand:/);
    assert.match(css, /--color-brand:\s*#047857/i, 'Light brand should be #047857');
    assert.match(css, /--color-brand-hover:\s*#065F46/i, 'Light brand hover should be #065F46');
  });

  t.test('Required dark semantic CSS variables exist', () => {
    const darkBlockMatch = css.match(/\.dark\s*\{([^}]+)\}/);
    assert.ok(darkBlockMatch, 'Should have .dark block');
    const darkBlock = darkBlockMatch[1];
    
    assert.match(darkBlock, /--color-bg:/);
    assert.match(darkBlock, /--color-brand:\s*#10B981/i, 'Dark brand should be #10B981');
  });

  t.test('Motion duration/easing variables exist', () => {
    assert.match(css, /--duration-instant:/);
    assert.match(css, /--ease-standard:/);
  });

  t.test('Navigation height/safe-area variables exist', () => {
    assert.match(css, /--nav-height:/);
    assert.match(css, /--safe-area-bottom:/);
  });

  t.test('index.css contains no fonts.googleapis.com @import', () => {
    assert.doesNotMatch(css, /@import url\(['"]https:\/\/fonts\.googleapis\.com/);
  });

  t.test('Required compatibility aliases remain', () => {
    assert.match(css, /--bg-base:/);
    assert.match(css, /--text-primary:/);
  });
});

test('Font loading in index.html', (t) => {
  const html = fs.readFileSync(htmlPath, 'utf8');

  t.test('index.html contains Inter once', () => {
    const matches = html.match(/family=Inter/g);
    assert.ok(matches && matches.length === 1, 'Should load Inter exactly once');
  });

  t.test('index.html contains no Poppins', () => {
    assert.doesNotMatch(html, /Poppins/i, 'Should not load Poppins');
  });
});
