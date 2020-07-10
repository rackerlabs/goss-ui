/* eslint import/no-commonjs: 0 */

module.exports = {
  browserContext: 'default',
  launch: {
    headless: process.env.HEADLESS !== 'false',
  },
};
