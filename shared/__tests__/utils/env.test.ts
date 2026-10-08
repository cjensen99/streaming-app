import { describe, expect, it, jest } from '@jest/globals';
import type * as EnvModuleNs from '../../utils/env';
import type * as LoggerModuleNs from '../../utils/logger';

type EnvModule = typeof EnvModuleNs;
type LoggerModule = typeof LoggerModuleNs;

/** Loads a fresh copy of `utils/env`, with `extra` as the app config's `extra` field. */
function loadEnvWithExtra(extra: Record<string, unknown> | undefined): EnvModule['env'] {
  let env: EnvModule['env'] | undefined;
  jest.isolateModules(() => {
    jest.doMock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { extra } } }));
    const { logger } = jest.requireActual<LoggerModule>('../../utils/logger');
    jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
    env = jest.requireActual<EnvModule>('../../utils/env').env;
  });
  if (!env) throw new Error('utils/env failed to load');
  return env;
}

describe('env', () => {
  it.each(['development', 'preview', 'production'] as const)(
    'reads the %s variant from the app config',
    (variant) => {
      expect(loadEnvWithExtra({ variant }).variant).toBe(variant);
    },
  );

  it('falls back to development for a missing or unknown variant', () => {
    expect(loadEnvWithExtra(undefined).variant).toBe('development');
    expect(loadEnvWithExtra({ variant: 'staging' }).variant).toBe('development');
  });
});
