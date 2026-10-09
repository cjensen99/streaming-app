// @ts-check
const { defineConfig } = require('eslint/config');
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const prettier = require('eslint-config-prettier');
const globals = require('globals');

/**
 * Architectural import boundaries (see README → Conventions).
 *
 * Each restriction is either allowed only in some `shared/` directories (`allowedIn`) or
 * forbidden only in some (`forbiddenIn`). Flat config replaces — not merges — a rule's options
 * when several blocks match a file, so one `no-restricted-imports` block is generated per
 * `shared/` directory with exactly the restrictions that apply there. Everything else (apps,
 * root files, unknown `shared/` directories) gets every allow-list restriction.
 */
const SHARED_DIRS = [
  'api',
  'components',
  'focus',
  'hooks',
  'input',
  'player',
  'screens',
  'state',
  'types',
  'ui',
  'utils',
];

/** @param {string} pkg */
const pkgRegex = (pkg) => `^${pkg.replace(/[/.]/g, '\\$&')}(/.*)?$`;

/**
 * @typedef {{ name: string, importNames?: string[], message: string }} RestrictedPath
 * @typedef {{ regex: string, message: string }} RestrictedPattern
 * @typedef {{ paths?: RestrictedPath[], patterns?: RestrictedPattern[] }
 *   & ({ allowedIn: string[] } | { forbiddenIn: string[] })} Restriction
 * @type {Restriction[]}
 */
const RESTRICTIONS = [
  {
    allowedIn: ['focus'],
    patterns: [
      {
        regex: pkgRegex('react-tv-space-navigation'),
        message: 'Spatial navigation is wrapped by shared/focus/. Import from there instead.',
      },
    ],
  },
  {
    allowedIn: ['player'],
    patterns: [
      {
        regex: pkgRegex('react-native-video'),
        message: 'Video playback is wrapped by shared/player/. Import from there instead.',
      },
    ],
  },
  {
    allowedIn: ['input'],
    paths: [
      {
        name: 'react-native',
        importNames: ['TVEventHandler', 'useTVEventHandler', 'BackHandler', 'TVEventControl'],
        message: 'Remote/hardware key handling goes through the dispatcher in shared/input/.',
      },
    ],
  },
  {
    allowedIn: ['state'],
    patterns: [
      {
        regex: pkgRegex('zustand'),
        message: 'Zustand stores live in shared/state/. Read them through hooks in shared/hooks/.',
      },
    ],
  },
  {
    allowedIn: ['api', 'hooks'],
    patterns: [
      {
        regex: pkgRegex('@tanstack/react-query'),
        message: 'React Query is used only in shared/api/ and shared/hooks/.',
      },
    ],
  },
  {
    allowedIn: ['utils'],
    patterns: [
      {
        regex: pkgRegex('@react-native-async-storage/async-storage'),
        message: 'AsyncStorage is wrapped by shared/utils/storage.ts. Import that instead.',
      },
      {
        regex: pkgRegex('@react-native-community/netinfo'),
        message: 'NetInfo is wrapped by shared/utils/network.ts. Import that instead.',
      },
    ],
  },
  // `@app/config` is build-time Node code. Its one runtime-safe file is the plain-JSON brand,
  // which the design tokens import so the in-app and splash backgrounds can't drift.
  {
    forbiddenIn: SHARED_DIRS.filter((dir) => dir !== 'ui'),
    patterns: [
      {
        regex: pkgRegex('@app/config'),
        message: '@app/config is build-time only. Use the design tokens in shared/ui/.',
      },
    ],
  },
  {
    forbiddenIn: ['ui'],
    patterns: [
      {
        regex: '^@app/config(?!/brand\\.json$)',
        message:
          'Only @app/config/brand.json may be bundled; the rest of @app/config is Node code.',
      },
    ],
  },
  {
    forbiddenIn: ['api', 'types'],
    patterns: [
      {
        regex: pkgRegex('react-native'),
        message: 'shared/api/ and shared/types/ must stay platform-agnostic (no react-native).',
      },
    ],
  },
];

/** @param {Restriction} r @param {string | null} dir `null` = outside any known shared dir */
const appliesTo = (r, dir) =>
  'allowedIn' in r
    ? dir === null || !r.allowedIn.includes(dir)
    : dir !== null && r.forbiddenIn.includes(dir);

/** @param {string | null} dir */
const importRuleFor = (dir) => {
  const active = RESTRICTIONS.filter((r) => appliesTo(r, dir));
  return [
    'error',
    {
      paths: active.flatMap((r) => r.paths ?? []),
      patterns: active.flatMap((r) => r.patterns ?? []),
    },
  ];
};

const HEX_COLOR = '/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/';
const HEX_COLOR_MESSAGE = 'Raw hex colours are only allowed in shared/ui/. Use a design token.';

module.exports = defineConfig(
  {
    ignores: [
      '**/node_modules/',
      '**/coverage/',
      '**/.expo/',
      '**/dist/',
      'apps/*/android/',
      'apps/*/ios/',
    ],
  },

  js.configs.recommended,

  // TypeScript with type information.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },

  // Node-run config files (eslint, metro, babel, jest, app.config…).
  {
    files: ['**/*.{js,cjs,mjs}', '**/*.config.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.{js,cjs}'],
    languageOptions: { sourceType: 'commonjs' },
  },

  // React (e.g. `jsx-key` for list items) and React hooks.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      react.configs.flat.recommended,
      // React 17+ JSX transform: no `import React` needed in every file.
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
    ],
    settings: { react: { version: 'detect' } },
    rules: {
      // TypeScript types the props; runtime PropTypes would duplicate them.
      'react/prop-types': 'off',
      'react-hooks/exhaustive-deps': 'error',
    },
  },

  // Import boundaries: default (apps, root, anything not in a known shared dir)...
  {
    files: ['**/*.{ts,tsx,js}'],
    rules: { 'no-restricted-imports': importRuleFor(null) },
  },
  // ...then one block per shared directory.
  ...SHARED_DIRS.map((dir) => ({
    files: [`shared/${dir}/**/*.{ts,tsx,js}`],
    rules: { 'no-restricted-imports': importRuleFor(dir) },
  })),
  // Tests may reach into any layer to set up and mock it.
  {
    files: ['shared/__tests__/**'],
    rules: { 'no-restricted-imports': 'off' },
  },

  // No raw hex colours outside the design system.
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['shared/ui/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: `Literal[value=${HEX_COLOR}]`, message: HEX_COLOR_MESSAGE },
        { selector: `TemplateElement[value.raw=${HEX_COLOR}]`, message: HEX_COLOR_MESSAGE },
      ],
    },
  },

  // Must stay last: turns off stylistic rules that conflict with Prettier.
  prettier,
);
