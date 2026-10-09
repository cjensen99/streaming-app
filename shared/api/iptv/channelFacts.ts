import type { ChannelMetadata, ChannelSummary } from '../../types/content';

/** One labelled fact on the Detail screen, e.g. `Network: ABC`. */
export interface ChannelFact {
  label: string;
  value: string;
}

/**
 * The facts Detail lists for a channel, in display order, leaving out any that are unknown.
 * The website isn't included: it's shown on its own (a link on phones).
 */
export function channelFacts(summary: ChannelSummary, metadata?: ChannelMetadata): ChannelFact[] {
  const launchYear = metadata?.launched?.slice(0, 4);
  const facts: [string, string | undefined][] = [
    ['Country', metadata?.country],
    ['Categories', summary.categories.join(', ') || undefined],
    ['Network', metadata?.network],
    ['On air since', launchYear && /^\d{4}$/.test(launchYear) ? launchYear : undefined],
    ['Quality', summary.quality],
  ];
  return facts.flatMap(([label, value]) => (value ? [{ label, value }] : []));
}
