import _ from 'lodash';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Collection, Grid, KeyValuePair, Modal, Page } from '@janus.team/janus-particles';
import { usePoller } from '../data/poller';
import { GCPRoleCheck } from '../common/GCPRoleCheck';
import { listJobs } from '../data/gcp/jobs';
import { listProjects } from '../data/gcp/projects';
import { RequestStatusPanel } from '../common/RequestStatusPanel';
import { AccountStatusCheck } from '../common/AccountStatusCheck';

import { HARD_CODED_PROJECTS } from '../data/gcp/projects';

const ProjectCard = ({ project }) => {
  const header = (
    <Link to={`/goss/gcp/projects/${project.id}`} className="particles-card__header-link">
      <span data-testid="project-card-name">{project.display_name}</span>
      <i classname="particles-card__header-caret fa fa-chevron-right fa-pull-right" />
    </Link>
  );

  const footer = (
    <Card.Footer as={Collection} wrap={true}>
      <Button as={'a'} href={`dummy.link.to.gcp/${project.id}`} target="_blank">
        GCP Console
      </Button>
    </Card.Footer>
  );

  return (
    <Card header={header} footer={footer} inGrid={true} data-testid="project-card">
      <KeyValuePair vertical>
        <span>Project ID</span>
        <span data-testid="project-card-id">{project.id}</span>
      </KeyValuePair>
      <KeyValuePair vertical>
        <span>Stuff????</span>
        <span>More Stuff</span>
      </KeyValuePair>
    </Card>
  );
};
ProjectCard.propTypes = {
  project: PropTypes.object,
};

export const ProjectList = () => {
  const [request, setRequest] = React.useState({ loading: true, cached: false, error: null });
  const [projects, setProjects] = React.useState();

  usePoller(() => {
    (async () => {
      try {
        const [projects /*, any other data fields that need pre-fetching */] = await Promise.all([
          listProjects(),
          /* listJobs,
                    ...
                    etc. */
        ]);
        setProjects(projects);
        setRequest({ ...request, loading: false, cached: true, error: null });
      } catch (err) {
        setRequest({ ...request, loading: false, error: err });
      }
    })();
  }, 30000);

  return (
    // Uncomment to turn on role checking and activation modal
    // <GCPRoleCheck>
    <AccountStatusCheck>
      <React.Fragment>
        <Helmet>
          <title>Projects</title>
        </Helmet>
        <RequestStatusPanel {...request}>
          <Page.MainHeader title="GCP Projects" />
          <Page.MainBody>
            <Page.MainBodySection>
              <Grid withGutters>
                {HARD_CODED_PROJECTS.map(project => (
                  <Grid.Cell xs={12} sm={6} md={4} verticalGutter key={project.id}>
                    <ProjectCard project={project} />
                  </Grid.Cell>
                ))}
              </Grid>
            </Page.MainBodySection>
          </Page.MainBody>
        </RequestStatusPanel>
      </React.Fragment>
    </AccountStatusCheck>
    // </GCPRoleCheck>
  );
};
