/**
 * App-wide logging. Development builds log everything; release builds keep only warnings and
 * errors. Crash reporting (e.g. Sentry) would hook into `error` here, in one place.
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

const RANK: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL: Level = __DEV__ ? 'debug' : 'warn';

function log(level: Level, message: string, context?: unknown): void {
  if (RANK[level] < RANK[MIN_LEVEL]) return;
  const args =
    context === undefined ? [`[${level}] ${message}`] : [`[${level}] ${message}`, context];
  if (level === 'debug') console.log(...args);
  else console[level](...args);
}

export const logger = {
  debug: (message: string, context?: unknown) => log('debug', message, context),
  info: (message: string, context?: unknown) => log('info', message, context),
  warn: (message: string, context?: unknown) => log('warn', message, context),
  error: (message: string, context?: unknown) => log('error', message, context),
};
