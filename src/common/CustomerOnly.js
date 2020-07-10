import _ from 'lodash';
import React from 'react';
import { context } from '@janus.team/janus-copilot/cjs/janus-copilot.js';

const RACKER_ROLE_NAME = 'Racker';

export const CustomerOnly = ({ children, sessionContext = context.session }) => {
  const session = React.useContext(sessionContext);
  const roles = _.get(session, ['session', 'user', 'roles'], []);

  if (roles.find(r => r.name === RACKER_ROLE_NAME)) {
    return null;
  }

  return children;
};
