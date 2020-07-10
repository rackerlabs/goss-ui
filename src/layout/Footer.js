import React from 'react';
import { Navigation } from '@janus.team/janus-particles';

export const Footer = () => {
  return (
    <Navigation className="goss-footer">
      <Navigation.Utility>
        <Navigation.Menu utility>
          <Navigation.Text>&copy; {new Date().getFullYear()} Rackspace US, Inc.</Navigation.Text>
          <Navigation.Link utility href="http://www.rackspace.com/information/legal/websiteterms" target="_blank">
            Website Terms
          </Navigation.Link>
          <Navigation.Link utility href="http://www.rackspace.com/information/legal/privacystatement" target="_blank">
            Privacy Policy
          </Navigation.Link>
        </Navigation.Menu>
      </Navigation.Utility>
    </Navigation>
  );
};
