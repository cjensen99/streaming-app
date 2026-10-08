import { useSyncExternalStore } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

function subscribe(onChange: () => void): () => void {
  const subscription = AppState.addEventListener('change', onChange);
  return () => subscription.remove();
}

function getSnapshot(): AppStateStatus {
  return AppState.currentState;
}

/** Whether the app is `active`, in the `background`, or `inactive` (iOS transitions). */
export function useAppState(): AppStateStatus {
  return useSyncExternalStore(subscribe, getSnapshot);
}
