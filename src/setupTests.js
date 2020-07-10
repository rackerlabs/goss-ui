/* eslint no-console: 0 */

import '@testing-library/react/cleanup-after-each';

const dateTimeFormatResolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
const consoleError = console.error;
const SUPPRESSED_WARNINGS = [/Warning: An update to %s inside a test was not wrapped in act/, /Do Not Log:/];

global.document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
});

global.URL = { createObjectURL: jest.fn() };

beforeAll(() => {
  console.error = (msg, ...args) => {
    if (SUPPRESSED_WARNINGS.some(prefix => prefix.test(msg))) {
      return;
    }

    consoleError.call(console, msg, ...args);
  };

  const resolvedOptions = { ...Intl.DateTimeFormat().resolvedOptions(), timeZone: 'UTC' };
  Intl.DateTimeFormat.prototype.resolvedOptions = () => resolvedOptions;
});

afterAll(() => {
  console.error = consoleError;
  Intl.DateTimeFormat.prototype.resolvedOptions = dateTimeFormatResolvedOptions;
});
