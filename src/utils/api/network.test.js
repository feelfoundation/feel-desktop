import Feel from '@feelhq/feel-client';

import { getAPIClient } from './network';
import networks from '../../constants/networks';
import { tokenMap } from '../../constants/tokens';

describe('Utils: network API', () => {
  describe('getAPIClient', () => {
    let APIClientBackup;
    let constructorSpy;

    beforeEach(() => {
      constructorSpy = jest.fn();
      // TODO: find a better way of mocking Feel.APIClient
      APIClientBackup = Feel.APIClient;
      Feel.APIClient = class MockAPIClient {
        constructor(...args) {
          constructorSpy(...args);
        }
      };
      Feel.APIClient.constants = APIClientBackup.constants;
    });

    afterEach(() => {
      Feel.APIClient = APIClientBackup;
    });

    it('should create a new Feel APIClient instance if called with F39 token', () => {
      const nethash = Feel.APIClient.constants.MAINNET_NETHASH;
      const nodeUrl = 'https://hub23.feel.surf';
      const state = {
        network: {
          name: networks.customNode.name,
          networks: {
            [tokenMap.F39.key]: {
              nethash,
              nodeUrl,
            },
          },
        },
      };
      getAPIClient(tokenMap.F39.key, state.network);
      expect(constructorSpy).toHaveBeenCalledWith([nodeUrl], { nethash });
    });
  });
});
