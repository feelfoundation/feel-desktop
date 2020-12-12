import { getAccount } from './account';
import * as f39AccountApi from './f39/account';
import networks from '../../constants/networks';

jest.mock('./f39/account');

describe('Utils: Account API', () => {
  const address = '123L';
  const network = {
    name: networks.mainnet.name,
    networks: {
      F39: {},
    },
  };

  describe('getAccount', () => {
    it('should resolve getAccount for specific token (BTC, F39, ...) based on the address format ', async () => {
      const params = {
        address,
        network,
      };
      await getAccount(params);
      expect(f39AccountApi.getAccount).toHaveBeenCalledWith(expect.objectContaining({
        network,
        address,
      }));
    });
  });
});
