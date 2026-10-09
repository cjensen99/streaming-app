import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { InFocusRoot } from '../helpers/focusRoot';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { NotConnectedState } from '../../components/NotConnectedState';

describe('ErrorState', () => {
  it('calls onRetry when Retry is pressed', async () => {
    const onRetry = jest.fn();
    await render(<ErrorState message="The rails didn't load." onRetry={onRetry} />, {
      wrapper: InFocusRoot,
    });

    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
    expect(screen.getByText("The rails didn't load.")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('has no button without onRetry', async () => {
    await render(<ErrorState title="Channel not found" />, { wrapper: InFocusRoot });

    expect(screen.getByText('Channel not found')).toBeOnTheScreen();
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });
});

describe('EmptyState', () => {
  it('shows its message', async () => {
    await render(<EmptyState message="No channels in My List yet" />, { wrapper: InFocusRoot });

    expect(screen.getByText('No channels in My List yet')).toBeOnTheScreen();
  });
});

describe('LoadingState', () => {
  it('labels the spinner for screen readers', async () => {
    await render(<LoadingState message="Loading channels" />, { wrapper: InFocusRoot });

    expect(screen.getByLabelText('Loading channels')).toBeOnTheScreen();
  });
});

describe('NotConnectedState', () => {
  it('says there is no connection, with nothing to press', async () => {
    await render(<NotConnectedState />, { wrapper: InFocusRoot });

    expect(screen.getByText('No internet connection')).toBeOnTheScreen();
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });
});
