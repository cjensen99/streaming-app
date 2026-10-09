import { QueryProvider } from '@app/shared/api/QueryProvider';
import Placeholder from '@app/shared/screens/Placeholder';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <QueryProvider>
      <Placeholder />
      <StatusBar style="light" />
    </QueryProvider>
  );
}
