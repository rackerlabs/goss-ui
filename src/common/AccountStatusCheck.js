import React from 'react';
import { context } from '@janus.team/janus-copilot/cjs/janus-copilot.js';
import { Modal } from '@janus.team/janus-particles';
import { CardViewSkeleton } from './CardViewSkeleton';
import { RequestStatusPanel } from './RequestStatusPanel';
import { getCustomerAccount, isAccountActive } from '../data/vmc/customer';

export const AccountStatusCheck = ({ children, sessionContext = context.session }) => {
  const session = React.useContext(sessionContext);
  const [request, setRequest] = React.useState({ loading: true, cached: false, error: null });
  const [customerAccount, setCustomerAccount] = React.useState();

  React.useEffect(() => {
    (async () => {
      setRequest(r => ({ ...r, loading: true }));

      try {
        const data = await getCustomerAccount('CLOUD', session.session.user['RAX-AUTH:domainId']);
        setCustomerAccount(data);
        setRequest(r => ({ ...r, loading: false, cached: true, error: null }));
      } catch (err) {
        setRequest(r => ({ ...r, loading: false, error: err }));
      }
    })();
  }, [session]);

  return (
    <RequestStatusPanel {...request}>
      {request.cached === true && isAccountActive(customerAccount) ? (
        children
      ) : (
        <React.Fragment>
          <CardViewSkeleton />
          <div
            className="goss-modal goss-modal--education goss-modal--captive goss-modal--spinner"
            data-testid="account-status-modal"
          >
            <Modal>
              <Modal.Header title="Account Verification in Progress" />
              <div className="particles-modal__steps">
                <i className="fa fa-spinner fa-spin fa-2x" />
              </div>
              <Modal.Body>Your account is currently undergoing verification and should be ready shortly.</Modal.Body>
            </Modal>
          </div>
        </React.Fragment>
      )}
    </RequestStatusPanel>
  );
};
