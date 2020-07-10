import React from 'react';
import { render, getNodeText } from '@testing-library/react';
import { AccountStatusCheck } from './AccountStatusCheck';
import * as customer from '../data/customer';

const sessionContext = React.createContext({
  session: {
    user: {
      'RAX-AUTH:domainId': '123456',
    },
  },
});

describe('AccountStatusCheck', () => {
  it('renders children if account is active', async () => {
    jest.spyOn(customer, 'getCustomerAccount').mockResolvedValue({
      status: 'Active',
    });

    const panel = render(<AccountStatusCheck sessionContext={sessionContext}>Hi</AccountStatusCheck>);
    await new Promise(resolve => setImmediate(resolve));

    expect(getNodeText(panel.container)).toBe('Hi');
  });

  it('renders verification modal if account is not active', async () => {
    jest.spyOn(customer, 'getCustomerAccount').mockResolvedValue({
      status: 'Pending Approval',
    });

    const panel = render(<AccountStatusCheck sessionContext={sessionContext}>Hi</AccountStatusCheck>);
    await new Promise(resolve => setImmediate(resolve));

    expect(panel.getByTestId('account-status-modal')).toBeTruthy();
  });
});
