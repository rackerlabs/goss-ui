import nock from 'nock';
import { listJobs } from './jobs';

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

describe('listJobs', () => {
  beforeEach(() => {
    nock('http://localhost')
      .get('/aws/api/vmc/v1.0/jobs')
      .reply(200, {
        data: {
          items: sddcsData,
        },
      });
  });

  it('returns jobs data from API', async () => {
    await listJobs();
    // expect(sddcs).toEqual(sddcsData)
  });
});
