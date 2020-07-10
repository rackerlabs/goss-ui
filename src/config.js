// Detect local development by checking for local.dev.manage.rackspace.com domain.
export const isLocal = () => /local\.dev\.manage\.rackspace\.com/i.test(global.location.origin);

// When running locally, use dev.manage.rackspace.com for the UI backend. Otherwise, use the domain
// of the website. This allows local development to piggy back off dev.manage.rackspace.com's backend.
export const baseUrl = () => (isLocal() ? 'https://dev.manage.rackspace.com' : global.location.origin);

// Detect Racker usage by the URL.
export const isRacker = () => global.location.pathname.startsWith(`${process.env.PUBLIC_URL}/racker`);

// Feature flag for GOSS
export const isGossEnabled = () => process.env.REACT_APP_GOSS_ENABLED !== 'false';
