import React from 'react';
import { AlertBar, Button, Collection, Modal, Page, Table, Popover, Card, Grid } from '@janus.team/janus-particles';
import { listJobs } from '../../data/vmc/jobs';
import _ from 'lodash';
import {
  GOSSServices,
  getServiceListForVM,
  guestFamilyDisplayName,
  isGOSSSupported,
  isPoweredOn,
  managedInstanceId,
  generateVMEnrollmentCSVData,
} from '../data/vms';
import { EnrollModal } from './enrollmentOrderSubmission';
import { VmErrorTableRow } from './vmErrorTableRow';
import GenerateCSV from '../common/GenerateCSV';

export const GOSSEnrollmentSection = ({ domain, jobs, setJobs, organization, sddc, vms }) => {
  const [isDirty, setDirty] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const [isWaitingForJobUpdate, setWaitingForJobUpdate] = React.useState(false);
  const [enrollments, setEnrollments] = React.useState({});
  const [isOsAdminDirty, setIsOsAdminDirty] = React.useState(false);
  const [isEnrollModalVisible, setEnrollModalVisible] = React.useState(false);
  const [vmNameUuidOrderMappings, setVmNameUuidOrderMappings] = React.useState({});
  const [isEnrolling, setEnrolling] = React.useState(false);
  const [visibleErrorList, setVisibleErrorList] = React.useState([]);
  const [isPopoverVisible, setPopoverVisible] = React.useState(false);
  const [areActionsVisible, setActionsVisible] = React.useState(false);

  React.useEffect(() => {
    setWaitingForJobUpdate(false);
  }, [jobs]);

  /*

  stageEnrollment implements the core change tracking logic that the UI uses to determine what
  API calls need to be made when the "Enroll" button is clicked. It operates on a sparse
  dictionary that contains all VM enrollments that should be submitted. No data exists in the
  sparse dictionary until the user has made changed to the form. A sparse array is used so that
  we only make enrollment API calls for VMs when their list of enrolled services has changed.

  When a checkbox is clicked, stageEnrollment checks to see whether a modified list already
  exists in the sparse array (i.e. has already been changed). If it exists, that is used as the
  previous state. If it does not exist, the function falls back to the original data received from
  the API. If the newly checked (or unchecked) service exists in the previous state, the function
  removes it from the service list. If it did not already exist in the previous state, the function
  appends it to the service list. Finally, the sparse array is modified with the new state and the
  UI is updated to reflect the freshly updated enrollment data.

  This implementation currently has one major limitation. If you add a new service and then
  remove it prior to clicking "Enroll", this is still considered a change even though the service
  list has not really changed.
  */

  const stageEnrollment = (vm, service) => {
    const uuid = vm.config$instanceUuid;
    let services = enrollments[uuid] || getServiceListForVM(vm);

    if (!wasVmPreviouslyEnrolled(vm, service) && service === GOSSServices.OS_ADMINISTRATION) {
      /*
        Set a dummy switch, such that any time a user "checks" OS Admin once, anywhere on the page where
        it wasn't checked before, we will later present the credentials fields when they click the "Enroll"
        button.
      */
      setIsOsAdminDirty(true);
    }

    if (services.includes(service)) {
      services = services.filter(s => s !== service);
    } else {
      services = [...services, service];
    }
    setEnrollments({ ...enrollments, [uuid]: services });
    setVmNameUuidOrderMappings({ ...vmNameUuidOrderMappings, [uuid]: vm.name });
    setDirty(true);
  };

  const showEnrollModal = () => {
    setEnrollModalVisible(true);
    document.body.style.overflow = 'hidden';
  };

  const closeEnrollModal = () => {
    setEnrollModalVisible(false);
    document.body.style.overflow = 'auto';
  };

  const enrollmentSubmissionInProgress = () => {
    setEnrolling(true);
  };

  const enrollmentSubmissionComplete = () => {
    setEnrolling(false);
  };

  const onEnrollmentStarted = () => {
    setLoading(true);
    closeEnrollModal();
    enrollmentSubmissionInProgress();
    setPopoverVisible(false);
  };

  const onEnrollmentCompleted = () => {
    setDirty(false);
    setLoading(false);
    setWaitingForJobUpdate(true);

    // Reset enrollments state
    setEnrollments({});

    // Re-make the call to get all jobs
    updateJobsList();
  };

  const updateJobsList = async () => {
    const jobs = await listJobs(domain);
    setJobs(jobs);
    enrollmentSubmissionComplete();
  };

  const isVmBeingEnrolled = vm => {
    const uuid = vm.config$instanceUuid;
    const vmJobs = jobs.filter(job => job.vm_uuid === uuid);
    return vmJobs.some(job => job.type === 'enroll-vm' && job.status === 'RUNNING');
  };

  const clearStagedEnrollments = () => {
    setDirty(false);
    setEnrollments({});
  };

  const isEnrolledInService = (vm, service) => {
    const uuid = vm.config$instanceUuid;
    const services = enrollments[uuid] || getServiceListForVM(vm);
    return services.includes(service);
  };

  const wasVmPreviouslyEnrolled = (vm, service) => getServiceListForVM(vm).includes(service);

  const findJobError = vm => {
    let job = _.findLast(_.sortBy(jobs, ['stop_date']), ['vm_uuid', vm.config$instanceUuid]);
    return !!job && job.status === 'ERROR' ? job : null;
  };

  const addVisibleError = (vm_uuid, selected) => {
    setVisibleErrorList({ ...visibleErrorList, [vm_uuid]: selected });
  };

  const hasPendingEnrollments =
    isWaitingForJobUpdate ||
    jobs.some(job => {
      return job.type === 'enroll-vm' && job.status === 'RUNNING';
    });

  const selectAll = source => {
    const allInputs = document.querySelectorAll("input[type='checkbox']");
    allInputs.forEach(it => {
      it.checked = source;
    });
  };

  // TODO: Implement functionality for filtering VMs based on card that is active
  const EnrollmentCountCards = ({ vms }) => {
    return (
      <Grid withGutters>
        <Grid.Cell xs={12} sm={4} md={3} verticalGutter>
          <Card footer={'Enrolled Instances'}>
            <div className={'enrollment-card-text'}>{vms.length}</div>
          </Card>
        </Grid.Cell>
        <Grid.Cell xs={12} sm={4} md={3} verticalGutter>
          <Card footer={'Unenrolled Instances'}>
            <div className={'enrollment-card-text'}>{vms.length}</div>
          </Card>
        </Grid.Cell>
        <Grid.Cell xs={12} sm={4} md={3} verticalGutter>
          <Card footer={'Unsupported Instances'}>
            <div className={'enrollment-card-text'}>{vms.length}</div>
          </Card>
        </Grid.Cell>
      </Grid>
    );
  };

  const filtersMenu = (
    <div className={'filtersMenu'}>
      <div>
        <a href="#">Filter 1</a>
      </div>
    </div>
  );

  const actions = (
    <div className={'actionButtonGroup'}>
      <Collection compact className={'actions'}>
        <hx-disclosure
          class="hxBtn hxPrimary"
          aria-controls="actionMenu"
          loading={isLoading}
          data-testid="vm-action-enroll"
        >
          Actions
        </hx-disclosure>
        <hx-popover id="actionMenu" position="bottom-center">
          <header>Bulk Actions</header>
          <hx-div>
            <div>Add Tag(s)</div>
            <div>Modify Services</div>
            <div>Unenroll Instances</div>
          </hx-div>
        </hx-popover>
        <GenerateCSV
          filename={`VM-Enrollement--${organization.display_name}--${sddc.name}.csv`}
          data={generateVMEnrollmentCSVData(vms)}
        />
        {/*{isEnrollModalVisible && ( // TODO: remove buttons and port functionality to Actions menu
          <EnrollModal
            title="Enroll in Guest OS Services"
            organization={organization}
            sddc={sddc}
            enrollments={enrollments}
            onEnrollmentStarted={onEnrollmentStarted}
            onEnrollmentCompleted={onEnrollmentCompleted}
            isOsAdminDirty={isOsAdminDirty}
            onClose={closeEnrollModal}
            vmNameUuidOrderMappings={vmNameUuidOrderMappings}
          />
        )}
        <Button primary disabled={!isDirty} loading={isLoading} data-testid="vm-action-enroll" onClick={showEnrollModal}>
          Submit Changes
        </Button>
        <Button secondary disabled={!isDirty} data-testid="vm-action-cancel" onClick={clearStagedEnrollments}>
          Cancel
        </Button>*/}
      </Collection>
      <div className={'filters'}>
        <hx-disclosure class="hxBtn" aria-controls="filters">
          Filters&nbsp;&nbsp;
          <i className="fa fa-filter" aria-hidden="true" />
        </hx-disclosure>
        <hx-popover id="filters" position="bottom-center">
          <header>Filter Header</header>
          <hx-div>
            <div>Filters Go Here</div>
          </hx-div>
        </hx-popover>
      </div>
    </div>
  );

  return (
    <Page.MainBodySection className="goss-services-main-body-section">
      {hasPendingEnrollments && (
        <React.Fragment>
          <AlertBar data-testid="vm-pending-enrollment-banner">
            VMs are currently being enrolled in Guest OS Services. These VMs are marked below and cannot be edited until
            enrollment is complete. All other VMs are available for enrollment.
          </AlertBar>
          <br />
        </React.Fragment>
      )}
      {isEnrolling && (
        <React.Fragment>
          <div
            className="goss-modal goss-modal--education goss-modal--captive goss-modal--spinner"
            data-testid="enrollment-in-progress-modal"
          >
            <Modal>
              <Modal.Header title="Submitting Enrollments..." />
              <div className="particles-modal__steps">
                <i className="fa fa-spinner fa-spin fa-2x" />
              </div>
            </Modal>
          </div>
        </React.Fragment>
      )}
      <EnrollmentCountCards vms={vms} />
      {actions}
      <br />
      <Table.Wrapper>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Cell header={true} compact={true} className="goss-vm-table-row__checkbox">
                <input type="checkbox" onClick={e => selectAll(e.target.checked)} />
              </Table.Cell>
              <Table.Cell header={true} compact={true} className="goss-vm-table-row__job-state">
                Status
              </Table.Cell>
              <Table.Cell header={true} compact={true} className="goss-vm-table-row__name">
                Instance
              </Table.Cell>
              <Table.Cell header={true} compact={true} className="goss-vm-table-row__group">
                Service Group
              </Table.Cell>
              <Table.Cell header={true} compact={true} className="goss-vm-table-row__tags">
                Tags
              </Table.Cell>
              <Table.Cell header={true} compact={true} className="goss-vm-table-row__administration">
                Administration
              </Table.Cell>
              <Table.Cell header={true} compact={true} className="goss-vm-table-row__antivirus">
                Anti-Virus
              </Table.Cell>
              <Table.Cell header={true} compact={true} className="goss-vm-table-row__backup">
                Backup
              </Table.Cell>
              <Table.Cell header={true} compact={true} className="goss-vm-table-row__disasterRecovery">
                Disaster Recovery
              </Table.Cell>
              <Table.Cell header={true} compact={true} className="goss-vm-table-row__monitoring">
                Monitoring
              </Table.Cell>
              <Table.Cell header={true} compact={true} className="goss-vm-table-row__patching">
                Patching
              </Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {vms.map(vm => {
              return (
                <React.Fragment>
                  <VMTableRow
                    key={vm.config$instanceUuid}
                    organization={organization}
                    sddc={sddc}
                    vm={vm}
                    isVmBeingEnrolled={isVmBeingEnrolled(vm)}
                    isEnrolledInService={isEnrolledInService}
                    stageEnrollment={stageEnrollment}
                    hasJobError={Boolean(findJobError(vm))}
                    visibleErrorList={visibleErrorList}
                    addVisibleError={addVisibleError}
                  />
                  {findJobError(vm) && _.get(visibleErrorList, vm.config$instanceUuid) && (
                    <VmErrorTableRow job={findJobError(vm)} />
                  )}
                </React.Fragment>
              );
            })}
          </Table.Body>
        </Table>
      </Table.Wrapper>
    </Page.MainBodySection>
  );
};

