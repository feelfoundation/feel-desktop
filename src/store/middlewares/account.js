import {
  accountDataUpdated,
  updateEnabledTokenAccount,
  login,
} from '../../actions/account';
import {
  emptyTransactionsData,
  updateTransactions,
} from '../../actions/transactions';
import { settingsUpdated } from '../../actions/settings';
import { fromRawF39 } from '../../utils/f39';
import { getActiveTokenAccount } from '../../utils/account';
import { getAutoLogInData, shouldAutoLogIn, findMatchingLoginNetwork } from '../../utils/login';
import { loadVotes } from '../../actions/voting';
import { networkSet, networkStatusUpdated } from '../../actions/network';
import actionTypes from '../../constants/actions';
import analytics from '../../utils/analytics';
import i18n from '../../i18n';
import { getFromStorage } from '../../utils/localJSONStorage';
import networks from '../../constants/networks';
import settings from '../../constants/settings';
import transactionTypes from '../../constants/transactionTypes';
import { txAdapter } from '../../utils/api/f39/adapters';
import { tokenMap } from '../../constants/tokens';

const updateAccountData = (store) => {
  const { transactions } = store.getState();
  const account = getActiveTokenAccount(store.getState());

  store.dispatch(accountDataUpdated({
    transactions,
    account,
  }));
};

const getRecentTransactionOfType = (transactionsList, type) => (
  transactionsList.filter(transaction => (
    transaction.type === type
    // limit the number of confirmations to 5 to not fire each time there is another new transaction
    // theoretically even less then 5, but just to be on the safe side
    && transaction.confirmations < 5))[0]
);

const votePlaced = (store, action) => {
  const voteTransaction = getRecentTransactionOfType(
    action.data.confirmed,
    transactionTypes().vote.code,
  );

  if (voteTransaction) {
    const { account } = store.getState();

    store.dispatch(loadVotes({
      address: account.info.F39.address,
      type: 'update',
    }));
  }
};

const filterIncomingTransactions = (transactions, account) => transactions.filter(transaction => (
  transaction
  && transaction.recipientId === account.address
  && transaction.type === transactionTypes().transfer.code
));

const showNotificationsForIncomingTransactions = (transactions, account, token) => {
  filterIncomingTransactions(transactions, account).forEach((transaction) => {
    const amount = fromRawF39(transaction.amount);
    const message = transaction.asset && transaction.asset.data
      ? i18n.t('with message {{message}}', { message: transaction.asset.data })
      : '';
    // eslint-disable-next-line no-new
    new Notification(i18n.t('{{amount}} {{token}} Received', { amount, token }), {
      body: i18n.t('Your account just received {{amount}} {{token}} {{message}}', { amount, token, message }),
    });
  });
};

const checkTransactionsAndUpdateAccount = (store, action) => {
  const state = store.getState();
  const { transactions, settings: { token } } = state;
  const account = getActiveTokenAccount(store.getState());

  const txs = (action.data.block.transactions || []).map(txAdapter);
  const blockContainsRelevantTransaction = txs.filter((transaction) => {
    if (!transaction) return false;
    return (
      account.address === transaction.senderId
      || account.address === transaction.recipientId
    );
  }).length > 0;

  showNotificationsForIncomingTransactions(txs, account, token.active);

  const recentBtcTransaction = token.active === 'BTC'
    && transactions.confirmed.filter(t => t.confirmations === 1).length > 0;

  if (blockContainsRelevantTransaction || recentBtcTransaction) {
    // it was not getting the account with secondPublicKey right
    // after a new block with second passphrase registration transaction was received
    // Adding timeout explained in
    // https://github.com/feelfoundation/feel-desktop/pull/1609
    setTimeout(() => {
      updateAccountData(store);
      store.dispatch(updateTransactions({
        pendingTransactions: transactions.pending,
        address: account.address,
        filters: transactions.filters,
      }));
    }, 500);
  }
};

// istanbul ignore next
const getNetworkFromLocalStorage = () => {
  let mySettings = {};
  getFromStorage('settings', {}, (data) => {
    mySettings = data;
  });
  if (!mySettings.network) return networks.mainnet;
  return {
    ...Object.values(networks).find(
      ({ name }) => name === mySettings.network.name,
    ) || networks.mainnet,
    address: mySettings.network.address,
  };
};

// eslint-disable-next-line max-statements
const checkNetworkToConnect = (showNetwork) => {
  const autologinData = getAutoLogInData();
  let loginNetwork = findMatchingLoginNetwork();

  if (loginNetwork) {
    const net = loginNetwork.slice(-1).shift();
    loginNetwork = {
      name: net.name,
      network: {
        ...net,
      },
    };
  }

  if (!loginNetwork && autologinData.feelCoreUrl) {
    loginNetwork = {
      name: networks.customNode.name,
      passphrase: autologinData[settings.keys.loginKey],
      network: { ...networks.customNode, address: autologinData[settings.keys.feelCoreUrl] },
      options: {
        code: networks.customNode.code,
        address: autologinData[settings.keys.feelCoreUrl],
      },
    };
  }

  // istanbul ignore next
  if (!loginNetwork && !autologinData.feelCoreUrl) {
    if (showNetwork) {
      const currentNetwork = getNetworkFromLocalStorage();
      loginNetwork = {
        name: currentNetwork.name,
        network: {
          ...currentNetwork,
        },
      };
    } else {
      loginNetwork = {
        name: networks.mainnet.name,
        network: {
          ...networks.mainnet,
        },
      };
    }
  }

  return loginNetwork;
};

// eslint-disable-next-line max-statements
const autoLogInIfNecessary = async (store) => {
  const {
    showNetwork, statistics, statisticsRequest, statisticsFollowingDay,
  } = store.getState().settings;
  const loginNetwork = checkNetworkToConnect(showNetwork);
  store.dispatch(networkSet(loginNetwork));
  store.dispatch(networkStatusUpdated({ online: true }));

  const autologinData = getAutoLogInData();
  if (shouldAutoLogIn(autologinData)) {
    setTimeout(() => {
      store.dispatch(login({ passphrase: autologinData[settings.keys.loginKey] }));
    }, 500);
  }

  if (!statistics) {
    analytics.checkIfAnalyticsShouldBeDisplayed({
      statisticsRequest, statisticsFollowingDay, statistics,
    });
  }
};

const accountMiddleware = store => next => (action) => {
  next(action);
  switch (action.type) {
    case actionTypes.storeCreated:
      autoLogInIfNecessary(store);
      break;
    case actionTypes.newBlockCreated:
      checkTransactionsAndUpdateAccount(store, action);
      break;
    case actionTypes.updateTransactions:
      votePlaced(store, action);
      break;
    case actionTypes.accountLoggedOut:
      /* Reset active token setting so in case BTC is selected,
      the Feel monitoring features are available and Feel is selected on the next login */
      store.dispatch(settingsUpdated({ token: { active: tokenMap.F39.key } }));
      store.dispatch(emptyTransactionsData());
      break;
    case actionTypes.settingsUpdated: {
      const tokensList = action.data.token && action.data.token.list;
      const token = tokensList && Object.keys(tokensList)
        .find(t => tokensList[t]);
      if (tokensList && tokensList[token]) {
        store.dispatch(updateEnabledTokenAccount(token));
      }
      break;
    }
    /* istanbul ignore next */
    default: break;
  }
};

export default accountMiddleware;
