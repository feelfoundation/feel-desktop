import React from 'react';
import { mount } from 'enzyme';
import FlashMessageHolder from '../../toolbox/flashMessage/holder';
import InitializationMessage, { InitializationMessageRenderer } from './initializationMessage';

jest.fn('../toolbox/flasheMessage/holder');

describe('InitializationMessage', () => {
  let wrapper;
  const props = {
    account: {
      info: {
        F39: {
          balance: 1,
          serverPublicKey: '',
        },
      },
    },
    pendingTransactions: [],
    settings: {
      token: {
        active: 'F39',
      },
    },
    history: {
      push: jest.fn(),
      location: {
        path: 'dashboard',
        search: '',
      },
    },
    t: k => k,
  };

  beforeEach(() => {
    FlashMessageHolder.addMessage = jest.fn(component => component);
  });

  it('should show the message component if account it is not init', () => {
    wrapper = mount(<InitializationMessageRenderer {...props} />);
    wrapper.find('.button').at(0).simulate('click');
    expect(props.history.push).toBeCalled();
  });

  it('should call FlashMessageHolder.addMessage', (done) => {
    wrapper = mount(<InitializationMessage {...props} />);
    setImmediate(() => {
      expect(FlashMessageHolder.addMessage).toBeCalled();
      done();
    });
  });
});
