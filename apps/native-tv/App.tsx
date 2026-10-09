import { sendKeyToFocus } from '@app/shared/focus/focusKeys';
import { remoteAdapter } from '@app/shared/input/adapters/remoteAdapter';
import { AppShell } from '@app/shared/screens/AppShell';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <>
      <AppShell inputAdapter={remoteAdapter} focusHandler={sendKeyToFocus} />
      <StatusBar style="light" />
    </>
  );
}
