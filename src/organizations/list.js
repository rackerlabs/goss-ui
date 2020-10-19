import _ from 'lodash';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Collection, Grid, KeyValuePair, Modal, Page } from '@janus.team/janus-particles';
import { usePoller } from '../../data/poller';
import { listJobs } from '../../data/vmc/jobs';
import { listOrganizations } from '../../data/vmc/organizations';
import { CardViewSkeleton } from '../../common/CardViewSkeleton';
import { RequestStatusPanel } from '../../common/RequestStatusPanel';
import { Redirect } from 'react-router-dom';
import { AccountStatusCheck } from '../common/AccountStatusCheck';
import { VMCRoleCheck } from '../common/VMCRoleCheck';

const PendingCreationModal = () => {
  return (
    <React.Fragment>
      <CardViewSkeleton />
      <div
        className="goss-modal goss-modal--education goss-modal--captive goss-modal--spinner"
        data-testid="organization-pending-modal"
      >
        <Modal>
          <Modal.Header title="Organization Creation in Progress" />
          <div className="particles-modal__steps">
            <i className="fa fa-spinner fa-spin fa-2x" />
          </div>
          <Modal.Body>
            Your Rackspace teams are working hard to get your initial VMware Cloud on AWS organization ready. Once the
            setup is complete you can proceed and someone will contact you to for the next steps to create a SDDC.
          </Modal.Body>
        </Modal>
      </div>
    </React.Fragment>
  );
};

const OrganizationCard = ({ organization }) => {
  const header = (
    <Link to={`/goss/vmc/organizations/${organization.id}`} className="particles-card__header-link">
      <span data-testid="organization-card-name">{organization.display_name}</span>
      <i className="particles-card__header-caret fa fa-chevron-right fa-pull-right" />
    </Link>
  );

  const footer = (
    <Card.Footer as={Collection} wrap={true}>
      <Button
        as={'a'}
        href={`https://vmc.vmware.com/home?orgLink=/csp/gateway/am/api/orgs/${organization.id}`}
        target="_blank"
      >
        VMC Console
      </Button>
    </Card.Footer>
  );

  return (
    <Card header={header} footer={footer} inGrid={true} data-testid="organization-card">
      <KeyValuePair vertical>
        <span>Organization ID</span>
        <span data-testid="organization-card-id">{organization.id}</span>
      </KeyValuePair>
      <KeyValuePair vertical>
        <span>Service Blocks</span>
        <span>Platform Essentials</span>
      </KeyValuePair>
    </Card>
  );
};
OrganizationCard.propTypes = {
  organization: PropTypes.object,
};

export const OrganizationList = () => {
  const [request, setRequest] = React.useState({ loading: true, cached: false, error: null });
  const [jobs, setJobs] = React.useState();
  const [organizations, setOrganizations] = React.useState();
  const transformedOrgs = transformOrganizationList(organizations) || [];

  usePoller(() => {
    (async () => {
      setRequest({ ...request, loading: true });

      try {
        const [jobs, orgs] = await Promise.all([listJobs(), listOrganizations()]);
        setJobs(jobs);
        setOrganizations(orgs);
        setRequest({ ...request, loading: false, cached: true, error: null });
      } catch (err) {
        setRequest({ ...request, loading: false, error: err });
      }
    })();
  }, 30000);

  if (transformedOrgs.length === 1) {
    return <Redirect path="/organizations" to={`/organizations/${transformedOrgs[0].id}`} />;
  } else if (isOrgPendingCreation(transformedOrgs, jobs)) {
    return <PendingCreationModal />;
  }

  return (
    <VMCRoleCheck>
      <AccountStatusCheck>
        <React.Fragment>
          <Helmet>
            <title>Organizations</title>
          </Helmet>
          <RequestStatusPanel {...request}>
            <Page.MainHeader title="VMware Cloud Organizations" />
            <Page.MainBody>
              <Page.MainBodySection>
                <Grid withGutters>
                  {isOrgCreationComplete(transformedOrgs) &&
                    transformedOrgs.map(org => (
                      <Grid.Cell xs={12} sm={6} md={4} verticalGutter key={org.id}>
                        <OrganizationCard organization={org} />
                      </Grid.Cell>
                    ))}
                </Grid>
              </Page.MainBodySection>
            </Page.MainBody>
          </RequestStatusPanel>
        </React.Fragment>
      </AccountStatusCheck>
    </VMCRoleCheck>
  );
};

export const transformOrganizationList = organizations => {
  const visibleOrgStatuses = ['ACTIVE', 'PENDING_VMC_CREATION'];
  return _.chain(organizations)
    .filter(o => visibleOrgStatuses.includes(o.status))
    .sortBy('display_name')
    .value();
};

const isOrgPendingCreation = (orgs, jobs) => {
  const pendingJobStatuses = ['RUNNING', 'FAILED', 'TIMED_OUT', 'ABORTED'];

  return (
    orgs.length === 0 &&
    _.some(jobs, job => {
      return job.type === 'create-organization' && _.includes(pendingJobStatuses, job.status);
    })
  );
};

const isOrgCreationComplete = orgs => {
  return orgs.length > 0;
};
