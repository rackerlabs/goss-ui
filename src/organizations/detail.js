import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumbs,
  Button,
  Card,
  Collection,
  DateTime,
  Grid,
  KeyValuePair,
  Page,
  Pill,
} from '@janus.team/janus-particles';
import { RequestStatusPanel } from '../common/RequestStatusPanel';
import { usePoller } from '../data/poller';
import { getOrganization } from '../data/organizations';
import { listSDDCs } from '../data/sddcs';
import { isGossEnabled } from '../config';

const SDDCCard = ({ organization, sddc, domain }) => {
  const card_name_span = <span data-testid="sddc-card-name">{sddc.name}</span>;
  const header = isGossEnabled() ? (
    <Link to={`/goss/vmc/organizations/${organization.id}/sddcs/${sddc.id}`} className="particles-card__header-link">
      {card_name_span}
      <i className="particles-card__header-caret fa fa-chevron-right fa-pull-right" />
    </Link>
  ) : (
    card_name_span
  );
  const footer = (
    <Card.Footer as={Collection} wrap={true}>
      <Button
        as={'a'}
        href={`https://vmc.vmware.com/console/sddcs/aws/${sddc.id}/summary?orgLink=/csp/gateway/am/api/orgs/${organization.id}`}
        target="_blank"
        data-testid="sddc-card-console"
      >
        VMC Console
      </Button>
      <Button as={'a'} href={sddc.vcenter_url} target="_blank" data-testid="sddc-card-vcenter">
        vCenter
      </Button>
    </Card.Footer>
  );

  return (
    <Card header={header} footer={footer} data-testid="sddc-card">
      <KeyValuePair vertical>
        <span>SDDC ID</span>
        <span data-testid="sddc-card-id">&nbsp;{sddc.id}</span>
      </KeyValuePair>
      <KeyValuePair vertical>
        <span>Region</span>
        <span data-testid="sddc-card-region">&nbsp;{sddc.region}</span>
      </KeyValuePair>
      <KeyValuePair vertical>
        <span>Hosts</span>
        <span data-testid="sddc-card-hosts">&nbsp;{sddc.hosts}</span>
      </KeyValuePair>
    </Card>
  );
};

export const OrganizationDetail = ({ match }) => {
  const [request, setRequest] = React.useState({ loading: false, cached: false, error: null });
  const [organization, setOrganization] = React.useState({});
  const [sddcs, setSDDCs] = React.useState([]);
  const [domain, setDomain] = React.useState({});

  usePoller(() => {
    (async () => {
      setRequest({ ...request, loading: true });

      try {
        const organizationId = match.params.organizationId;
        const domain = match.params.domainId;
        const [org, sddcs] = await Promise.all([
          getOrganization({ id: organizationId, domain: domain }),
          listSDDCs({ organizationId }),
        ]);
        setOrganization(org);
        setSDDCs(sddcs);
        setDomain(domain);
        setRequest({ ...request, loading: false, cached: true, error: null });
      } catch (err) {
        setRequest({ ...request, loading: false, error: err });
      }
    })();
  }, 30000);

  const title = <span data-testid="organization-detail-title">{organization.display_name}</span>;
  const action = (
    <Collection compact>
      <Button
        as={'a'}
        href={`https://vmc.vmware.com/home?orgLink=/csp/gateway/am/api/orgs/${organization.id}`}
        target="_blank"
        data-testid="organization-detail-console"
      >
        VMC Console
      </Button>
    </Collection>
  );

  return (
    <React.Fragment>
      <Helmet>
        <title>{organization.display_name}</title>
      </Helmet>
      <RequestStatusPanel {...request}>
        <Breadcrumbs>
          <Breadcrumbs.Breadcrumb.Parent>
            <Breadcrumbs.Link as={Link} to={'goss/vmc/organizations'}>
              Organizations
            </Breadcrumbs.Link>
          </Breadcrumbs.Breadcrumb.Parent>
          <Breadcrumbs.Breadcrumb.Current data-testid="organization-detail-breadcrumb">
            {organization.display_name}
          </Breadcrumbs.Breadcrumb.Current>
        </Breadcrumbs>
        <Page.MainHeader title={title} category="VMware Cloud Organization" withSections={true} action={action} />
        <Page.MainBody>
          <Page.MainBodySection title="Organization Details">
            <Grid>
              <Grid.Cell sm={10} md={8}>
                <KeyValuePair size="medium">
                  <span>Status</span>
                  <span data-testid="organization-detail-status">
                    <Pill color="green">{organization.status}</Pill>
                  </span>
                </KeyValuePair>
                <KeyValuePair size="medium">
                  <span>Organization ID</span>
                  <span data-testid="organization-detail-id">{organization.id}</span>
                </KeyValuePair>
                <KeyValuePair size="medium">
                  <span>Service Blocks</span>
                  <span>Platform Essentials</span>
                </KeyValuePair>
                <KeyValuePair size="medium">
                  <span>Created On</span>
                  <span data-testid="organization-detail-created">
                    <DateTime value={organization.created} preset="date-time-short" />
                  </span>
                </KeyValuePair>
              </Grid.Cell>
            </Grid>
          </Page.MainBodySection>
          <Page.MainBodySection title="Software Defined Datacenters (SDDC)">
            <Grid withGutters>
              {sddcs.map(sddc => (
                <Grid.Cell xs={12} sm={6} md={4} verticalGutter key={sddc.id}>
                  <SDDCCard organization={organization} sddc={sddc} domain={domain} />
                </Grid.Cell>
              ))}
            </Grid>
          </Page.MainBodySection>
        </Page.MainBody>
      </RequestStatusPanel>
    </React.Fragment>
  );
};
OrganizationDetail.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      organizationId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
