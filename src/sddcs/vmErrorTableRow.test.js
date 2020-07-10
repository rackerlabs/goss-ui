import React from 'react';
import { render, fireEvent, getByTestId, waitForDomChange } from '@testing-library/react';
import { VmErrorTableRow } from './vmErrorTableRow';

let job = {
  message: 'Testing Error!',
  start_date: 1584316800, // 2020-03-16 @ 12:00 AM (UTC)
  stop_date: 1584360000, // 2020-03-16 @ 12:00 PM (UTC)
};
const renderPage = props => {
  const tree = <VmErrorTableRow job={job} />;
  return render(tree);
};

describe('VmErrorTableRow', () => {
  it('renders the row properly', async () => {
    const page = renderPage();
    const emptyCells = page.getAllByTestId('job-empty-cell');

    expect(page.getByTestId('job-message').innerHTML).toBe('Testing Error!');
    expect(page.getByTestId('job-date').innerHTML).toMatch(/March 16, 2020 12:00:00 PM/);
    expect(emptyCells.length).toBe(5);
  });

  it('renders a default message if the job message is empty', async () => {
    job.message = null;
    const page = renderPage();

    expect(page.getByTestId('job-message').innerHTML).toBe(
      'An unexpected error has occurred, please contact your support team for help.',
    );
  });

  it("renders the start date in the date if the job's stop_date is null ", async () => {
    job.stop_date = null;
    const page = renderPage();

    expect(page.getByTestId('job-date').innerHTML).toMatch(/March 16, 2020 12:00:00 AM/);
  });
});
