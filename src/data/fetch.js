import VError from 'verror';
import copilot from '@janus.team/janus-copilot/cjs/janus-copilot.js';
import { baseUrl, isLocal, isRacker } from '../config';

export const fetch = async (url, config) => {
  const proxyPath = isRacker() ? 'racker' : 'aws';
  const proxyUrl = `${baseUrl()}/${proxyPath}`;
  let response;

  try {
    response = await copilot.proxyFetch(`${proxyUrl}${url}`, config, {
      credentials: isLocal() ? 'include' : 'same-origin',
      csrfCookieName: isLocal() ? 'CSRF_TOKEN_SUBDOMAIN' : 'CSRF_TOKEN',
    });
  } catch (err) {
    throw new VError(
      {
        name: 'FetchError',
        cause: err,
      },
      'HTTP request resulted in error',
    );
  }

  if (!response.ok) {
    throw new VError(
      {
        name: 'FetchError',
        info: { response },
      },
      'HTTP request resulted in non-200 status code',
    );
  }

  return response;
};
