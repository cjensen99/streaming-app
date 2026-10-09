import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { InFocusRoot } from '../helpers/focusRoot';
import { ContentRail, type ContentRailProps } from '../../components/ContentRail';
import type { TileItem } from '../../types/content';
import { tile } from '../helpers/channels';
import { imageRenders } from '../helpers/mockImage';

jest.mock('../../ui/Image', () => jest.requireActual<object>('../helpers/mockImage'));

beforeEach(() => {
  imageRenders.mockClear();
});

const items = [tile('ABC.us'), tile('CBS.us'), tile('NBC.us')];

const renderRail = (props: Partial<ContentRailProps> = {}) =>
  render(
    <ContentRail
      title="News"
      items={items}
      emptyMessage="Nothing here"
      onSelect={jest.fn()}
      {...props}
    />,
    { wrapper: InFocusRoot },
  );

describe('ContentRail', () => {
  it('shows its title and a tile per channel', async () => {
    await renderRail();

    expect(screen.getByRole('header', { name: 'News' })).toBeOnTheScreen();
    const tiles = screen.getAllByRole('button');
    expect(tiles).toHaveLength(3);
    ['ABC', 'CBS', 'NBC'].forEach((name, index) => expect(tiles[index]).toHaveAccessibleName(name));
  });

  it('passes the selected channel id to onSelect', async () => {
    const onSelect = jest.fn();
    await renderRail({ onSelect });

    await fireEvent.press(screen.getByRole('button', { name: 'CBS' }));

    expect(onSelect).toHaveBeenCalledWith('CBS.us');
  });

  it('shows skeleton tiles while loading', async () => {
    await renderRail({ items: undefined, isLoading: true });

    expect(screen.getByRole('progressbar', { name: 'Loading News' })).toBeOnTheScreen();
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });

  it('shows skeleton tiles while it has no items yet', async () => {
    await renderRail({ items: undefined });

    expect(screen.getByRole('progressbar', { name: 'Loading News' })).toBeOnTheScreen();
  });

  it('shows an inline error with Retry when it failed', async () => {
    const onRetry = jest.fn();
    await renderRail({ items: undefined, isError: true, onRetry });

    expect(screen.getByText("Couldn't load News.")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Retry News' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows the error rather than a skeleton when it failed while loading', async () => {
    await renderRail({ items: undefined, isLoading: true, isError: true });

    expect(screen.getByText("Couldn't load News.")).toBeOnTheScreen();
    expect(screen.queryByRole('progressbar')).not.toBeOnTheScreen();
  });

  it('shows its empty message when it has no items', async () => {
    await renderRail({ items: [] });

    expect(screen.getByText('Nothing here')).toBeOnTheScreen();
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });

  it('renders only the first screens of a long rail', async () => {
    const many: TileItem[] = Array.from({ length: 200 }, (_, i) => tile(`C${i}.us`));
    await renderRail({ items: many });

    const rendered = screen.getAllByRole('button').length;
    expect(rendered).toBeGreaterThan(0);
    expect(rendered).toBeLessThan(50);
  });

  it('does not re-render unchanged tiles when the rail re-renders', async () => {
    const onSelect = jest.fn();
    const { rerender } = await renderRail({ onSelect });
    expect(imageRenders).toHaveBeenCalledTimes(3);

    // A new array with one changed channel: only that tile renders again.
    const next = [items[0] as TileItem, tile('CBS.us', { logoUrl: 'new' }), items[2] as TileItem];
    await rerender(
      <ContentRail title="News" items={next} emptyMessage="Nothing here" onSelect={onSelect} />,
    );

    expect(imageRenders).toHaveBeenCalledTimes(4);
    expect(imageRenders).toHaveBeenLastCalledWith('new');
  });
});
