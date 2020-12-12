const networks = {
  mainnet: { // network name translation t('Mainnet');
    name: 'Mainnet',
    code: 0,
    nodes: ['http://f39mainnet-service.feel.surf:8500'],
    initialSupply: 10000000000000000,
  },
  testnet: { // network name translation t('Testnet');
    name: 'Testnet',
    testnet: true,
    code: 1,
    nodes: ['http://f39mainnet-service.feel.surf:7500'],
    initialSupply: 10000000000000000,
  },
  customNode: { // network name translation t('Custom Node');
    name: 'Custom Node',
    custom: true,
    address: 'http://localhost:4500',
    code: 2,
    initialSupply: 10000000000000000,
  },
};

networks.default = networks[window.localStorage && window.localStorage.getItem('defaultNetwork')] || networks.Mainnet;
module.exports = networks;
