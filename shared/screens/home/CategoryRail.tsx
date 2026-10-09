import { forwardRef, memo, useCallback } from 'react';
import { ContentRail } from '../../components/ContentRail';
import type { FocusRailHandle } from '../../focus/types';
import type { HomeRailKey } from '../../hooks/useHomeFocus';
import type { HomeRail } from '../../hooks/useHomeRails';
import { useRailTiles } from '../../hooks/useRailTiles';

interface CategoryRailProps {
  homeRail: HomeRail;
  onSelect: (channelId: string, rail: HomeRailKey) => void;
}

/** One of Home's category rails (News, Sports, Movies). Re-renders only when its rail changes. */
export const CategoryRail = memo(
  forwardRef<FocusRailHandle, CategoryRailProps>(function CategoryRail(
    { homeRail, onSelect },
    ref,
  ) {
    const { config, rail, isLoading, error, retry } = homeRail;
    const items = useRailTiles(rail);
    const selectTile = useCallback(
      (channelId: string) => onSelect(channelId, config.id),
      [onSelect, config.id],
    );
    return (
      <ContentRail
        ref={ref}
        title={config.title}
        items={items}
        isLoading={isLoading}
        isError={error !== null}
        onRetry={retry}
        emptyMessage="No channels right now"
        onSelect={selectTile}
        testID={`rail-${config.id}`}
      />
    );
  }),
);
