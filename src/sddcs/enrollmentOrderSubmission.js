import React from 'react';
import { Form, Modal, Table, Tooltip } from '@janus.team/janus-particles';
import { GOSSServices, enrollVM } from '../data/vms';
import classNames from 'classnames';

export const EnrollModal = ({ onClose, ...props }) => {
  return (
    <React.Fragment>
      <div
        className={classNames({
          'goss-modal': true,
          'goss-modal--enrollment': true,
          'goss-modal--isOsAdminDirty': props.isOsAdminDirty,
        })}
      >
        <Modal onClose={() => onClose()} size="large">
          <Modal.Header title="Enroll in Guest OS Services" />
          <Modal.Body>
            <EnrollOrderConfirmTable
              enrollments={props.enrollments}
              vmNameUuidOrderMappings={props.vmNameUuidOrderMappings}
            />
          </Modal.Body>
          <Modal.Footer>
            <GOSSCredentialForm
              organization={props.organization}
              sddc={props.sddc}
              enrollments={props.enrollments}
              onEnrollmentStarted={props.onEnrollmentStarted}
              onEnrollmentCompleted={props.onEnrollmentCompleted}
              isOsAdminDirty={props.isOsAdminDirty}
            />
          </Modal.Footer>
        </Modal>
      </div>
    </React.Fragment>
  );
};

const EnrollOrderConfirmTable = ({ enrollments, vmNameUuidOrderMappings }) => {
  return (
    <>
      <Table.Wrapper>
        <Table>
          <Table.Header>
            <Table.Row data-testid="vm-enroll-order-table-row">
              <Table.Cell header={true} compact={true} className="goss-vm-table-row__name">
                VM/Instance UUID
              </Table.Cell>
              <Table.Cell header={true} compact={true} className="goss-vm-table-row__enrollment">
                OS Administration
              </Table.Cell>
              <Table.Cell header={true} compact={true} className="goss-vm-table-row__enrollment">
                Monitoring
              </Table.Cell>
              <Table.Cell header={true} compact={true} className="goss-vm-table-row__enrollment">
                Patching
              </Table.Cell>
            </Table.Row>
          </Table.Header>
        </Table>
      </Table.Wrapper>
      <Table.Wrapper className="goss-vm-table__body-scroll">
        <Table>
          <Table.Body>
            {Object.keys(enrollments).map(enrollment => (
              <EnrollOrderConfirmServiceTableRow
                key={enrollment}
                vmName={vmNameUuidOrderMappings[enrollment]}
                vmUuid={enrollment}
                enrollments={enrollments}
              />
            ))}
          </Table.Body>
        </Table>
      </Table.Wrapper>
    </>
  );
};

const EnrollOrderConfirmServiceTableRow = ({ vmName, vmUuid, enrollments }) => {
  return (
    <Table.Row>
      <Table.Cell compact={true} className="goss-vm-table-row__name particles-table__table-cell--dualline">
        <div>
          <div>
            <strong data-testid="vm-enroll-order-table-row-name">{vmName}</strong>
          </div>
          <div>{vmUuid}</div>
        </div>
      </Table.Cell>
      <EnrollOrderConfirmServiceTableCell
        vmUuid={vmUuid}
        enrollments={enrollments}
        serviceType={GOSSServices.OS_ADMINISTRATION}
      />
      <EnrollOrderConfirmServiceTableCell
        vmUuid={vmUuid}
        enrollments={enrollments}
        serviceType={GOSSServices.MONITORING}
      />
      <EnrollOrderConfirmServiceTableCell
        vmUuid={vmUuid}
        enrollments={enrollments}
        serviceType={GOSSServices.PATCHING}
      />
    </Table.Row>
  );
};

const EnrollOrderConfirmServiceTableCell = ({ vmUuid, enrollments, serviceType }) => {
  return (
    <Table.Cell compact={true} className="goss-vm-table-row__order">
      {enrollments[vmUuid].includes(serviceType) ? (
        <i data-testid="vm-enroll-order-table-row--add" className="hxIcon hx--type--checkmark fa fa-plus"></i>
      ) : (
        <i data-testid="vm-enroll-order-table-row--remove" className="hxIcon hx--type--checkmark fa fa-minus"></i>
      )}
    </Table.Cell>
  );
};

const GOSSCredentialForm = ({
  organization,
  sddc,
  enrollments,
  setLoading,
  onEnrollmentStarted,
  onEnrollmentCompleted,
  isOsAdminDirty,
}) => {
  const [data, setData] = React.useState({ username: '', password: '' });
  const [form, setForm] = React.useState({ dirty: false, submitting: false });

  const onFormChange = e => {
    setForm({ ...form, dirty: true });
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const onFormSubmit = async e => {
    e.preventDefault();

    setForm({ ...form, submitting: true });
    onEnrollmentStarted();

    const executions = Object.keys(enrollments).map(vmId => {
      return enrollVM(
        { organizationId: organization.id, sddcId: sddc.id, vmId, domain: organization.domain },
        {
          services: enrollments[vmId],
          username: data.username,
          password: data.password,
        },
      );
    });
    await Promise.all(executions);

    setData({ username: '', password: '' });
    setForm({ dirty: false, submitting: false });
    onEnrollmentCompleted();
  };

  return (
    <Form
      className="goss-form--enrollment"
      dirty={form.dirty}
      submitting={form.submitting}
      onChange={onFormChange}
      onSubmit={onFormSubmit}
      data-testid="vm-enroll-order-form"
    >
      {isOsAdminDirty && (
        <Form.Input
          className="goss-input__enrollment--username"
          value={data.username}
          required={true}
          type="text"
          name="username"
          label="Username"
          onChange={onFormChange}
          data-testid="vm-enroll-order-form--username"
        />
      )}
      {isOsAdminDirty && (
        <Form.Input
          className="goss-input__enrollment--password"
          value={data.password}
          required={true}
          type="password"
          name="password"
          label="Password"
          onChange={onFormChange}
          data-testid="vm-enroll-order-form--password"
        />
      )}
      <Form.Actions compact>
        <div className="goss-modal--enrollment__submit">
          <Form.Action
            type="submit"
            primary={true}
            requiresChanges={isOsAdminDirty}
            data-testid="goss-enrollment-form-submit"
          >
            <b>SUBMIT</b>
          </Form.Action>
        </div>
        <Tooltip placement="right" content={<PriceInformation />} arrow={true}>
          <i className="fas fa-dollar-sign goss-modal--enrollment" />
        </Tooltip>
      </Form.Actions>
      <i className="goss-order-submission__terms">
        By submitting your order, you agree to the information and terms listed in these
        <a href="https://www.rackspace.com/information/legal/guestosservices" target="_blank" rel="noopener noreferrer">
          {' '}
          terms
        </a>
        .
      </i>
    </Form>
  );
};

const PriceInformation = () => {
  return (
    <>
      <p>This action will affect your bill. Services will be charged at your currently agreed upon rates.</p>
      <p>Standard prices are per VM, per service listed:</p>
      <ul>
        <li>$50 administration</li>
        <li>$75 monitoring</li>
        <li>$25 Patching</li>
      </ul>
    </>
  );
};
