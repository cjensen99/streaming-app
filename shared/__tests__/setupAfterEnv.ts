import { afterEach } from '@jest/globals';
import { cleanupQueryClients } from './helpers/queryWrapper';

// Runs after React Native Testing Library's own cleanup (which unmounts rendered trees).
afterEach(cleanupQueryClients);
