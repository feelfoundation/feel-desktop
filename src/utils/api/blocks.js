import { getAPIClient } from './f39/network';

export const getBlocks = (network, options) =>
  getAPIClient(network).blocks.get(options);

export default {
  getBlocks,
};
