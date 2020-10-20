import React from 'react';
import { MemoryRouter, Router } from 'react-router-dom';
import { render, getByTestId } from '@testing-library/react';
import { OrganizationList, transformOrganizationList } from './list';
import * as jobsData from '../../data/jobs';
import * as orgsData from '../../data/organizations';
import { createMemoryHistory } from 'history';

const organizations = [
  {
    id: '3',
    display_name: 'GOSS - Dev',
    status: 'ACTIVE',
  },
  {
    id: '1',
    display_name: 'Janus - Dev',
    status: 'ACTIVE',
  },
  {
    id: '2',
    display_name: 'Janus - Prod',
    status: 'DISABLED',
  },
  {
    id: '4',
    display_name: 'GOSS - Prod',
    status: 'DISABLED',
  },
  {
    id: '5',
    display_name: 'RMS',
    status: 'DISABLED',
  },
  {
    id: '12345',
    display_name: 'Not Quite Ready',
    status: 'PENDING_GOSS_CREATION',
  },
];

const oneVisibleOrganization = [
  {
    id: '1',
    display_name: 'Janus - Dev',
    status: 'PENDING_GOSS_CREATION',
  },
  {
    id: '2',
    display_name: 'Janus - Prod',
    status: 'DISABLED',
  },
  {
    id: '4',
    display_name: 'GOSS - Prod',
    status: 'DISABLED',
  },
  {
    id: '5',
    display_name: 'RMS',
    status: 'DISABLED',
  },
];

const renderPage = () => {
  const tree = (
    <MemoryRouter>
      <OrganizationList />
    </MemoryRouter>
  );
  return render(tree);
};

const createPageHistory = async () => {
  const history = createMemoryHistory();
  render(
    <Router history={history}>
      <OrganizationList />
    </Router>,
  );
  return history;
};

describe('OrganizationList', () => {
  beforeEach(() => {
    jest.spyOn(jobsData, 'listJobs').mockResolvedValue([]);
  });

  it('renders cards for each org', async () => {
    jest.spyOn(orgsData, 'listOrganizations').mockResolvedValue(organizations);

    const page = renderPage();
    const cards = await page.findAllByTestId('organization-card');
    const displayedOrgs = transformOrganizationList(organizations);

    expect(cards.length).toEqual(displayedOrgs.length);

    displayedOrgs.forEach((org, i) => {
      expect(getByTestId(cards[i], 'organization-card-id').innerHTML).toBe(org.id);
      expect(getByTestId(cards[i], 'organization-card-name').innerHTML).toEqual(org.display_name);
    });
  });

  it('shows empty state when user has no orgs', async () => {
    jest.spyOn(orgsData, 'listOrganizations').mockResolvedValue([]);

    const page = renderPage();
    const card = await page.findAllByTestId('organization-create-card');

    expect(card.length).toEqual(1);
  });

  it("doesn't display a Create Organization card if there are orgs", async () => {
    jest.spyOn(orgsData, 'listOrganizations').mockResolvedValue(organizations);

    const page = renderPage();
    const createOrgCard = await page.queryByTestId('organization-create-card');

    expect(createOrgCard).toBeNull();
  });

  it('shows modal while initial org is being created', async () => {
    jest.spyOn(jobsData, 'listJobs').mockResolvedValue([
      {
        type: 'create-organization',
        status: 'RUNNING',
      },
    ]);
    jest.spyOn(orgsData, 'listOrganizations').mockResolvedValue([]);

    const page = renderPage();
    const orgPendingModal = await page.findByTestId('organization-pending-modal');

    expect(orgPendingModal).toBeTruthy();
  });

  it('redirects to the Organization card if there is only visible org', async () => {
    jest.spyOn(orgsData, 'listOrganizations').mockResolvedValue(oneVisibleOrganization);

    const history = await createPageHistory();
    await new Promise(resolve => setImmediate(resolve));

    expect(history.location.pathname).toBe('/organizations/1');
  });
});

describe('transformOrganizationList', () => {
  it('sorts by name and filters orgs that are not ACTIVE or PENDING_GOSS_CREATION', () => {
    expect(transformOrganizationList(organizations)).toEqual([
      {
        id: '1',
        display_name: 'Janus - Dev',
        status: 'ACTIVE',
      },
      {
        id: '12345',
        display_name: 'Not Quite Ready',
        status: 'PENDING_GOSS_CREATION',
      },
      {
        id: '3',
        display_name: 'GOSS - Dev',
        status: 'ACTIVE',
      },
    ]);
  });
});
