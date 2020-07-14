import React from 'react';
import {
  Button,
  Page,
  Table,
  Grid,
  KeyValuePair
} from '@janus.team/janus-particles';
import {fetch} from "../data/fetch";
import {usePoller} from "../data/poller";

import './gossSettings.css';
import '@fortawesome/fontawesome-free/css/all.css';
import '@janus.team/janus-particles/dist/particles.css';

export const GOSSSettingsSection = ({ domain, jobs, setJobs, organization, sddc, vms }) => {

  const ConfigureAntiVirus = ({}) => {
    return (
        <Page.MainBodySection title="Anti-Virus">
        </Page.MainBodySection>
    );
  };

  const ConfigureBackup = ({}) => {
    return (
        <Page.MainBodySection title="Backup">
        </Page.MainBodySection>
    );
  };

  const ConfigureDisasterRecovery = ({}) => {
    return (
        <Page.MainBodySection title="Disaster Recovery">
        </Page.MainBodySection>
    );
  };

  const ConfigureMonitoring = ({sddcId, domain}) => {
    const [request, setRequest] = React.useState({loading: false, cached: false, error: null});
    const [configValues, setConfigValues] = React.useState({});
    const tagGroups = [
      {
        "name":"Production-Linux",
        "id": "12345",
        "createDate": "03-03-2020  5:35:27PM",
        "lastModifiedDate":"06-15-2020  2:07:03PM",
        "editorEmail": "sean.thrailkill@rackspace.com",
        "notes": "All Production Linux and Windows servers irrespective of OS Family",
        "systemTags": ["Production"]
      }
    ];

    const getConfigValues = async ({sddcId, domain}) => {
      const config = domain ? {headers: {'X-Tenant-Id': domain}} : {};
      const res = await fetch(`/api/vmc/v1.0/metrics/${sddcId.id}/monitoring`, config);
      const body = await res.json();
      return body.data.items;
    };

    usePoller(() => {
      (async () => {
        setRequest({...request, loading: true});

        try {
          const [configValues] = await Promise.all([
            getConfigValues({sddcId, domain}),
          ]);

          setConfigValues(configValues);
          setRequest({...request, loading: false, cached: true, error: null});
        } catch (err) {
          setRequest({...request, loading: false, error: err});
        }
      })();
    }, 30000);

    const addMonitoringGroup = ({}) => {
      // TODO: Add functionality
      return null
    }

    const deleteMonitoringGroup = ({}) => {
      // TODO: Add functionality
      return null
    }

    return (
        <Page.MainBodySection title="Monitoring">
          <Button primary data-testid="monitoring-action-add" onClick={addMonitoringGroup}>
            Add
          </Button>
          &nbsp;&nbsp;
          <Button data-testid="monitoring-action-delete" onClick={deleteMonitoringGroup}>
            Delete
          </Button>
          <Table.Wrapper>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Cell header={true} compact={true} className="goss-monitoring-table-row__checkbox" />
                  <Table.Cell header={true} compact={true} className="goss-monitoring-table-row__group">
                    Monitoring Group
                  </Table.Cell>
                  <Table.Cell header={true} compact={true} className="goss-monitoring-table-row__createDate">
                    Creation Date
                  </Table.Cell>
                  <Table.Cell header={true} compact={true} className="goss-monitoring-table-row__lastModifiedDate">
                    Last Modified Date
                  </Table.Cell>
                  <Table.Cell header={true} compact={true} className="goss-monitoring-table-row__editorEmail">
                    Editor Email
                  </Table.Cell>
                </Table.Row>
              </Table.Header>
                {tagGroups.map(tagGroup => {
                  return (
                    <React.Fragment>
                      <MonitoringTableRow tagGroup={tagGroup} id={"monitoring-config-row-" + tagGroup.id}/>
                    </React.Fragment>
                  )
                })}
            </Table>
          </Table.Wrapper>
        </Page.MainBodySection>
    );
  }

  const MonitoringTableRow = ({ tagGroup }) => {
    const [isShowingMonitoringConfig, setIsShowingMonitoringConfig] = React.useState(false);
    const [canModifyMonitoringRow, setCanModifyMonitoringRow] = React.useState(false);

    return (
      <Table.Body>
        <Table.Row data-testid="monitoring-table-row">
          <Table.Cell compact={true}>
            <input type="checkbox" data-testid="monitoring-table-row-checkbox"/>
          </Table.Cell>
          <Table.Cell compact={true}>
            <Button
                tertiary
                onClick={() => {
                  setIsShowingMonitoringConfig(!isShowingMonitoringConfig);
                }}
                data-testid="display-monitoring-settings"
            >
              {isShowingMonitoringConfig ? (
                  <i className="fa fa-chevron-down particles-navigation-dropdown__caret" aria-hidden="true"></i>
              ) : (
                  <i className="fa fa-chevron-right particles-navigation-dropdown__caret" aria-hidden="true"></i>
              )}
              <strong className={"monitoring-table-row-name"} data-testid="monitoring-table-row-name">{tagGroup.name}</strong>
            </Button>
          </Table.Cell>
          <Table.Cell compact={true} data-testid="monitoring-table-row-create-date">{tagGroup.createDate}</Table.Cell>
          <Table.Cell compact={true} data-testid="monitoring-table-row-last-modified-date">{tagGroup.lastModifiedDate}</Table.Cell>
          <Table.Cell compact={true} data-testid="monitoring-table-row-editor-email">{tagGroup.editorEmail}</Table.Cell>
        </Table.Row>
        <MonitoringConfigToggleRow tagGroup={tagGroup} isShowingMonitoringConfig={isShowingMonitoringConfig} setCanModifyMonitoringRow={setCanModifyMonitoringRow} canModifyMonitoringRow={canModifyMonitoringRow}/>
        <MonitoringConfigSettingsRow tagGroup={tagGroup} isShowingMonitoringConfig={isShowingMonitoringConfig} canModifyMonitoringRow={canModifyMonitoringRow}/>
      </Table.Body>
    );
  };

  const MonitoringConfigToggleRow = ({ tagGroup, isShowingMonitoringConfig, setCanModifyMonitoringRow, canModifyMonitoringRow }) => {
    return (
        <Table.Row style={{display: isShowingMonitoringConfig ? 'table-row' : 'none' }}>
          <Table.Cell colSpan={5} className={"noBorder"}>
            <div>
                <Button onClick={() => {setCanModifyMonitoringRow(!canModifyMonitoringRow);}} data-testid="display-monitoring-config-modify">
                  Modify
                </Button>
            </div>
          </Table.Cell>
        </Table.Row>
    );
  };

  const MonitoringConfigSettingsRow = ({ tagGroup, isShowingMonitoringConfig, canModifyMonitoringRow }) => {

    const configValues = {
      "linux": {
        "alarms_cpu": 95,
        "alarms_memory": 95,
        "alarms_disk_free_space": 524288000,
        "alarms_disk_used_percent": 95
      },
      "windows": {
        "alarms_cpu": 95,
        "alarms_memory": 95,
        "alarms_disk_free_space": 524288000,
        "alarms_disk_used_percent": 95
      }
    }
    if(canModifyMonitoringRow) return (
        <Table.Row style={{display: isShowingMonitoringConfig ? 'table-row' : 'none' }}>
          <Table.Cell colSpan={5} className={"noBorder"}>
            <Grid colSpan={4}>
              <Grid.Cell sm={12} md={6} lg={6}>
                <h3>Linux</h3>
                <KeyValuePair size="medium">
                  <span>CPU Alert</span>
                  <input type="text" name="alarms_cpu" data-testid="sddc-monitoring-linux-alarms-cpu"
                         value={configValues.linux.alarms_cpu} placeholder="EX: 95"/>
                </KeyValuePair>
                <KeyValuePair size="medium">
                  <span>Memory Alert</span>
                  <input type="text" name="alarms_memory" data-testid="sddc-monitoring-linux-alarms-memory"
                         value={configValues.linux.alarms_memory} placeholder="EX: 95"/>
                </KeyValuePair>
                <KeyValuePair size="medium">
                  <span>Disk Space Free Alert</span>
                  <input type="text" name="alarms_disk_free_space"
                         data-testid="sddc-monitoring-linux-alarms-disk-free-space"
                         value={configValues.linux.alarms_disk_free_space} placeholder="EX: 524288000"/> Bytes
                </KeyValuePair>
                <KeyValuePair size="medium">
                  <span>Disk Space Used Alert</span>
                  <input type="text" name="alarms_disk_used_percent"
                         data-testid="sddc-monitoring-linux-alarms-disk-used-percent"
                         value={configValues.linux.alarms_disk_used_percent} placeholder="EX: 95"/>
                </KeyValuePair>
              </Grid.Cell>
              <Grid.Cell sm={12} md={6} lg={6}>
                <h3>Windows</h3>
                <KeyValuePair size="medium">
                  <span>CPU Alert Percentage</span>
                  <input type="text" name="alarms_cpu" data-testid="sddc-monitoring-windows-alarms-cpu"
                         value={configValues.windows.alarms_cpu} placeholder="EX: 95"/>
                </KeyValuePair>
                <KeyValuePair size="medium">
                  <span>Memory Alert Percentage</span>
                  <input type="text" name="alarms_memory" data-testid="sddc-monitoring-windows-alarms-memory"
                         value={configValues.windows.alarms_memory} placeholder="EX: 95"/>
                </KeyValuePair>
                <KeyValuePair size="medium">
                  <span>Disk Space Free Alert (In MB)</span>
                  <input type="text" name="alarms_disk_free_space"
                         data-testid="sddc-monitoring-windows-alarms-disk-free-space"
                         value={configValues.windows.alarms_disk_free_space} placeholder="EX: 500"/>
                </KeyValuePair>
                <KeyValuePair size="medium">
                  <span>Disk Space Used Alert</span>
                  <input type="text" name="alarms_disk_used_percent"
                         data-testid="sddc-monitoring-windows-alarms-disk-used-percent"
                         value={configValues.windows.alarms_disk_used_percent} placeholder="EX: 95"/>
                </KeyValuePair>
              </Grid.Cell>
            </Grid>
          </Table.Cell>
        </Table.Row>
    )
    else{
      return (
      <Table.Row style={{display: isShowingMonitoringConfig ? 'table-row' : 'none' }}>
        <Table.Cell colSpan={5} className={"noBorder"}>
          <div>
            <div>
              <h3>Notes</h3>
              {tagGroup.notes}
            </div>
            <div>
              <div className={"monitoring-config-view-left"}>
                <h3>System Tags</h3>
                {tagGroup.systemTags.forEach(tag => {
                  return (
                      <div>{tag}</div>
                  )
                })}
              </div>
              <div className={"monitoring-config-view-left"}>
                <h3>Linux</h3>
                <KeyValuePair size="medium">
                  <span>CPU Alert:</span>
                  <span>{configValues.linux.alarms_cpu}%</span>
                </KeyValuePair>
                <KeyValuePair size="medium">
                  <span>Memory Alert:</span>
                  <span>{configValues.linux.alarms_memory}%</span>
                </KeyValuePair>
                <KeyValuePair size="medium">
                  <span>Disk Space Free Alert:</span>
                  <span>{configValues.linux.alarms_disk_free_space} MB</span>
                </KeyValuePair>
                <KeyValuePair size="medium">
                  <span>Disk Space Used Alert:</span>
                  <span>{configValues.linux.alarms_disk_used_percent}%</span>
                </KeyValuePair>
              </div>
              <div className={"monitoring-config-view-left"}>
                <h3>Windows</h3>
                <KeyValuePair size="medium">
                  <span>CPU Alert:</span>
                  <span>{configValues.windows.alarms_cpu}%</span>
                </KeyValuePair>
                <KeyValuePair size="medium">
                  <span>Memory Alert:</span>
                  <span>{configValues.windows.alarms_memory}%</span>
                </KeyValuePair>
                <KeyValuePair size="medium">
                  <span>Disk Space Free Alert:</span>
                  <span>{configValues.windows.alarms_disk_free_space} MB</span>
                </KeyValuePair>
                <KeyValuePair size="medium">
                  <span>Disk Space Used Alert:</span>
                  <span>{configValues.windows.alarms_disk_used_percent}%</span>
                </KeyValuePair>
              </div>
            </div>
          </div>
        </Table.Cell>
      </Table.Row>
      )
    }
  };

  const ConfigurePatching = ({}) => {
    return (
        <Page.MainBodySection title="Patching">
        </Page.MainBodySection>
    );
  };

  if(vms.length == 0) {
    return (
        <Page.MainBody>
          <div>To configure Guest OS Services, you must first enroll instances in some services.</div>
          <br/>
          <div>To get started, see your <a href="#">unenrolled instances on the services tab.</a></div>
        </Page.MainBody>
    );
  }
  else{
    return (
      <Page.MainBody>
        <ConfigureAntiVirus/>
        <ConfigureBackup/>
        <ConfigureDisasterRecovery/>
        <ConfigureMonitoring sddcId={sddc} domain={domain} />
        <ConfigurePatching/>
      </Page.MainBody>
    );
  }
}
