import { afterEach } from '@jest/globals';
import { cleanup } from '@testing-library/react-native';
import { cleanupQueryClients } from './helpers/queryWrapper';

// Unmount what the test rendered *before* cancelling its requests: cancelling a request a mounted
// component is waiting on updates that component after the test (an `act` warning). Testing
// Library's own cleanup isn't guaranteed to run first, so call it here (a second call is a no-op).
afterEach(async () => {
  await cleanup();
  await cleanupQueryClients();
});
