// Two projects run every test: `tv` resolves files like the TV app (TV-first defaults) and
// `mobile` like the phone app (`Foo.mobile.tsx` wins over `Foo.tsx`), mirroring each app's
// Metro config. A phone-only override can't go untested.
/** @type {import('jest').Config} */
const base = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/__tests__/**/*.test.{ts,tsx}'],
  setupFiles: ['<rootDir>/__tests__/setup.ts'],
  restoreMocks: true,
};

// Jest's defaults, with the phone app's `mobile.*` extensions in front (like its Metro config).
const DEFAULT_EXTENSIONS = ['js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'json', 'node'];
const MOBILE_EXTENSIONS = ['ts', 'tsx', 'js', 'jsx'].map((ext) => `mobile.${ext}`);

/** @type {import('jest').Config} */
module.exports = {
  projects: [
    { ...base, displayName: 'tv' },
    {
      ...base,
      displayName: 'mobile',
      moduleFileExtensions: [...MOBILE_EXTENSIONS, ...DEFAULT_EXTENSIONS],
    },
  ],
};
