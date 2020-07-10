import VError from 'verror';
import nock from 'nock';
import { fetch } from './fetch';

describe('fetch', () => {
  it('returns response for successful request', async () => {
    nock('http://localhost')
      .get('/aws/200')
      .reply(200, {
        hello: 'world',
      });

    const res = await fetch('/200');
    const body = await res.json();

    expect(res.status).toEqual(200);
    expect(body).toEqual({ hello: 'world' });
  });

  it('throws exception for non-ok request', async () => {
    nock('http://localhost')
      .get('/aws/400')
      .reply(400, {
        bad: 'request',
      });

    let error;

    try {
      await fetch('/400');
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.name).toEqual('FetchError');
    expect(error.message).toEqual('HTTP request resulted in non-200 status code');
    expect(VError.info(error)).toHaveProperty('response');
  });

  it('throws exception for network error', async () => {
    nock('http://localhost')
      .get('/aws/networkerror')
      .replyWithError('Do Not Log: something is terribly wrong');

    let error;

    try {
      await fetch('/networkerror');
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.name).toEqual('FetchError');
    expect(error.message).toContain('HTTP request resulted in error');
    expect(error.cause()).toBeInstanceOf(Error);
  });
});
