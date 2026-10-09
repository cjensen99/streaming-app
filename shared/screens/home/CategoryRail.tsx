import { memo } from 'react';
import { ContentRail } from '../../components/ContentRail';
import type { HomeRail } from '../../hooks/useHomeRails';
import { useRailTiles } from '../../hooks/useRailTiles';

interface CategoryRailProps {
  homeRail: HomeRail;
  onSelect: (channelId: string) => void;
}

/** One of Home's category rails (News, Sports, Movies). Re-renders only when its rail changes. */
export const CategoryRail = memo(function CategoryRail({ homeRail, onSelect }: CategoryRailProps) {
  const { config, rail, isLoading, error, retry } = homeRail;
  const items = useRailTiles(rail);
  return (
    <ContentRail
      title={config.title}
      items={items}
      isLoading={isLoading}
      isError={error !== null}
      onRetry={retry}
      emptyMessage="No channels right now"
      onSelect={onSelect}
      testID={`rail-${config.id}`}
    />
  );
});
