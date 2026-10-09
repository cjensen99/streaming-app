import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { InFocusRoot } from '../helpers/focusRoot';
import { ContentTile } from '../../components/ContentTile';
import { channel, tile } from '../helpers/channels';
import { imageRenders } from '../helpers/mockImage';

jest.mock('../../ui/Image', () => jest.requireActual<object>('../helpers/mockImage'));

beforeEach(() => {
  imageRenders.mockClear();
});

describe('ContentTile', () => {
  it('shows the logo and the name, and is labelled with the name', async () => {
    await render(<ContentTile item={tile('CNN.us')} onSelect={jest.fn()} />, {
      wrapper: InFocusRoot,
    });

    expect(screen.getByTestId('logo-CNN.us')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'CNN' })).toBeOnTheScreen();
  });

  it('calls onSelect with the channel id', async () => {
    const onSelect = jest.fn();
    await render(<ContentTile item={tile('CNN.us')} onSelect={onSelect} />, {
      wrapper: InFocusRoot,
    });

    await fireEvent.press(screen.getByRole('button', { name: 'CNN' }));

    expect(onSelect).toHaveBeenCalledWith('CNN.us');
  });

  it('shows the name on the card when the channel has no logo', async () => {
    await render(
      <ContentTile item={tile('CNN.us', { logoUrl: undefined })} onSelect={jest.fn()} />,
      { wrapper: InFocusRoot },
    );

    expect(screen.queryByTestId('logo-CNN.us')).not.toBeOnTheScreen();
    expect(screen.getAllByText('CNN')).toHaveLength(2); // on the card and underneath
  });

  it('falls back to the name on the card when the logo fails to load', async () => {
    await render(<ContentTile item={tile('CNN.us')} onSelect={jest.fn()} />, {
      wrapper: InFocusRoot,
    });

    await fireEvent(screen.getByTestId('logo-CNN.us'), 'error');

    expect(screen.queryByTestId('logo-CNN.us')).not.toBeOnTheScreen();
    expect(screen.getAllByText('CNN')).toHaveLength(2);
  });

  it('shows an unavailable channel generically, still selectable (to remove it)', async () => {
    const onSelect = jest.fn();
    await render(
      <ContentTile item={{ status: 'unavailable', id: 'Gone.us' }} onSelect={onSelect} />,
      { wrapper: InFocusRoot },
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Unavailable channel' }));

    expect(onSelect).toHaveBeenCalledWith('Gone.us');
  });

  it('shows a pending channel as a placeholder that cannot be selected', async () => {
    await render(
      <ContentTile item={{ status: 'pending', id: 'Later.us' }} onSelect={jest.fn()} />,
      { wrapper: InFocusRoot },
    );

    expect(screen.getByRole('progressbar', { name: 'Loading channel' })).toBeOnTheScreen();
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });

  it('does not re-render when its parent re-renders with the same props', async () => {
    const item = tile('CNN.us');
    const onSelect = jest.fn();
    const { rerender } = await render(<ContentTile item={item} onSelect={onSelect} />, {
      wrapper: InFocusRoot,
    });
    expect(imageRenders).toHaveBeenCalledTimes(1);

    await rerender(<ContentTile item={item} onSelect={onSelect} />);

    expect(imageRenders).toHaveBeenCalledTimes(1);
  });

  it('does not re-render for a new item object that shows the same channel', async () => {
    const onSelect = jest.fn();
    const item = tile('CNN.us');
    const { rerender } = await render(<ContentTile item={item} onSelect={onSelect} />, {
      wrapper: InFocusRoot,
    });

    // e.g. useMyList rebuilding its items after another channel was added
    await rerender(<ContentTile item={{ ...item }} onSelect={onSelect} />);

    expect(imageRenders).toHaveBeenCalledTimes(1);
  });

  it('re-renders when it becomes available', async () => {
    const onSelect = jest.fn();
    const { rerender } = await render(
      <ContentTile item={{ status: 'pending', id: 'CNN.us' }} onSelect={onSelect} />,
      { wrapper: InFocusRoot },
    );

    await rerender(<ContentTile item={tile('CNN.us')} onSelect={onSelect} />);

    expect(screen.getByRole('button', { name: 'CNN' })).toBeOnTheScreen();
  });

  it('re-renders when its channel changes', async () => {
    const onSelect = jest.fn();
    const { rerender } = await render(<ContentTile item={tile('CNN.us')} onSelect={onSelect} />, {
      wrapper: InFocusRoot,
    });

    await rerender(
      <ContentTile
        item={{ status: 'available', id: 'CNN.us', channel: channel('CNN.us', { logoUrl: 'new' }) }}
        onSelect={onSelect}
      />,
    );

    expect(imageRenders).toHaveBeenLastCalledWith('new');
  });
});
