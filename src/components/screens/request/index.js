import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { tokenKeys } from '../../../constants/tokens';
import RequestBtc from './requestBtc';
import RequestF39 from './requestF39';

const TagNameMap = {
  F39: RequestF39,
  BTC: RequestBtc,
};

const Request = ({
  account, t, token,
}) => {
  const TagName = TagNameMap[token];
  const address = account.info ? account.info[token].address : '';
  return <TagName address={address} t={t} />;
};

Request.propTypes = {
  account: PropTypes.object,
  token: PropTypes.oneOf(tokenKeys).isRequired,
  t: PropTypes.func.isRequired,
};

Request.defaultProps = {
  account: {},
  token: 'F39',
  /* istanbul ignore next */
  t: key => key,
};

export default connect(
  state => ({
    token: state.settings.token.active,
    account: state.account,
  }),
  {},
)(withTranslation()(Request));
