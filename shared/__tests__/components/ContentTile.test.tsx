import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ContentTile } from '../../components/ContentTile';
import { channel, tile } from '../helpers/channels';
import { imageRenders } from '../helpers/mockImage';

jest.mock('../../ui/Image', () => jest.requireActual<object>('../helpers/mockImage'));

beforeEach(() => {
  imageRenders.mockClear();
});

describe('ContentTile', () => {
  it('shows the logo and the name, and is labelled with the name', async () => {
    await render(<ContentTile item={tile('CNN.us')} onSelect={jest.fn()} />);

    expect(screen.getByTestId('tile-logo-CNN.us')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'CNN' })).toBeOnTheScreen();
  });

  it('calls onSelect with the channel id', async () => {
    const onSelect = jest.fn();
    await render(<ContentTile item={tile('CNN.us')} onSelect={onSelect} />);

    await fireEvent.press(screen.getByRole('button', { name: 'CNN' }));

    expect(onSelect).toHaveBeenCalledWith('CNN.us');
  });

  it('shows the name on the card when the channel has no logo', async () => {
    await render(
      <ContentTile item={tile('CNN.us', { logoUrl: undefined })} onSelect={jest.fn()} />,
    );

    expect(screen.queryByTestId('tile-logo-CNN.us')).not.toBeOnTheScreen();
    expect(screen.getAllByText('CNN')).toHaveLength(2); // on the card and underneath
  });

  it('falls back to the name on the card when the logo fails to load', async () => {
    await render(<ContentTile item={tile('CNN.us')} onSelect={jest.fn()} />);

    await fireEvent(screen.getByTestId('tile-logo-CNN.us'), 'error');

    expect(screen.queryByTestId('tile-logo-CNN.us')).not.toBeOnTheScreen();
    expect(screen.getAllByText('CNN')).toHaveLength(2);
  });

  it('shows an unavailable channel generically, still selectable (to remove it)', async () => {
    const onSelect = jest.fn();
    await render(
      <ContentTile item={{ status: 'unavailable', id: 'Gone.us' }} onSelect={onSelect} />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Unavailable channel' }));

    expect(onSelect).toHaveBeenCalledWith('Gone.us');
  });

  it('shows a pending channel as a placeholder that cannot be selected', async () => {
    await render(<ContentTile item={{ status: 'pending', id: 'Later.us' }} onSelect={jest.fn()} />);

    expect(screen.getByRole('progressbar', { name: 'Loading channel' })).toBeOnTheScreen();
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });

  it('does not re-render when its parent re-renders with the same props', async () => {
    const item = tile('CNN.us');
    const onSelect = jest.fn();
    const { rerender } = await render(<ContentTile item={item} onSelect={onSelect} />);
    expect(imageRenders).toHaveBeenCalledTimes(1);

    await rerender(<ContentTile item={item} onSelect={onSelect} />);

    expect(imageRenders).toHaveBeenCalledTimes(1);
  });

  it('re-renders when its channel changes', async () => {
    const onSelect = jest.fn();
    const { rerender } = await render(<ContentTile item={tile('CNN.us')} onSelect={onSelect} />);

    await rerender(
      <ContentTile
        item={{ status: 'available', id: 'CNN.us', channel: channel('CNN.us', { logoUrl: 'new' }) }}
        onSelect={onSelect}
      />,
    );

    expect(imageRenders).toHaveBeenLastCalledWith('new');
  });
});
