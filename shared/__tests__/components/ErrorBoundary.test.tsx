import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { InFocusRoot } from '../helpers/focusRoot';
import { Text } from 'react-native';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { logger } from '../../utils/logger';
import { isPhoneBuild } from '../helpers/formFactor';

let shouldThrow = true;

function Flaky() {
  if (shouldThrow) throw new Error('Boom');
  return <Text>Recovered</Text>;
}

beforeEach(() => {
  shouldThrow = true;
  // React reports caught render errors on the console too.
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('ErrorBoundary', () => {
  it('renders its children when nothing throws', async () => {
    shouldThrow = false;
    await render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
      { wrapper: InFocusRoot },
    );

    expect(screen.getByText('Recovered')).toBeOnTheScreen();
  });

  it('shows an error screen and logs the error when a child throws', async () => {
    const logError = jest.spyOn(logger, 'error').mockImplementation(() => undefined);
    await render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
      { wrapper: InFocusRoot },
    );

    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
    expect(logError).toHaveBeenCalledWith(
      'Unexpected render error',
      expect.objectContaining({ error: expect.objectContaining({ message: 'Boom' }) }),
    );
  });

  it('can be used with the remote: its own focus area, with Try again focused (TVs)', async () => {
    jest.spyOn(logger, 'error').mockImplementation(() => undefined);
    // No focus root around it, as in the app (the screens' roots are gone when it shows).
    await render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    );

    const tryAgain = screen.getByRole('button', { name: 'Try again' });
    if (!isPhoneBuild) expect(tryAgain).toBeSelected();
  });

  it('renders the children again on "Try again"', async () => {
    jest.spyOn(logger, 'error').mockImplementation(() => undefined);
    await render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
      { wrapper: InFocusRoot },
    );

    shouldThrow = false;
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));

    expect(screen.getByText('Recovered')).toBeOnTheScreen();
  });
});
