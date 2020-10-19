import { fetch } from '../../data/fetch';

export const HARD_CODED_JOBS = [
  {
    start_date: new Date() - 1,
    stop_date: new Date(),
    vm_uuid: 'abcdef-123457',
    status: 'ERROR',
    message: 'Oopsie.....',
  },
];

export const listJobs = async domain => {
  /*const config = domain ? { headers: { 'X-Tenant-Id': domain } } : {};
  const res = await fetch(`/api/vmc/v1.0/jobs`, config);
  const body = await res.json();*/

  const body = { data: { items: [HARD_CODED_JOBS] } };
  return body.data.items;
};
