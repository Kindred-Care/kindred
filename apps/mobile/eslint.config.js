// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const HEX_COLOR = '/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/';

module.exports = defineConfig([
  expoConfig,
  {
    // Generated files are never linted or edited (Section 3, Refinement 2).
    ignores: ['dist/*', 'src/api/generated/**', 'src/design/tokens.ts', 'coverage/**'],
  },
  {
    rules: {
      // Colours come from design tokens only (criterion 3: no inline hex values).
      'no-restricted-syntax': [
        'error',
        {
          selector: `Literal[value=${HEX_COLOR}]`,
          message: 'Use a design token from @/design/theme instead of an inline hex colour.',
        },
        {
          selector: `TemplateElement[value.raw=${HEX_COLOR}]`,
          message: 'Use a design token from @/design/theme instead of an inline hex colour.',
        },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
]);
