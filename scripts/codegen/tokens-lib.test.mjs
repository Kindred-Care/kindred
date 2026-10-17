import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkContrast, contrast, flatten, renderTypeScript, resolve } from './tokens-lib.mjs';

const tree = {
  $extensions: {
    kindred: {
      contrastPairs: [
        { foreground: 'color.text', background: 'color.bg', minimum: 4.5, usage: 'body' },
        { foreground: 'color.faint', background: 'color.bg', minimum: 4.5, usage: 'faint' },
      ],
    },
  },
  color: {
    $type: 'color',
    black: { $value: '#000000', $extensions: { kindred: { status: 'approved' } } },
    bg: { $value: '#FFFFFF', $extensions: { kindred: { status: 'approved' } } },
    text: { $value: '{color.black}', $extensions: { kindred: { status: 'approved' } } },
    faint: { $value: '#BBBBBB' },
  },
  space: { $type: 'dimension', md: { $value: '16px' } },
};

test('REQ-PLAT-018 contrast ratios match WCAG reference values', () => {
  assert.equal(contrast('#000000', '#FFFFFF').toFixed(1), '21.0');
  assert.equal(contrast('#777777', '#FFFFFF').toFixed(2), '4.48');
});

test('REQ-PLAT-018 a failing pair is reported', () => {
  const results = checkContrast(tree, resolve(flatten(tree)));
  assert.deepEqual(results.map((r) => r.passes), [true, false]);
});

test('REQ-PLAT-017 aliases resolve, and anything not approved is a placeholder', () => {
  const resolved = resolve(flatten(tree));
  assert.equal(resolved['color.text'].value, '#000000');
  assert.equal(resolved['color.text'].status, 'approved');
  assert.equal(resolved['color.faint'].status, 'placeholder');
  assert.equal(resolved['space.md'].status, 'placeholder');
});

test('REQ-PLAT-017 generated TypeScript is deterministic and lists placeholders', () => {
  const output = renderTypeScript(resolve(flatten(tree)));
  assert.equal(output, renderTypeScript(resolve(flatten(tree))));
  assert.match(output, /"md": 16/);
  assert.match(output, /tokensArePlaceholders = true/);
  assert.match(output, /GENERATED FILE/);
});

test('REQ-PLAT-017 unknown and circular references fail', () => {
  assert.throws(() => resolve(flatten({ a: { $value: '{b}' } })), /Unknown token reference/);
  assert.throws(() => resolve(flatten({ a: { $value: '{b}' }, b: { $value: '{a}' } })), /Circular/);
});
