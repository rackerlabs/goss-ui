import nock from 'nock';
import { listSDDCs, getSDDC } from './sddcs';

const sddcsData = [
  {
    id: 1,
    name: 'Janus - Dev',
  },
  {
    id: 2,
    name: 'Janus - Prod',
  },
  {
    id: 3,
    name: 'GOSS - Dev',
  },
  {
    id: 4,
    name: 'GOSS - Prod',
  },
  {
    id: 5,
    name: 'RMS',
  },
];

describe('listSDDCs', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('returns SDDC data from API', async () => {
    nock('http://localhost')
      .get('/aws/api/vmc/v1.0/orgs/my-org-id/sddcs')
      .reply(200, {
        data: {
          items: sddcsData,
        },
      });

    const sddcs = await listSDDCs({ organizationId: 'my-org-id' });
    expect(sddcs).toEqual(sddcsData);
  });

  it('returns empty list when SDDC call returns 400', async () => {
    nock('http://localhost')
      .get('/aws/api/vmc/v1.0/orgs/my-org-id/sddcs')
      .reply(400, {
        error: {
          code: 'ClientError',
          message: 'SDDCs cannot be listed until organization setup is complete',
        },
      });

    const sddcs = await listSDDCs({ organizationId: 'my-org-id' });
    expect(sddcs).toEqual([]);
  });
});

describe('getSDDC', () => {
  beforeEach(() => {
    nock('http://localhost')
      .get('/aws/api/vmc/v1.0/orgs/my-org-id/sddcs/my-sddc-id')
      .reply(200, {
        data: {
          items: [sddcsData[0]],
        },
      });
  });

  it('returns SDDC data from API', async () => {
    const sddcs = await getSDDC({ organizationId: 'my-org-id', sddcId: 'my-sddc-id' });
    expect(sddcs).toEqual(sddcsData[0]);
  });
});
