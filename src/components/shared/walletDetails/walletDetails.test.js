import React from 'react';
import { mount } from 'enzyme';
import WalletDetails from './walletDetails';

describe('WalletDetails', () => {
  let wrapper;

  const props = {
    account: {
      info: {
        F39: {
          balance: '100',
          token: 'F39',
        },
        BTC: {
          balance: '20',
          token: 'BTC',
        },
      },
    },
    settings: {
      token: {
        active: 'F39',
        list: {
          F39: true,
          BTC: true,
        },
      },
    },
    t: key => key,
  };

  beforeEach(() => {
    wrapper = mount(<WalletDetails {...props} />);
  });

  it('Should render properly', () => {
    expect(wrapper).toContainMatchingElement('.coin-container');
    expect(wrapper).toContainMatchingElements(2, 'section.coin-row');
  });
});
