import React from 'react';
import { mount } from 'enzyme';
import Feel from '@feelhq/feel-client';
import to from 'await-to-js';
import { create } from '../../../../utils/api/f39/transactions';
import accounts from '../../../../../test/constants/accounts';
import Summary from './summary';
import flushPromises from '../../../../../test/unit-test-utils/flushPromises';

describe('Delegate Registration Summary', () => {
  let wrapper;

  const network = {
    networks: {
      F39: { networkIdentifier: 'sample_identifier' },
    },
  };

  const props = {
    account: {
      address: '123456789L',
      balance: 11000,
      secondPublicKey: '',
      isDelegate: false,
      nonce: '1',
    },
    fee: 10,
    prevState: {},
    nickname: 'mydelegate',
    nextStep: jest.fn(),
    prevStep: jest.fn(),
    t: key => key,
    network,
  };

  const response = {
    account: props.account,
    username: props.nickname,
    passphrase: props.passphrase,
    recipientId: '123123L',
    amount: 0,
    nonce: '123',
  };

  beforeEach(() => {
    Feel.transaction.registerDelegate = jest.fn();
    Feel.transaction.registerDelegate.mockResolvedValue(response);
    wrapper = mount(<Summary {...props} />);
  });

  afterEach(() => {
    Feel.transaction.registerDelegate.mockRestore();
    props.nextStep.mockRestore();
  });

  it('renders properly Symmary component', () => {
    expect(wrapper).toContainMatchingElement('.summary-container');
    expect(wrapper).toContainMatchingElement('.nickname-label');
    expect(wrapper).toContainMatchingElement('.nickname');
    expect(wrapper).toContainMatchingElement('.address');
    expect(wrapper).toContainMatchingElement('button.confirm-button');
    expect(wrapper).toContainMatchingElement('button.cancel-button');
  });

  it('go to prev page when click Go Back button', () => {
    expect(props.prevStep).not.toBeCalled();
    wrapper.find('button.cancel-button').simulate('click');
    expect(props.prevStep).toBeCalled();
  });

  it('submit user data when click in confirm button', async () => {
    expect(props.nextStep).not.toBeCalled();
    wrapper.find('button.confirm-button').simulate('click');
    await flushPromises();
    expect(props.nextStep).toBeCalledWith({ transactionInfo: response });
  });

  it('submit user data when click in confirm button but fails', async () => {
    Feel.transaction.registerDelegate.mockRejectedValue(new Error('please provide a username'));

    wrapper.find('button.confirm-button').simulate('click');

    await flushPromises();
    expect(props.nextStep).not.toBeCalled();
  });

  it.skip('submit user data after enter second passphrase', async () => {
    const newProps = { ...props };
    newProps.account = accounts.second_passphrase_account;

    wrapper = mount(<Summary {...newProps} />);

    const clipboardData = {
      getData: () => accounts.second_passphrase_account.secondPassphrase,
    };

    wrapper.find('passphraseInput input').first().simulate('paste', { clipboardData });
    wrapper.update();
    wrapper.find('button.confirm-button').simulate('click');
    await to(create(newProps.account, 'registerDelegate'));
    expect(props.nextStep).toBeCalled();
  });
});
