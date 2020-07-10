import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { render, getByTestId, getNodeText } from '@testing-library/react';
import { OrganizationDetail } from './detail';
import * as organizations from '../data/organizations';
import * as sddcs from '../data/sddcs';

const organization = {
  id: '1',
  display_name: 'Janus - Dev',
  status: 'BUSTED',
  created: '2018-11-18T13:41:00.016000',
};

const organizationSDDCs = [
  {
    id: '1',
    name: 'Janus - Dev',
    region: 'US_EAST_1',
    hosts: 1,
    vcenter_url: 'https://myvcenter-1.com/',
  },
  {
    id: '2',
    name: 'Janus - Prod',
    region: 'US_EAST_2',
    hosts: 2,
    vcenter_url: 'https://myvcenter-2.com/',
  },
  {
    id: '3',
    name: 'GOSS - Dev',
    region: 'US_WEST_1',
    hosts: 3,
    vcenter_url: 'https://myvcenter-3.com/',
  },
  {
    id: '4',
    name: 'GOSS - Prod',
    region: 'US_WEST_2',
    hosts: 4,
    vcenter_url: 'https://myvcenter-4.com/',
  },
  {
    id: '5',
    name: 'RMS',
    region: 'CAN_EAST_1',
    hosts: 5,
    vcenter_url: 'https://myvcenter-5.com/',
  },
];

const renderPage = () => {
  const tree = (
    <MemoryRouter initialEntries={['/organizations/1']}>
      <Route path="/organizations/:organizationId" component={OrganizationDetail} />
    </MemoryRouter>
  );
  return render(tree);
};

describe('OrganizationDetail', () => {
  it('renders org details', async () => {
    jest.spyOn(organizations, 'getOrganization').mockResolvedValue(organization);
    jest.spyOn(sddcs, 'listSDDCs').mockResolvedValue(organizationSDDCs);

    const page = renderPage();

    // Wait for load
    await page.findAllByText('Janus - Dev');

    expect(getNodeText(page.getByTestId('organization-detail-breadcrumb'))).toEqual('Janus - Dev');
    expect(getNodeText(page.getByTestId('organization-detail-title'))).toEqual('Janus - Dev');
    expect(getNodeText(page.getByTestId('organization-detail-id'))).toEqual('1');

    expect(getNodeText(page.getByTestId('organization-detail-status').querySelector('.particles-pill'))).toEqual(
      'BUSTED',
    );

    expect(getNodeText(page.getByTestId('organization-detail-created').querySelector('.particles-date-time'))).toEqual(
      'Nov 18, 2018 1:41:00 PM',
    );

    expect(page.getByTestId('organization-detail-console').href).toEqual(
      'https://vmc.vmware.com/home?orgLink=/csp/gateway/am/api/orgs/1',
    );

    const cards = await page.findAllByTestId('sddc-card');

    expect(cards.length).toEqual(organizationSDDCs.length);

    organizationSDDCs.forEach((sddc, i) => {
      expect(getByTestId(cards[i], 'sddc-card-id').innerHTML).toBe(sddc.id);
      expect(getByTestId(cards[i], 'sddc-card-name').innerHTML).toBe(sddc.name);
      expect(getByTestId(cards[i], 'sddc-card-region').innerHTML).toEqual(sddc.region);
      expect(getByTestId(cards[i], 'sddc-card-hosts').innerHTML).toEqual(sddc.hosts.toString());
      expect(getByTestId(cards[i], 'sddc-card-console').href).toEqual(
        `https://vmc.vmware.com/console/sddcs/aws/${sddc.id}/summary?orgLink=/csp/gateway/am/api/orgs/${organization.id}`,
      );
      expect(getByTestId(cards[i], 'sddc-card-vcenter').href).toEqual(sddc.vcenter_url);
    });
  });
});
