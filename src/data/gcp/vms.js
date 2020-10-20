import { fetch } from '../../data/fetch';
import _ from 'lodash';

export const HARDCODED_VMS = [
  {
    name: 'GCP-VM-01',
    id: 'GCP-abcd-1234',
    uuid: 'abcdef-123456',
  },
  {
    name: 'GCP-VM-02',
    id: 'GPC-abcd-1235',
    uuid: 'abcdef-123457',
  },
];

export const listVMs = async ({ projectId }) => {
  // Set to GCP API
  // const config = domain ? { headers: { 'X-Tenant-Id': domain } } : {};
  // const res = await fetch(`/api/vmc/v1.0/orgs/${organizationId}/sddcs/${sddcId}/vms`, config);
  // const body = await res.json();

  const body = { data: { items: [HARDCODED_VMS] } };
  return body.data.items;
};
