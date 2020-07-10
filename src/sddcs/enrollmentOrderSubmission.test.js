import React from 'react';
import { render, getNodeText, fireEvent, getByTestId, waitForDomChange } from '@testing-library/react';
import { EnrollModal } from './enrollmentOrderSubmission';
import * as vms from '../data/vms';
import { bool } from 'prop-types';

const dummyFunction = jest.fn(() => {
  return true;
});

const createEnrollmentPropsWithoutCredentialsFields = () => ({
  isOsAdminDirty: false,
  organization: '1',
  sddc: '1',
  onEnrollmentStarted: { dummyFunction },
  onEnrollmentCompleted: { dummyFunction },
  enrollments: ['1', vms.GOSSServices.OS_ADMINISTRATION, vms.GOSSServices.MONITORING, vms.GOSSServices.PATCHING],
  vmNameUuidOrderMappings: ['1', 'TestVM1'],
});

const createEnrollmentPropsWithCredentialsFields = () => ({
  isOsAdminDirty: true,
  organization: '1',
  sddc: '1',
  onEnrollmentStarted: { dummyFunction },
  onEnrollmentCompleted: { dummyFunction },
  enrollments: ['1', vms.GOSSServices.OS_ADMINISTRATION, vms.GOSSServices.MONITORING, vms.GOSSServices.PATCHING],
  vmNameUuidOrderMappings: ['1', 'TestVM1'],
});

const renderEnrollmentModal = props => {
  const component = (
    <EnrollModal
      onClose={jest.fn(() => {
        return true;
      })}
      {...props}
    />
  );
  return render(component);
};

describe('EnrollModal', () => {
  it('renders table of selected services', async () => {
    const component = renderEnrollmentModal(createEnrollmentPropsWithoutCredentialsFields());
    const title = component.getByText('Enroll in Guest OS Services');
    const tableRows = await component.findAllByTestId('vm-enroll-order-table-row');
    const credentialsForm = component.getByRole('form');

    expect(getNodeText(title)).toBe('Enroll in Guest OS Services');
    expect(tableRows.length).toBe(1);
    expect(credentialsForm).toBeDefined();

    expect(component.queryByTestId('vm-enroll-order-form--username')).toBeFalsy();
    expect(component.queryByTestId('vm-enroll-order-form--password')).toBeFalsy();
  });

  it('renders the credentials fields only if `osAdminIsDirty`', async () => {
    const component = renderEnrollmentModal(createEnrollmentPropsWithCredentialsFields());
    const credentialsForm = component.getByRole('form');

    expect(credentialsForm).toBeDefined();
    expect(component.queryByTestId('vm-enroll-order-form--username')).toBeDefined();
    expect(component.queryByTestId('vm-enroll-order-form--password')).toBeDefined();
  });

  it('renders "+" marks for all added services', async () => {
    const component = renderEnrollmentModal(createEnrollmentPropsWithoutCredentialsFields());
    const enrollmentAdds = await component.queryAllByTestId('vm-enroll-order-table-row--add');

    expect(enrollmentAdds.length).toBe(3);
  });
});
