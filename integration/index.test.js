describe('UI', () => {
  test('renders UI', async () => {
    const res = await page.goto(process.env.GOSS_UI_INTEGRATION_URL);
    expect(res.status()).toBe(200);
  });
});
