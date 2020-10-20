import React from 'react';
import { AlertBar, Button, Collection, Modal, Page, Table, Popover, Card, Grid } from '@janus.team/janus-particles';
import _ from 'lodash';
import { VmErrorTableRow } from '../vmc/sddcs/vmErrorTableRow';

export const GCPVMDetailsSection = ({ jobs, project, vms }) => {
  const [isWaitingForJobUpdate, setWaitingForJobUpdate] = React.useState(false);
  const [visibleErrorList, setVisibleErrorList] = React.useState([]);

  React.useEffect(() => {
    setWaitingForJobUpdate(false);
  }, [jobs]);

  const findJobError = vm => {
    let job = _.findLast(_.sortBy(jobs, ['stop_date']), ['vm_uuid', vm.uuid]);
    return !!job && job.status === 'ERROR' ? job : null;
  };

  const addVisibleError = (vm_uuid, selected) => {
    setVisibleErrorList({ ...visibleErrorList, [vm_uuid]: selected });
  };

  return (
    <Page.MainBodySection className="goss-gcp-services-main-body-section">
      <br />
      <Table.Wrapper>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Cell header={true} compact={true} className="goss-vm-table-row__job-state">
                Status
              </Table.Cell>
              <Table.Cell header={true} compact={true} className="goss-services-vm-table-row__name">
                Instance
              </Table.Cell>
              <Table.Cell header={true} compact={true} className="goss-vm-table-row__tags">
                Tags
              </Table.Cell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {vms.map(vm => {
              return (
                <React.Fragment>
                  <VMTableRow
                    key={vm.config$instanceUuid}
                    project={project}
                    vm={vm}
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

const VMTableRow = ({ project, vm, hasJobError, visibleErrorList, addVisibleError }) => {
  const [isShowingVmMenu, setIsShowingVmMenu] = React.useState(false);
  const toggleShowVmMenu = () => {
    setIsShowingVmMenu(!isShowingVmMenu);
  };

  return (
    <Table.Row data-testid="vm-table-row">
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
          //   account={organization.domain}
          //   awsaccount={organization.systems_account}
          //   platform={guestFamilyDisplayName(vm)}
          //   targetid={managedInstanceId(vm)}
          //   region={sddc.region}
        />
        <div>
          <strong data-testid="vm-table-row-name">{vm.name}</strong>
        </div>
      </Table.Cell>
      <Table.Cell compact={true}>{vm?.tagGroups}</Table.Cell>
    </Table.Row>
  );
};
