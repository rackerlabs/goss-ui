import React from 'react';

const RequestStatusPanelContainer = ({ children }) => {
  return (
    <div className="goss-request-status-panel">
      <div className="goss-request-status-panel__inner">{children}</div>
    </div>
  );
};

const RequestStatusPanelLoading = () => {
  return (
    <RequestStatusPanelContainer>
      <div className="goss-request-status-panel__loading">
        <i className="fa fa-spinner fa-spin fa-3x" />
      </div>
    </RequestStatusPanelContainer>
  );
};

const RequestStatusPanelError = ({ error }) => {
  return (
    <RequestStatusPanelContainer>
      <div className="goss-request-status-panel__error">
        <i className="fa fa-exclamation-circle" />
        &nbsp;&nbsp;
        {error.toString()}
      </div>
    </RequestStatusPanelContainer>
  );
};

export const RequestStatusPanel = ({ loading, cached, error, children }) => {
  if (cached) {
    return children;
  } else if (error) {
    return <RequestStatusPanelError error={error} />;
  } else if (loading) {
    return <RequestStatusPanelLoading />;
  }

  return children;
};
