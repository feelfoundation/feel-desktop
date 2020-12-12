import { tokenMap } from '../../constants/tokens';
import f39ApiUtils from './f39';
import btcApiUtils from './btc';

export { default as account } from './account';
export { default as transactions } from './transactions';
export { default as service } from './service';

export default {
  [tokenMap.F39.key]: f39ApiUtils,
  [tokenMap.BTC.key]: btcApiUtils,
};
