import Helmet from 'react-helmet';
import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';
import { ApplicationContainer } from '@janus.team/janus-copilot/cjs/janus-copilot.js';
import { Page } from '@janus.team/janus-particles';
import { OrganizationList, OrganizationDetail } from './organizations';
import { Footer } from './layout/Footer';
import * as copilot from './copilot';
import { SDDCDetail } from './sddcs';

const CustomerApp = ({ match }) => {
  const copilotProps = {
    ...copilot.config,
    catalogOverrides: copilot.customerCatalog,
  };

  return (
    <ApplicationContainer {...copilotProps}>
      <ApplicationContainer.Authenticating>
        <ApplicationContainer.LoadingIndicator>
          <i className="fa fa-spinner fa-spin fa-3x" />
        </ApplicationContainer.LoadingIndicator>
      </ApplicationContainer.Authenticating>
      <ApplicationContainer.Ready>
        <CustomerAppReady />
      </ApplicationContainer.Ready>
    </ApplicationContainer>
  );
};

const CustomerAppReady = () => {
  return (
    <Page>
      <Page.Main>
        <Switch>
          <Route path="/goss/vmc/organizations/:organizationId/sddcs/:sddcId" component={SDDCDetail} />
          <Route path="/goss/vmc/organizations/:organizationId" component={OrganizationDetail} />
          <Route path="/goss/vmc/organizations" component={OrganizationList} />
          <Redirect path="/" to="/goss/vmc/organizations" />
        </Switch>
      </Page.Main>
      <Footer />
    </Page>
  );
};

const App = () => {
  return (
    <React.Fragment>
      <Helmet titleTemplate="%s | Operating System Services | Rackspace"></Helmet>
      <Switch>
        <Route path="/racker*" render={CustomerApp} />
        <Route path="/*" component={CustomerApp} />
      </Switch>
    </React.Fragment>
  );
};

export default App;
