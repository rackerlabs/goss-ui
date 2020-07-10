import React from 'react';
import { context } from '@janus.team/janus-copilot/cjs/janus-copilot.js';
import { Button, Modal } from '@janus.team/janus-particles';
import { CardViewSkeleton } from './CardViewSkeleton';

const VMC_ROLE_NAME = 'vmc';

export const VMCRoleCheck = ({ children, sessionContext = context.session }) => {
  const session = React.useContext(sessionContext);
  const roles = session.session.user.roles;

  if (roles.find(r => r.name === VMC_ROLE_NAME)) {
    return children;
  }

  return (
    <React.Fragment>
      <CardViewSkeleton />
      <div className="vmc-modal vmc-modal--education vmc-modal--captive" data-testid="role-modal">
        <Modal>
          <Modal.Header title="VMware Cloud on AWS" />
          <Modal.Body>
            Welcome to Rackspace Managed VMware Cloud on AWS! This service has not yet been enabled for your account.
            Please reach out to your account manager to learn more about this service and request access.
          </Modal.Body>
          <Modal.Footer>
            <Button primary size="large" as="a" href="https://portal.rackspace.com/tickets/create" target="_blank">
              Request Access
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </React.Fragment>
  );
};
