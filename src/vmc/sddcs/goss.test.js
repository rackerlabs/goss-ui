import React from 'react';
import { render, fireEvent, getByTestId, waitForDomChange, queryByTestId } from '@testing-library/react';
import { GOSSEnrollmentSection } from './goss';
import * as vms from '../data/vms';

const jobs = [
  {
    id: '1234117.create-organization.5ca00ac4f2d74c58954def461539dd3d',
    type: 'create-organization',
    status: 'ERROR',
    vm_uuid: '564de529-b39c-1e30-659f-ONE',
  },
  {
    id: '1234117.enroll-vm.1eda27c9e3bf4e78bca6790859dc3436',
    type: 'enroll-vm',
    status: 'SUCCEEDED',
    vm_uuid: '564de529-b39c-1e30-659f-TWO',
  },
];

const organization = {
  id: '1',
  display_name: 'Janus - Dev',
  status: 'BUSTED',
  created: '2018-11-18T13:41:00.016000',
  domain: '0123456',
  systems_account: '0123456789012',
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
        key: 103,
        name: 'com.rackspace.goss.goss.vm.ssmid',
      },
      {
        key: 100234,
        name: 'com.rackspace.goss.goss.vm.services.os.admin',
      },
    ],
    value: [
      {
        key: 103,
        value: 'mi-12345',
      },
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
        name: 'com.rackspace.goss.goss.vm.services.os.admin',
      },
    ],
    value: [
      {
        key: 100234,
        value: 'not enrolled',
      },
    ],
  },
];

const renderPage = props => {
  const tree = <GOSSEnrollmentSection jobs={jobs} organization={organization} sddc={sddc} vms={sddcVMs} {...props} />;
  return render(tree);
};

