import { fetch } from '../data/fetch';

export const getCustomerAccount = async (type, accountId) => {
  const res = await fetch(`/api/customer/v1/customer_accounts/${type}/${accountId}`);
  return await res.json();
};

export const isAccountActive = account => {
  const allowedStatuses = ['Active', 'Delinquent'];
  return allowedStatuses.includes(account.status);
};
