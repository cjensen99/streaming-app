import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useInputLayer } from '../../hooks/useInputLayer';
import { hardwareBackAdapter } from '../../input/adapters/hardwareBackAdapter';
import { InputProvider } from '../../input/InputProvider';
import { mockBackButton } from '../helpers/backButton';
import { mockFetch } from '../helpers/mockFetch';
import { appRoutes, renderApp, resetAppState } from '../helpers/renderScreens';

jest.mock('../../ui/Image', () => jest.requireActual<object>('../helpers/mockImage'));
jest.mock('expo-image', () => ({ Image: { prefetch: () => Promise.resolve(true) } }));
beforeEach(resetAppState);

/** Waits for Home's rails, so no loading finishes after the test. */
const homeLoaded = () =>
  waitFor(() =>
    expect(screen.queryAllByTestId('rail-spinner', { includeHiddenElements: true })).toHaveLength(
      0,
    ),
  );

async function openChannel() {
  await homeLoaded();
  await fireEvent.press(
    within(screen.getByTestId('rail-sports')).getByRole('button', { name: 'ESPNews' }),
  );
  await screen.findByRole('button', { name: 'Add to My List' });
}

describe('Back', () => {
  it('goes from Detail back to Home, and tells the adapter when there is somewhere to go back to', async () => {
    mockFetch(appRoutes());
    const { press, setCanGoBack } = await renderApp();
    await openChannel();
    expect(setCanGoBack).toHaveBeenLastCalledWith(true);

    expect(await press('back')).toBe('handled');

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Add to My List' })).not.toBeOnTheScreen(),
    );
    expect(screen.getByRole('header', { name: 'StreamShelf' })).toBeOnTheScreen();
    expect(setCanGoBack).toHaveBeenLastCalledWith(false);
  });

  it('leaves Back on the top screen to the platform (Android leaves the app)', async () => {
    mockFetch(appRoutes());
    const { press } = await renderApp();
    await homeLoaded();

    expect(await press('back')).toBe('pass');
  });

  it('asks the app before React Navigation, so a layer can keep Back from leaving a screen', async () => {
    const backButton = mockBackButton();
    await render(
      <InputProvider adapter={hardwareBackAdapter}>
        <NavigationContainer initialState={{ routes: [{ name: 'First' }, { name: 'Second' }] }}>
          <TestStack.Navigator>
            <TestStack.Screen name="First" component={First} />
            <TestStack.Screen name="Second" component={SecondWithLayer} />
          </TestStack.Navigator>
        </NavigationContainer>
      </InputProvider>,
    );
    expect(screen.getByText('Second')).toBeOnTheScreen();

    await act(() => {
      backButton.press();
    });

    // React Navigation's own Back listener would have closed the screen if it had gone first.
    expect(screen.getByText('Second')).toBeOnTheScreen();
  });
});

const TestStack = createNativeStackNavigator();
const First = () => <Text>First</Text>;
function SecondWithLayer() {
  useInputLayer((event) => (event.key === 'back' ? 'handled' : 'pass'));
  return <Text>Second</Text>;
}
