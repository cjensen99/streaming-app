import type { ChannelMetadata, ChannelSummary } from '../../types/content';

/**
 * iptv-org has no description field, so Detail's description is built from what's known.
 * Every part is optional, so there's always a sensible sentence:
 *
 *   "ABC News Live is a news channel from ABC, on air since 2014."
 *   "Bloomberg TV is a business and news channel."
 *   "Some Channel is a live TV channel."
 */

/** `"a"` or `"an"` for the next word. */
const article = (word: string) => (/^[aeiou]/i.test(word) ? 'an' : 'a');

function joinWithAnd(words: string[]): string {
  if (words.length <= 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}

export function describeChannel(summary: ChannelSummary, metadata?: ChannelMetadata): string {
  const kind =
    joinWithAnd(summary.categories.map((category) => category.toLowerCase())) || 'live TV';
  const details: string[] = [];
  if (metadata?.network) details.push(`from ${metadata.network}`);
  const launchYear = metadata?.launched?.slice(0, 4);
  if (launchYear && /^\d{4}$/.test(launchYear)) details.push(`on air since ${launchYear}`);

  const extra = details.length > 0 ? ` ${details.join(', ')}` : '';
  return `${summary.name} is ${article(kind)} ${kind} channel${extra}.`;
}
