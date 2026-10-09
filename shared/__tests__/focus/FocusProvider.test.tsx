import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { FocusAppContext, FocusProvider } from '../../focus/FocusProvider';
import { FocusRoot } from '../../focus/FocusRoot';

describe('FocusProvider (TVs)', () => {
  // Remote keys only reach the app through a natively focused view (Android passes key events
  // down the focused views; tvOS sends Select from the focused view). Focus moves in JavaScript,
  // so this one invisible view must hold native focus. Without it, arrows and Select do nothing on
  // a device, even though every other test still passes.
  it('keeps one invisible view natively focused, so remote keys reach the app', async () => {
    await render(
      <FocusProvider enabled>
        <Text>App</Text>
      </FocusProvider>,
    );

    const anchor = screen.getByTestId('native-focus-anchor', { includeHiddenElements: true });
    expect(anchor.props).toMatchObject({
      focusable: true,
      isTVSelectable: true,
      hasTVPreferredFocus: true,
    });
    expect(screen.getByText('App')).toBeOnTheScreen();
  });
});

describe('Native focus reclaim (TVs)', () => {
  it('asks for native focus back when a screen becomes active, and when focus is re-enabled', async () => {
    const reclaimNativeFocus = jest.fn();
    const tree = (active: boolean, enabled = true) => (
      <FocusAppContext.Provider value={{ enabled, reclaimNativeFocus }}>
        <FocusRoot active={active}>
          <Text>Screen</Text>
        </FocusRoot>
      </FocusAppContext.Provider>
    );
    const { rerender } = await render(tree(false));
    expect(reclaimNativeFocus).not.toHaveBeenCalled();

    await rerender(tree(true)); // e.g. Back to this screen
    expect(reclaimNativeFocus).toHaveBeenCalledTimes(1);

    await rerender(tree(true, false)); // "No internet connection" cover up
    await rerender(tree(true, true)); // connection back
    expect(reclaimNativeFocus).toHaveBeenCalledTimes(2);
  });
});
