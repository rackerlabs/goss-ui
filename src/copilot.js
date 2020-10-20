import { mergePrimaryNavigationLinksByRel } from '@janus.team/janus-copilot/cjs/janus-copilot.js';
import { isLocal, baseUrl } from './config';

export const overridePrimaryNavLinks = (config, links) => {
  return {
    ...config,
    catalog: {
      ...config.catalog,
      catalog: {
        ...config.catalog.catalog,
        primaryNavigation: {
          ...config.catalog.catalog.primaryNavigation,
          links: links,
        },
        utilityNavigation: {
          ...config.catalog.catalog.utilityNavigation,
          links: [
            {
              label: 'Operating System Services',
              rel: 'goss',
              href: '/goss',
            },
          ],
        },
      },
    },
  };
};

export const config = {
  baseUrl: baseUrl(),
  credentials: isLocal() ? 'include' : 'same-origin',
  csrfCookieName: isLocal() ? 'CSRF_TOKEN_SUBDOMAIN' : 'CSRF_TOKEN',
};

export const customerCatalog = config => {
  const primaryLinks = [
    {
      label: 'Amazon Web Services',
      rel: 'aws',
      to: '/goss/aws/accounts',
    },
    {
      label: 'Azure',
      rel: 'azure',
      to: '/goss/azure/accounts',
    },
    {
      label: 'Google Cloud Platform',
      rel: 'gcp',
      to: '/goss/gcp/projects',
    },
    {
      label: 'VMware Cloud on AWS',
      rel: 'vmc',
      to: '/goss/vmc/organizations',
    },
  ];

  let catalog = overridePrimaryNavLinks(config, primaryLinks);
  catalog = mergePrimaryNavigationLinksByRel(catalog, { goss: { to: '/goss', active: true } });
  return catalog;
};
