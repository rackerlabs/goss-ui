import { fetch } from '../fetch';

export const listJobs = async domain => {
  const config = domain ? { headers: { 'X-Tenant-Id': domain } } : {};
  const res = await fetch(`/api/vmc/v1.0/jobs`, config);
  const body = await res.json();
  return body.data.items;
};