describe('GOSSEnrollmentSection', () => {
  it('renders enrollment table', async () => {
    const page = renderPage();
    const vmTableRows = await page.findAllByTestId('vm-table-row');

    expect(vmTableRows.length).toEqual(sddcVMs.length);

    sddcVMs.forEach((vm, i) => {
      const { OS_ADMINISTRATION, MONITORING, PATCHING } = vms.GOSSServices;

      expect(getByTestId(vmTableRows[i], 'vm-table-row-name').innerHTML).toBe(vm.name);
      expect(getByTestId(vmTableRows[i], 'vm-table-row-id').innerHTML).toBe(vm.config$instanceUuid);
      expect(getByTestId(vmTableRows[i], 'vm-table-row-osadmin').checked).toEqual(
        vms.enrolledInGOSSService(vm, OS_ADMINISTRATION),
      );
      expect(getByTestId(vmTableRows[i], 'vm-table-row-monitoring').checked).toEqual(
        vms.enrolledInGOSSService(vm, MONITORING),
      );
      expect(getByTestId(vmTableRows[i], 'vm-table-row-patching').checked).toEqual(
        vms.enrolledInGOSSService(vm, PATCHING),
      );
      expect(getByTestId(vmTableRows[i], 'vm-table-row-os').innerHTML).toBe(vms.guestFamilyDisplayName(vm));

      const grandCentralButton = vmTableRows[i].querySelector('rax-magicbutton');
      expect(grandCentralButton.getAttribute('system')).toEqual('faws-vmware');
      expect(grandCentralButton.getAttribute('account')).toEqual(organization.domain);
      expect(grandCentralButton.getAttribute('awsaccount')).toEqual(organization.systems_account);
      expect(grandCentralButton.getAttribute('platform')).toEqual(vms.guestFamilyDisplayName(vm));
      expect(grandCentralButton.getAttribute('targetid')).toEqual(vms.managedInstanceId(vm));
      expect(grandCentralButton.getAttribute('region')).toEqual(sddc.region);
    });
  });

  it('removes enrollment options for unsupported OSes', () => {
    const page = renderPage({
      vms: [
        ...sddcVMs,
        {
          _rackspace: {
            accountId: '1234117',
          },
          config$instanceUuid: '564de529-b39c-1e30-659f-UNSUPPORTED',
          guest: {
            guestFamily: 'solarisGuest',
            guestFullName: 'Solaris',
            guestState: 'running',
          },
          name: 'UNSUPPORTED',
          availableField: [],
        },
      ],
    });

    const unsupportedRow = page.queryAllByTestId('vm-table-row')[2];
    const checkboxes = unsupportedRow.querySelectorAll('input[type="checkbox]');
    expect(checkboxes.length).toEqual(0);
  });

  it('shows pending enrollment banner when enrollment jobs are in progress', () => {
    const page = renderPage({
      jobs: [
        ...jobs,
        {
          id: '1234117.enroll-vm.fb5c5585d854467980e55b82e5c4381a',
          type: 'enroll-vm',
          status: 'RUNNING',
        },
      ],
    });

    expect(page.queryAllByTestId('vm-pending-enrollment-banner').length).toBe(1);
  });

  it('does not show pending enrollment banner when no enrollment jobs are in progress', () => {
    const page = renderPage({
      jobs: [
        ...jobs,
        {
          id: '1234117.enroll-vm.fb5c5585d854467980e55b82e5c4381a',
          type: 'enroll-vm',
          status: 'SUCCEEDED',
        },
      ],
    });

    expect(page.queryAllByTestId('vm-pending-enrollment-banner').length).toBe(0);
  });

  it('disables table actions when no changes have been made', () => {
    const page = renderPage();
    const enrollButton = page.getByTestId('vm-action-enroll');
    const cancelButton = page.getByTestId('vm-action-cancel');

    expect(enrollButton.disabled).toEqual(true);
    expect(cancelButton.disabled).toEqual(true);
  });

  it('hides service checkboxes VM row if enrollment is in progress', async () => {
    const page = renderPage({
      jobs: [
        ...jobs,
        {
          id: '1234117.enroll-vm.fb5c5585d854467980e55b82e5c4381a',
          type: 'enroll-vm',
          status: 'RUNNING',
          vm_uuid: '564de529-b39c-1e30-659f-TWO',
        },
      ],
    });

    const vmTableRows = await page.findAllByTestId('vm-table-row');

    sddcVMs.forEach((vm, i) => {
      if (vm.config$instanceUuid === '564de529-b39c-1e30-659f-TWO') {
        // Enrollments are running on the VM so all 3 service boxes will not be rendered
        expect(queryByTestId(vmTableRows[i], 'vm-table-row-osadmin')).toBeNull();
        expect(queryByTestId(vmTableRows[i], 'vm-table-row-monitoring')).toBeNull();
        expect(queryByTestId(vmTableRows[i], 'vm-table-row-patching')).toBeNull();

        // Instead, a table cell spanning the 3 columns will replace it
        expect(queryByTestId(vmTableRows[i], 'vm-table-row-enrolling')).not.toBeNull();
      }
    });
  });

  it('if VM has no pending enrollments, OS Admin is enabled', async () => {
    const page = renderPage();

    const vmTableRows = await page.findAllByTestId('vm-table-row');

    sddcVMs.forEach((vm, i) => {
      if (vm.config$instanceUuid === '564de529-b39c-1e30-659f-TWO') {
        // OS Admin will not be disabled because VM is powered on and no enrollments are running on the VM
        expect(getByTestId(vmTableRows[i], 'vm-table-row-osadmin').disabled).toEqual(false);
        expect(getByTestId(vmTableRows[i], 'vm-table-row-monitoring').disabled).toEqual(true);
        expect(getByTestId(vmTableRows[i], 'vm-table-row-patching').disabled).toEqual(true);
      }
    });
  });

  it('changes checkbox value and enables table actions when checkbox is checked', () => {
    const page = renderPage();

    const osAdminCheckbox = page.getAllByTestId('vm-table-row-osadmin')[1];
    expect(osAdminCheckbox.checked).toEqual(false);

    fireEvent.click(osAdminCheckbox, { target: { checked: true } });

    const enrollButton = page.getByTestId('vm-action-enroll');
    const cancelButton = page.getByTestId('vm-action-cancel');

    expect(enrollButton.disabled).toEqual(false);
    expect(cancelButton.disabled).toEqual(false);
    expect(osAdminCheckbox.checked).toEqual(true);
  });

  it('changes checkbox value and enables table actions when checkbox is unchecked', () => {
    const page = renderPage();

    const osAdminCheckbox = page.getAllByTestId('vm-table-row-osadmin')[0];
    expect(osAdminCheckbox.checked).toEqual(true);

    fireEvent.click(osAdminCheckbox, { target: { checked: true } });

    const enrollButton = page.getByTestId('vm-action-enroll');
    const cancelButton = page.getByTestId('vm-action-cancel');

    expect(enrollButton.disabled).toEqual(false);
    expect(cancelButton.disabled).toEqual(false);
    expect(osAdminCheckbox.checked).toEqual(false);
  });

  it('submits staged enrollments when Enroll is clicked', async () => {
    jest.spyOn(vms, 'enrollVM').mockResolvedValue();

    const page = renderPage();

    fireEvent.click(page.getAllByTestId('vm-table-row-osadmin')[0], { target: { checked: true } });
    fireEvent.click(page.getAllByTestId('vm-table-row-osadmin')[1], { target: { checked: false } });
    fireEvent.click(page.getByTestId('vm-action-enroll'));

    fireEvent.change(page.getByLabelText('Username'), { target: { value: 'username' } });
    fireEvent.change(page.getByLabelText('Password'), { target: { value: 'secret' } });
    fireEvent.click(page.getByTestId('goss-enrollment-form-submit'));

    expect(vms.enrollVM).toBeCalledWith(
      {
        domain: '0123456',
        organizationId: organization.id,
        sddcId: sddc.id,
        vmId: '564de529-b39c-1e30-659f-ONE',
      },
      {
        services: [],
        username: 'username',
        password: 'secret',
      },
    );

    expect(vms.enrollVM).toBeCalledWith(
      {
        domain: '0123456',
        organizationId: organization.id,
        sddcId: sddc.id,
        vmId: '564de529-b39c-1e30-659f-TWO',
      },
      {
        services: [vms.GOSSServices.OS_ADMINISTRATION],
        username: 'username',
        password: 'secret',
      },
    );

    const enrollButton = page.getByTestId('vm-action-enroll');
    const cancelButton = page.getByTestId('vm-action-cancel');
    expect(enrollButton.classList).toContain('particles-button--loading');

    await waitForDomChange({ container: enrollButton });

    expect(enrollButton.classList).not.toContain('particles-button--loading');
    expect(enrollButton.disabled).toEqual(true);
    expect(cancelButton.disabled).toEqual(true);
  });

  it('clears staged enrollments when Enroll is clicked', async () => {
    const page = renderPage();

    fireEvent.click(page.getAllByTestId('vm-table-row-osadmin')[0], { target: { checked: true } });
    fireEvent.click(page.getAllByTestId('vm-table-row-osadmin')[1], { target: { checked: false } });
    fireEvent.click(page.getByTestId('vm-action-cancel'));

    const enrollButton = page.getByTestId('vm-action-enroll');
    const cancelButton = page.getByTestId('vm-action-cancel');

    expect(page.getAllByTestId('vm-table-row-osadmin')[0].checked).toBe(true);
    expect(page.getAllByTestId('vm-table-row-osadmin')[1].checked).toBe(false);
    expect(enrollButton.disabled).toEqual(true);
    expect(cancelButton.disabled).toEqual(true);
  });

  it('displays the relevant error information when the expand button is pressed and then hides it when it is pressed again', async () => {
    const page = renderPage(jobs);

    fireEvent.click(page.getByTestId('display-message-errow'));

    expect(page.queryAllByTestId('job-row').length).toBe(1);

    fireEvent.click(page.getByTestId('display-message-errow'));

    expect(page.queryAllByTestId('job-row').length).toBe(0);
  });
});
