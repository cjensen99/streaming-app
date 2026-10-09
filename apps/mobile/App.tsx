import { hardwareBackAdapter } from '@app/shared/input/adapters/hardwareBackAdapter';
import { AppShell } from '@app/shared/app/AppShell';
import { logger } from '@app/shared/utils/logger';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';

// Menus are portrait-only (iOS also starts that way through the config plugin; this covers
// Android). The player switches to landscape while it's open (Phase 11).
ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch((error: unknown) =>
  logger.warn('Could not lock portrait orientation', error),
);

export default function App() {
  return (
    <>
      <AppShell inputAdapter={hardwareBackAdapter} />
      <StatusBar style="light" />
    </>
  );
}