const VMTableRow = ({
  organization,
  sddc,
  vm,
  isVmBeingEnrolled,
  isEnrolledInService,
  stageEnrollment,
  hasJobError,
  addVisibleError,
  visibleErrorList,
}) => {
  const [isShowingError, setIsShowingError] = React.useState(false);
  const [isShowingVmMenu, setIsShowingVmMenu] = React.useState(false);
  const poweredOn = isPoweredOn(vm);

  const toggleShowVmMenu = () => {
    setIsShowingVmMenu(!isShowingVmMenu);
  };

  return (
    <Table.Row data-testid="vm-table-row" style={{ background: isVmBeingEnrolled ? '#bbdefb' : 'none' }}>
      <Table.Cell compact={true}>
        <input type="checkbox" disabled={isVmBeingEnrolled || !poweredOn} data-testid="vm-table-row-monitoring" />
      </Table.Cell>
      <Table.Cell
        compact={true}
        className={`goss-vm-table-row__job-state ${hasJobError && 'goss-vm-table-row__job-error-state'}`}
      >
        <Grid>
          <Grid.Cell lg={6}>
            <i className="fas fa-circle"></i>
          </Grid.Cell>
          <Grid.Cell lg={6}>
            <Popover
              content={'VM Menu'}
              placement="top"
              visible={isShowingVmMenu}
              onHide={() => setIsShowingVmMenu(false)}
            >
              <Button.WithRef tertiary onClick={toggleShowVmMenu}>
                <i className="fas fa-cog"></i>
              </Button.WithRef>
            </Popover>
          </Grid.Cell>
        </Grid>
      </Table.Cell>
      <Table.Cell compact={true} className="goss-vm-table-row__name particles-table__table-cell--dualline">
        <rax-magicbutton
          system="faws-vmware"
          account={organization.domain}
          awsaccount={organization.systems_account}
          platform={guestFamilyDisplayName(vm)}
          targetid={managedInstanceId(vm)}
          region={sddc.region}
        />
        <div>
          <strong data-testid="vm-table-row-name">{vm.name}</strong>
        </div>
      </Table.Cell>
      <Table.Cell compact={true}>{vm?.serviceGroups}</Table.Cell>
      <Table.Cell compact={true}>{vm?.tagGroups}</Table.Cell>
      {isVmBeingEnrolled ? (
        <Table.Cell
          compact={true}
          className="goss-vm-table-row__vm-enrolling"
          colspan="3"
          onHover={() => {
            this.style = { color: 'inherit' };
          }}
          data-testid="vm-table-row-enrolling"
        >
          <i>Currently Enrolling...</i>
        </Table.Cell>
      ) : (
        <React.Fragment>
          <Table.Cell compact={true} className="goss-vm-table-row__enrollment">
            <IsGOSSSupported vm={vm}>
              <input
                type="checkbox"
                disabled={isVmBeingEnrolled || !poweredOn}
                checked={isEnrolledInService(vm, GOSSServices.OS_ADMINISTRATION)}
                onChange={() => stageEnrollment(vm, GOSSServices.OS_ADMINISTRATION)}
                data-testid="vm-table-row-osadmin"
              />
            </IsGOSSSupported>
          </Table.Cell>
          <Table.Cell compact={true} className="goss-vm-table-row__enrollment">
            <IsGOSSSupported vm={vm}>
              <input
                type="checkbox"
                disabled={isVmBeingEnrolled || !isEnrolledInService(vm, GOSSServices.OS_ADMINISTRATION) || !poweredOn}
                checked={
                  isEnrolledInService(vm, GOSSServices.OS_ADMINISTRATION) &&
                  isEnrolledInService(vm, GOSSServices.ANTIVIRUS)
                }
                onChange={() => stageEnrollment(vm, GOSSServices.ANTIVIRUS)}
                data-testid="vm-table-row-monitoring"
              />
            </IsGOSSSupported>
          </Table.Cell>
          <Table.Cell compact={true} className="goss-vm-table-row__enrollment">
            <IsGOSSSupported vm={vm}>
              <input
                type="checkbox"
                disabled={isVmBeingEnrolled || !isEnrolledInService(vm, GOSSServices.OS_ADMINISTRATION) || !poweredOn}
                checked={
                  isEnrolledInService(vm, GOSSServices.OS_ADMINISTRATION) &&
                  isEnrolledInService(vm, GOSSServices.BACKUP)
                }
                onChange={() => stageEnrollment(vm, GOSSServices.BACKUP)}
                data-testid="vm-table-row-monitoring"
              />
            </IsGOSSSupported>
          </Table.Cell>
          <Table.Cell compact={true} className="goss-vm-table-row__enrollment">
            <IsGOSSSupported vm={vm}>
              <input
                type="checkbox"
                disabled={isVmBeingEnrolled || !isEnrolledInService(vm, GOSSServices.OS_ADMINISTRATION) || !poweredOn}
                checked={
                  isEnrolledInService(vm, GOSSServices.OS_ADMINISTRATION) &&
                  isEnrolledInService(vm, GOSSServices.DISASTER_RECOVERY)
                }
                onChange={() => stageEnrollment(vm, GOSSServices.DISASTER_RECOVERY)}
                data-testid="vm-table-row-monitoring"
              />
            </IsGOSSSupported>
          </Table.Cell>
          <Table.Cell compact={true} className="goss-vm-table-row__enrollment">
            <IsGOSSSupported vm={vm}>
              <input
                type="checkbox"
                disabled={isVmBeingEnrolled || !isEnrolledInService(vm, GOSSServices.OS_ADMINISTRATION) || !poweredOn}
                checked={
                  isEnrolledInService(vm, GOSSServices.OS_ADMINISTRATION) &&
                  isEnrolledInService(vm, GOSSServices.MONITORING)
                }
                onChange={() => stageEnrollment(vm, GOSSServices.MONITORING)}
                data-testid="vm-table-row-monitoring"
              />
            </IsGOSSSupported>
          </Table.Cell>
          <Table.Cell compact={true} className="goss-vm-table-row__enrollment">
            <IsGOSSSupported vm={vm}>
              <input
                type="checkbox"
                disabled={isVmBeingEnrolled || !isEnrolledInService(vm, GOSSServices.OS_ADMINISTRATION) || !poweredOn}
                checked={
                  isEnrolledInService(vm, GOSSServices.OS_ADMINISTRATION) &&
                  isEnrolledInService(vm, GOSSServices.PATCHING)
                }
                onChange={() => stageEnrollment(vm, GOSSServices.PATCHING)}
                data-testid="vm-table-row-patching"
              />
            </IsGOSSSupported>
          </Table.Cell>
        </React.Fragment>
      )}
    </Table.Row>
  );
};

const IsGOSSSupported = ({ vm, children }) => {
  if (isGOSSSupported(vm)) {
    return children;
  }
  return null;
};
