import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forbiddenModules } from './check-bundle-deps.mjs';

test('REQ-PLAT-019 build-time-only packages in a bundle are caught', () => {
  const sources = [
    '/node_modules/react-native/index.js',
    '/node_modules/expo-modules-core/build/uuid/index.js',
    '/node_modules/node-forge/lib/rsa.js',
    '/node_modules/@expo/metro/node_modules/braces/index.js',
    '/node_modules/uuid/dist/cjs/v4.js',
  ];
  assert.deepEqual(forbiddenModules(sources), [
    '/node_modules/node-forge/lib/rsa.js',
    '/node_modules/@expo/metro/node_modules/braces/index.js',
    '/node_modules/uuid/dist/cjs/v4.js',
  ]);
});

test('REQ-PLAT-019 a clean bundle passes', () => {
  assert.deepEqual(forbiddenModules(['/node_modules/react/index.js', 'app/(auth)/index.tsx']), []);
});
