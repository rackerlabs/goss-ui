import React from 'react';
import { render, getNodeText } from '@testing-library/react';
import { toHaveAttribute } from '@testing-library/jest-dom';
import GenerateCSV from './GenerateCSV';

const testData = [
  ['Id', 'Name', 'Location'],
  ['test-id-1234', 'test-1', 'us-test-1'],
  ['test-id-4321', 'test-2', 'us-test-2'],
];

const filename = 'My Test     File.csv';

describe('<GenerateCSV />', () => {
  it('renders a button to download CSV file', () => {
    const page = render(<GenerateCSV data={testData} filename={filename} />);

    const button = page.getByTestId('csv-button');
    expect(button).toHaveAttribute('download', 'MyTestFile.csv');
    expect(button.firstChild).toContainHTML('<i class="fas fa-file-csv"> Export Enrollment Report</i>');
  });
});
