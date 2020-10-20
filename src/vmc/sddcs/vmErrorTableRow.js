import React from 'react';
import _ from 'lodash';
import { Table, KeyValuePair, DateTime } from '@janus.team/janus-particles';

export const VmErrorTableRow = ({ job }) => {
  return (
    <Table.Row data-testid="job-row">
      <Table.Cell className="goss-vm-table-row__job-state  goss-vm-table-row__job-error-state goss-vm-table-row__no-border"></Table.Cell>
      <Table.Cell className="goss-vm-table-cell__error-message">
        <KeyValuePair size="small">
          <span>Details</span>
          <span data-testid="job-message">
            {job.message ? job.message : 'An unexpected error has occurred, please contact your support team for help.'}
          </span>
        </KeyValuePair>
        <KeyValuePair size="small">
          <span>Date</span>
          <span data-testid="job-date">
            {job.stop_date > 0 ? (
              <DateTime value={new Date(job.stop_date * 1000).toUTCString()} />
            ) : (
              <DateTime value={new Date(job.start_date * 1000).toUTCString()} />
            )}
          </span>
        </KeyValuePair>
      </Table.Cell>
      {_.times(8, () => {
        return <Table.Cell className="goss-vm-table-cell__error-message" data-testid="job-empty-cell"></Table.Cell>;
      })}
    </Table.Row>
  );
};
