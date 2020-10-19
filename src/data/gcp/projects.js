import { fetch } from '../../data/fetch';

// See src/organizations/list.js's `isOrgCreationComplete()` for how to manage this dynamically
export const HARD_CODED_PROJECTS = [
  {
    id: 'GCP-1234-abcd-5678',
    display_name: 'HARDCODED PROJECT NAME -- SEE CODE TO DYNAMICALLY FILL',
  },
];

export const listProjects = async () => {
  //set to GCP API
  /* const config = { headers: { 'Access-Control-Allow-Origin': '*' } };
    const res = await fetch(`/api/vmc/v1.0/orgs?cachebust=${Date.now()}`, config);
    const body = await res.json(); */

  const body = { data: { items: HARD_CODED_PROJECTS } };
  return body.data.items;
};

export const getProject = async ({ id }) => {
  // set to GCP API
  // const config = domain ? { headers: { 'X-Tenant-Id': domain } } : {};
  // const res = await fetch(`/api/vmc/v1.0/orgs/${id}`, config);
  // const body = await res.json();

  const body = { data: { items: HARD_CODED_PROJECTS } };
  return body.data.items[0];
};
