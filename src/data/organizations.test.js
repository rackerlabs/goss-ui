import nock from 'nock';
import { listOrganizations, createOrganization, getOrganization } from './organizations';

const organizationsData = [
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

describe('listOrganizations', () => {
  beforeEach(() => {
    nock('http://localhost')
      .get('/aws/api/vmc/v1.0/orgs')
      .query(true)
      .reply(200, {
        data: {
          items: organizationsData,
        },
      });
  });

  it('returns organization data from API', async () => {
    const orgs = await listOrganizations();
    expect(orgs).toEqual(organizationsData);
  });
});

describe('getOrganization', () => {
  const orgData = organizationsData[0];
  beforeEach(() => {
    nock('http://localhost')
      .get(`/aws/api/vmc/v1.0/orgs/${orgData.id}`)
      .reply(200, {
        data: {
          items: [orgData],
        },
      });
  });

  it('returns organization data from API', async () => {
    const org = await getOrganization({ id: orgData.id });
    expect(org).toEqual(orgData);
  });
});

describe('createOrganization', () => {
  beforeEach(() => {
    nock('http://localhost')
      .post('/aws/api/vmc/v1.0/orgs', {
        displayName: 'hello!',
      })
      .reply(200, null, { Location: '/aws/api/vmc/v1.0/jobs/uuid' });
  });

  it('returns organization data from API', async () => {
    const location = await createOrganization({ displayName: 'hello!' });
    expect(location).toEqual('/aws/api/vmc/v1.0/jobs/uuid');
  });
});
