import nock from 'nock';
import { getCustomerAccount, isAccountActive } from './customer';

const customerAccountData = {
  accessPolicy: 'FULL',
  createdBy: 'CIS_API',
  createdDate: '2015-07-23T16:43:41.606Z',
  domain: '123456',
  id: '123456',
  lastUpdatedBy: 'janus.prod',
  lastUpdatedDate: '2019-09-25T12:56:35.913Z',
  name: 'Rackspace',
  number: '2345',
  rcn: 'RCN-123-456-789',
  serviceLevel: 'infrastructure_sysops',
  status: 'Active',
  tenantId: '123456',
  type: 'CLOUD',
};

describe('getCustomerAccount', () => {
  beforeEach(() => {
    nock('http://localhost')
      .get('/aws/api/customer/v1/customer_accounts/CLOUD/123456')
      .reply(200, customerAccountData);
  });

  it('returns customer account data from API', async () => {
    const account = await getCustomerAccount('CLOUD', '123456');
    expect(account).toEqual(customerAccountData);
  });
});

describe('isAccountActive', () => {
  it('returns true when account status is Active', async () => {
    const data = { ...customerAccountData, status: 'Active' };
    expect(isAccountActive(data)).toEqual(true);
  });

  it('returns true when account status is Delinquent', async () => {
    const data = { ...customerAccountData, status: 'Delinquent' };
    expect(isAccountActive(data)).toEqual(true);
  });

  it('returns false when account status is Active', async () => {
    const data = { ...customerAccountData, status: 'Pending Approval' };
    expect(isAccountActive(data)).toEqual(false);
  });
});
