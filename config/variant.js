// @ts-check
/// <reference types="node" />
/**
 * Build variants. `APP_VARIANT` (set by EAS profiles, or by hand) selects one; the default is
 * `development`. Each variant gets its own app name and bundle ID so all three can be installed
 * side by side.
 */

/** @typedef {'development' | 'preview' | 'production'} Variant */

/** @type {Record<Variant, string>} */
const NAME_SUFFIX = { development: ' (Dev)', preview: ' (Preview)', production: '' };

/** @type {Record<Variant, string>} */
const ID_SUFFIX = { development: '.dev', preview: '.preview', production: '' };

/**
 * Reads and validates `APP_VARIANT`. Throws on unknown values so a typo can't produce a
 * production-looking build.
 *
 * @returns {Variant}
 */
function readVariant() {
  // `unknown`: expo-modules-core types every `process.env` key as `any`.
  /** @type {unknown} */
  const value = process.env.APP_VARIANT ?? 'development';
  if (value === 'development' || value === 'preview' || value === 'production') return value;
  throw new Error(
    `Unknown APP_VARIANT "${String(value)}" (expected development | preview | production)`,
  );
}

/**
 * Applies the current variant to an app's base identity.
 *
 * @param {{ name: string, bundleId: string }} base Production name and bundle ID.
 * @returns {{ variant: Variant, name: string, bundleId: string }}
 */
function variantIdentity(base) {
  const variant = readVariant();
  return {
    variant,
    name: `${base.name}${NAME_SUFFIX[variant]}`,
    bundleId: `${base.bundleId}${ID_SUFFIX[variant]}`,
  };
}

module.exports = { readVariant, variantIdentity };
