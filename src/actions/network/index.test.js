import { networkSet, networkStatusUpdated } from './index';
import * as f39NetworkActions from './f39';
import networks from '../../constants/networks';

describe('actions: network', () => {
  let dispatch;

  beforeEach(() => {
    jest.resetModules();
    dispatch = jest.fn();
    jest.spyOn(f39NetworkActions, 'f39NetworkSet');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('networkSet', () => {
    it('should call f39 networkSet action', async () => {
      const { name } = networks.testnet;
      networkSet({ name })(dispatch);
      expect(f39NetworkActions.f39NetworkSet).toHaveBeenCalled();
    });
  });

  describe('networkStatusUpdated', () => {
    it('should create networkStatusUpdated action ', () => {
      const online = false;
      expect(networkStatusUpdated({ online })).toMatchObject({
        data: { online },
      });
    });
  });
});
