import * as copilot from './copilot';

const sampleCatalog = {
  catalog: {
    catalog: {
      primaryNavigation: {
        other: 'props',
        links: [],
      },
      other: 'props',
    },
    other: 'props',
  },
  other: 'props',
};

describe('overridePrimaryNavLinks', () => {
  it('replaces primary nav links from catalog', () => {
    const updatedCatalog = copilot.overridePrimaryNavLinks(sampleCatalog, [
      {
        rel: 'foo',
        href: '/foo',
        label: 'Foo',
      },
      {
        rel: 'bar',
        to: '/bar',
        label: 'Bar',
      },
    ]);
    expect(updatedCatalog).toEqual({
      catalog: {
        catalog: {
          primaryNavigation: {
            links: [
              {
                rel: 'foo',
                href: '/foo',
                label: 'Foo',
              },
              {
                rel: 'bar',
                to: '/bar',
                label: 'Bar',
              },
            ],
            other: 'props',
          },
          other: 'props',
        },
        other: 'props',
      },
      other: 'props',
    });
  });
});

describe('rackerCopilot', () => {
  it('adds primary nav links for Rackers when viewing data for specific account', () => {
    const catalog = { ...sampleCatalog, rackspaceAccountNumber: '123456' };
    const overrides = copilot.rackerCatalog(catalog);
    const primaryNavigation = overrides.catalog.catalog.primaryNavigation;

    expect(primaryNavigation.links).toHaveLength(1);
  });

  it('adds primary nav links for Rackers when viewing data for a specific account and GOSS org', () => {
    const catalog = { ...sampleCatalog, rackspaceAccountNumber: '123456', organizationId: '1234-5678-9012' };
    const overrides = copilot.rackerCatalog(catalog);
    const primaryNavigation = overrides.catalog.catalog.primaryNavigation;

    expect(primaryNavigation.links).toHaveLength(3);
  });

  it('omits primary nav links for Rackers when not viewing specific account', () => {
    const catalog = { ...sampleCatalog, rackspaceAccountNumber: null };
    const overrides = copilot.rackerCatalog(catalog);
    const primaryNavigation = overrides.catalog.catalog.primaryNavigation;

    expect(primaryNavigation.links).toHaveLength(0);
  });
});
