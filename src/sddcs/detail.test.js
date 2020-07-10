import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { render, getNodeText } from '@testing-library/react';
import { SDDCDetail } from './detail';
import * as jobs from '../data/jobs';
import * as organizations from '../data/organizations';
import * as sddcs from '../data/sddcs';
import * as vms from '../data/vms';

const jobsData = [
  {
    id: '1234117.create-organization.5ca00ac4f2d74c58954def461539dd3d',
    type: 'create-organization',
    status: 'SUCCEEDED',
  },
  {
    id: '1234117.enroll-vm.1eda27c9e3bf4e78bca6790859dc3436',
    type: 'enroll-vm',
    status: 'SUCCEEDED',
  },
];

const organization = {
  id: '1',
  display_name: 'Janus - Dev',
  status: 'BUSTED',
  created: '2018-11-18T13:41:00.016000',
};

const sddc = {
  id: '1',
  name: 'Janus - Dev SDDC',
  region: 'US_EAST_1',
  hosts: 1,
  vcenter_url: 'https://myvcenter-1.com/',
};

const sddcVMs = [
  {
    _rackspace: {
      accountId: '1234117',
    },
    config$instanceUuid: '564de529-b39c-1e30-659f-ONE',
    guest: {
      guestFamily: 'linuxGuest',
      guestFullName: 'Ubuntu Linux (64-bit)',
      guestState: 'running',
    },
    name: 'ONE',
    availableField: [
      {
        key: 100234,
        name: 'com.rackspace.goss.goss.vm.services.os.admin',
      },
    ],
    value: [
      {
        key: 100234,
        value: 'enrolled',
      },
    ],
  },
  {
    _rackspace: {
      accountId: '1234117',
    },
    config$instanceUuid: '564de529-b39c-1e30-659f-TWO',
    guest: {
      guestFamily: 'linuxGuest',
      guestFullName: 'Ubuntu Linux (64-bit)',
      guestState: 'running',
    },
    name: 'TWO',
    availableField: [
      {
        key: 100234,
        name: 'com.rackspace.goss.goss.vm.services.patching',
      },
    ],
    value: [
      {
        key: 100234,
        value: 'enrolled',
      },
    ],
  },
];

const renderPage = () => {
  const tree = (
    <MemoryRouter initialEntries={['/organizations/org-1/sddcs/sddc-2']}>
      <Route path="/organizations/:organizationId/sddcs/:sddcId" component={SDDCDetail} />
    </MemoryRouter>
  );
  return render(tree);
};

describe('SDDCDetail', () => {
  it('renders org details', async () => {
    jest.spyOn(jobs, 'listJobs').mockResolvedValue(jobsData);
    jest.spyOn(organizations, 'getOrganization').mockResolvedValue(organization);
    jest.spyOn(sddcs, 'getSDDC').mockResolvedValue(sddc);
    jest.spyOn(vms, 'listVMs').mockResolvedValue(sddcVMs);

    const page = renderPage();

    // Wait for load
    await page.findAllByText('Janus - Dev SDDC');

    expect(getNodeText(page.getByTestId('sddc-detail-organization-breadcrumb'))).toEqual('Janus - Dev');
    expect(getNodeText(page.getByTestId('sddc-detail-sddc-breadcrumb'))).toEqual('Janus - Dev SDDC');
    expect(getNodeText(page.getByTestId('sddc-detail-title'))).toEqual('Janus - Dev SDDC');
    expect(getNodeText(page.getByTestId('sddc-detail-id'))).toEqual('1');
    expect(getNodeText(page.getByTestId('sddc-detail-region'))).toEqual('US_EAST_1');
    expect(getNodeText(page.getByTestId('sddc-detail-hosts'))).toEqual('1');
    expect(page.getByTestId('sddc-detail-console').href).toEqual(
      `https://vmc.vmware.com/console/sddcs/aws/${sddc.id}/summary?orgLink=/csp/gateway/am/api/orgs/${organization.id}`,
    );
    expect(page.getByTestId('sddc-detail-vcenter').href).toEqual(sddc.vcenter_url);
  });
});
