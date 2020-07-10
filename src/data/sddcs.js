import { fetch } from '../data/fetch';

export const listSDDCs = async ({ organizationId, domain }) => {
  try {
    const config = domain ? { headers: { 'X-Tenant-Id': domain } } : {};
    const res = await fetch(`/api/vmc/v1.0/orgs/${organizationId}/sddcs`, config);
    const body = await res.json();
    return body.data.items;
  } catch (err) {
    if (err.name === 'FetchError') {
      return [];
    }

    throw err;
  }
};

export const getSDDC = async ({ organizationId, sddcId, domain }) => {
  const config = domain ? { headers: { 'X-Tenant-Id': domain } } : {};
  const res = await fetch(`/api/vmc/v1.0/orgs/${organizationId}/sddcs/${sddcId}`, config);
  const body = await res.json();
  return body.data.items[0];
};
