import { fetch } from '../data/fetch';

export const searchOrganizations = async query => {
  const res = await fetch(`/api/vmc/v1.0/orgs?search=${query}`);
  const body = await res.json();
  return body.data.items;
};

export const listOrganizations = async () => {
  const config = { headers: { 'Access-Control-Allow-Origin': '*' } };
  const res = await fetch(`/api/vmc/v1.0/orgs?cachebust=${Date.now()}`, config);
  const body = await res.json();
  return body.data.items;
};

export const getOrganization = async ({ id, domain }) => {
  const config = domain ? { headers: { 'X-Tenant-Id': domain } } : {};
  const res = await fetch(`/api/vmc/v1.0/orgs/${id}`, config);
  const body = await res.json();
  return body.data.items[0];
};

export const createOrganization = async ({ displayName }) => {
  const res = await fetch('/api/vmc/v1.0/orgs', {
    method: 'POST',
    body: JSON.stringify({ displayName }),
  });
  return res.headers.get('location');
};
