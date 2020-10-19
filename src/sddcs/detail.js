import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs, Button, Collection, Page } from '@janus.team/janus-particles';
import { RequestStatusPanel } from '../common/RequestStatusPanel';
import { usePoller } from '../data/poller';
import { listJobs } from '../data/jobs';
import { getOrganization } from '../data/organizations';
import { getSDDC } from '../data/sddcs';
import { listVMs } from '../data/vms';
import { GOSSEnrollmentSection } from './goss';
import { GOSSSettingsSection } from './gossSettings';
import '../gossSettings.css';

import HelixUI from 'helix-ui/dist/js/helix-ui.min';
HelixUI.initialize();

export const SDDCDetail = ({ match }) => {
  const [request, setRequest] = React.useState({ loading: false, cached: false, error: null });
  const [jobs, setJobs] = React.useState([]);
  const [organization, setOrganization] = React.useState({});
  const [sddc, setSDDC] = React.useState({});
  const [vms, setVMs] = React.useState([]);
  const [domain, setDomain] = React.useState();

  usePoller(() => {
    (async () => {
      setRequest({ ...request, loading: true });

      try {
        const organizationId = match.params.organizationId;
        const sddcId = match.params.sddcId;
        const domain = match.params.domainId;
        const [jobs, org, sddc, vms] = await Promise.all([
          listJobs({ domain }),
          getOrganization({ id: organizationId, domain: domain }),
          getSDDC({ organizationId, sddcId, domain }),
          listVMs({ organizationId, sddcId, domain }),
        ]);

        setDomain(domain);
        setJobs(jobs);
        setOrganization(org);
        setSDDC(sddc);
        setVMs(vms);
        setRequest({ ...request, loading: false, cached: true, error: null });
      } catch (err) {
        setRequest({ ...request, loading: false, error: err });
      }
    })();
  }, 30000);

  const title = <span data-testid="sddc-detail-title">{sddc.name}</span>;
  const action = (
    <Collection compact>
      <Button
        as={'a'}
        href={`https://vmc.vmware.com/console/sddcs/aws/${sddc.id}/summary?orgLink=/csp/gateway/am/api/orgs/${organization.id}`}
        target="_blank"
        data-testid="sddc-detail-console"
      >
        VMC Console
      </Button>
      <Button as={'a'} href={sddc.vcenter_url} target="_blank" data-testid="sddc-detail-vcenter">
        vCenter
      </Button>
    </Collection>
  );

  return (
    <React.Fragment>
      <Helmet>
        <title>{sddc.name}</title>
      </Helmet>
      <RequestStatusPanel {...request}>
        <Breadcrumbs>
          <Breadcrumbs.Breadcrumb.Parent>
            <Breadcrumbs.Link as={Link} to={'/goss/vmc/organizations'}>
              Organizations
            </Breadcrumbs.Link>
          </Breadcrumbs.Breadcrumb.Parent>
          <Breadcrumbs.Breadcrumb.Parent>
            <Breadcrumbs.Link
              as={Link}
              to={`/goss/vmc/organizations/${organization.id}`}
              data-testid="sddc-detail-organization-breadcrumb"
            >
              {organization.display_name}
            </Breadcrumbs.Link>
          </Breadcrumbs.Breadcrumb.Parent>
          <Breadcrumbs.Breadcrumb.Parent>SDDCs</Breadcrumbs.Breadcrumb.Parent>
          <Breadcrumbs.Breadcrumb.Current data-testid="sddc-detail-sddc-breadcrumb">
            {sddc.name}
          </Breadcrumbs.Breadcrumb.Current>
        </Breadcrumbs>
        <Page.MainHeader title={title} category="Software Defined Data Center" withSections={true} action={action} />
        <Page.MainBody>
          <hx-tabset>
            <hx-tablist>
              <hx-tab current={'true'}>Services</hx-tab>
              <hx-tab>Settings</hx-tab>
            </hx-tablist>
            <hx-tabcontent>
              <hx-tabpanel open>
                <GOSSEnrollmentSection
                  domain={domain}
                  jobs={jobs}
                  setJobs={setJobs}
                  organization={organization}
                  sddc={sddc}
                  vms={vms}
                />
              </hx-tabpanel>
              <hx-tabpanel>
                <GOSSSettingsSection
                  domain={domain}
                  jobs={jobs}
                  setJobs={setJobs}
                  organization={organization}
                  sddc={sddc}
                  vms={vms}
                />
              </hx-tabpanel>
            </hx-tabcontent>
          </hx-tabset>
        </Page.MainBody>
      </RequestStatusPanel>
    </React.Fragment>
  );
};

SDDCDetail.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      organizationId: PropTypes.string.isRequired,
      sddcId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
