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
import { listJobs } from '../data/gcp/jobs';
import { getProject } from '../data/gcp/projects';
import { listVMs } from '../data/gcp/vms';
import { GCPVMDetailsSection } from './vms';
import { GCPSettingsSection } from './settings';

import { HARD_CODED_PROJECTS } from '../data/gcp/projects';
import { HARDCODED_VMS } from '../data/gcp/vms';
import { HARD_CODED_JOBS } from '../data/gcp/jobs';

export const ProjectDetail = ({ match }) => {
  const [request, setRequest] = React.useState({ loading: false, cached: false, error: null });
  const [jobs, setJobs] = React.useState([]);
  const [project, setProject] = React.useState({});
  const [vms, setVMs] = React.useState([]);

  usePoller(() => {
    (async () => {
      setRequest({ ...request, loading: true });

      try {
        const projectId = match.params.projectId;
        const [jobs, project, vms] = await Promise.all([
          listJobs({ projectId }),
          getProject({ id: projectId }),
          listVMs({ projectId }),
        ]);

        setJobs(HARD_CODED_JOBS);
        setProject(HARD_CODED_PROJECTS[0]);
        setVMs(HARDCODED_VMS);
        setRequest({ ...request, loading: false, cached: true, errors: null });
      } catch (err) {
        setRequest({ ...request, loading: false, error: err });
      }
    })();
  }, 30000);

  const title = <span data-testid="project-detail-title">{project.display_name}</span>;
  const action = (
    <Collection compact>
      <Button as={'a'} href={`dummy.link.to.gcp/abcd-1234`} target="_blank">
        GCP Console
      </Button>
    </Collection>
  );

  return (
    <React.Fragment>
      <Helmet>
        <title>{project.display_name}</title>
      </Helmet>
      <RequestStatusPanel {...request}>
        <Breadcrumbs>
          <Breadcrumbs.Breadcrumb.Parent>
            <Breadcrumbs.Link as={Link} to={'/goss/gcp/projects'}>
              Projects
            </Breadcrumbs.Link>
          </Breadcrumbs.Breadcrumb.Parent>
          <Breadcrumbs.Breadcrumb.Parent>GCP</Breadcrumbs.Breadcrumb.Parent>
          <Breadcrumbs.Breadcrumb.Current data-testid="project-detail-current-breadcrumb">
            {project.display_name}
          </Breadcrumbs.Breadcrumb.Current>
        </Breadcrumbs>
        <Page.MainHeader title={title} category="Google Cloud Platform Project" withSections={true} action={action} />
        <Page.MainBody>
          <hx-tabset>
            <hx-tablist>
              <hx-tab current={'true'}>Services</hx-tab>
              <hx-tab>Settings</hx-tab>
            </hx-tablist>
            <hx-tabcontent>
              <hx-tabpanel open>
                <GCPVMDetailsSection jobs={jobs} project={project} vms={vms} />
              </hx-tabpanel>
              <hx-tabpanel>
                <GCPSettingsSection project={project} jobs={jobs} setJobs={setJobs} vms={vms} />
              </hx-tabpanel>
            </hx-tabcontent>
          </hx-tabset>
        </Page.MainBody>
      </RequestStatusPanel>
    </React.Fragment>
  );
};

ProjectDetail.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
