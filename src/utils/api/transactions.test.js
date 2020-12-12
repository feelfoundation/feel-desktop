import { to } from 'await-to-js';
import { getTransactions, getSingleTransaction } from './transactions';
import networks from '../../constants/networks';
import { getAPIClient } from './f39/network';

jest.mock('./f39/network');

describe('Utils: Transactions API', () => {
  const id = '124701289470';
  const amount = '100000';
  const recipientId = '123L';
  const network = {
    name: networks.mainnet.name,
    networks: {
      F39: {},
    },
  };
  let feelAPIClient;

  beforeEach(() => {
    feelAPIClient = {
      transactions: {
        get: jest.fn(),
        broadcast: jest.fn(),
      },
      node: {
        getTransactions: jest.fn(),
      },
    };
    feelAPIClient.transactions.broadcast.mockResolvedValue({ recipientId, amount, id });
    feelAPIClient.node.getTransactions.mockResolvedValue({ data: [] });

    getAPIClient.mockReturnValue(feelAPIClient);
  });

  describe('getTransactions', () => {
    it('should resolve getTransactions for specific token (BTC, F39, ...) based on the address format ', async () => {
      const params = {
        address: recipientId,
        network,
      };
      feelAPIClient.transactions.get.mockResolvedValue({ data: [] });
      await getTransactions(params);
      expect(feelAPIClient.transactions.get).toHaveBeenCalledWith(expect.objectContaining({
        senderIdOrRecipientId: recipientId,
      }));
    });
  });

  describe('getSingleTransaction', () => {
    it('should resolve getSingleTransaction for specific token (BTC, F39, ...) based on the address format ', async () => {
      const params = {
        id,
        network,
      };
      feelAPIClient.transactions.get.mockResolvedValue({ data: [] });
      await to(getSingleTransaction(params));
      expect(feelAPIClient.transactions.get).toHaveBeenCalledWith(expect.objectContaining({
        id,
      }));
    });
  });
});
