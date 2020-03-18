import { testAddon } from '@watchedcom/test';
import { nasaAddon } from './index';

// Depending on your addon, change the test timeout
jest.setTimeout(30000);

test(`Test addon "${nasaAddon.getId()}"`, done => {
  testAddon(nasaAddon)
    .then(done)
    .catch(done);
});
