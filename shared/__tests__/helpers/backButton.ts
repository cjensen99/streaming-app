import { jest } from '@jest/globals';
import { BackHandler } from 'react-native';

/**
 * Stands in for the platform Back button (React Native's BackHandler is a stub under Jest).
 * Collects every listener, React Navigation's included, and calls them newest first until one
 * returns true, like the real one. `press` returns whether the app handled it (false = the
 * platform's default, e.g. leaving the app).
 */
// What the platform passes to listeners; none of the app's listeners read it.
const BACK_PRESS_EVENT = {} as Parameters<Parameters<typeof BackHandler.addEventListener>[1]>[0];

export function mockBackButton() {
  type Listener = Parameters<typeof BackHandler.addEventListener>[1];
  const listeners: Listener[] = [];
  jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
    listeners.push(handler);
    return {
      remove: () => {
        const index = listeners.indexOf(handler);
        if (index !== -1) listeners.splice(index, 1);
      },
    };
  });
  return {
    press: () => [...listeners].reverse().some((listener) => listener(BACK_PRESS_EVENT) === true),
  };
}
