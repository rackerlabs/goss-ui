import assert from 'assert';

assert(process.env.GOSS_UI_INTEGRATION_URL, 'Please provide a URL against which tests are run');
assert(process.env.GOSS_UI_INTEGRATION_USERNAME, 'Please provide a username used for running tests');
assert(process.env.GOSS_UI_INTEGRATION_PASSWORD, 'Please provide a password used for running tests');

jest.setTimeout(1800000);

global.test = async (name, fn, timeout) => {
  const cleanFilePath = title => `${title}`.replace(/[^0-9a-zA-Z\-_]/g, '_');

  return it(
    name,
    async () => {
      try {
        return await fn();
      } finally {
        await page.screenshot({ path: `./artifacts/${cleanFilePath(name)}.png`, fullPage: true });
      }
    },
    timeout,
  );
};
