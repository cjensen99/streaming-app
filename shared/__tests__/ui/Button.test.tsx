import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '../../ui/Button';

describe('Button', () => {
  it('is labelled with its text and calls onSelect', async () => {
    const onSelect = jest.fn();
    await render(<Button label="Add to My List" onSelect={onSelect} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Add to My List' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('uses a separate accessibility label when given', async () => {
    await render(<Button label="Retry" accessibilityLabel="Retry News" onSelect={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Retry News' })).toBeOnTheScreen();
  });

  it('does nothing when disabled, and says so to screen readers', async () => {
    const onSelect = jest.fn();
    await render(<Button label="Play" disabled onSelect={onSelect} />);

    const button = screen.getByRole('button', { name: 'Play' });
    await fireEvent.press(button);

    expect(onSelect).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });
});
