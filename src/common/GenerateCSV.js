import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import CSV from 'comma-separated-values';
import { Button } from '@janus.team/janus-particles';

/**
 * Component that handles the creation of a CSV file and provides a download button to access it.
 *
 *
 * @param {String} filename The name of the csv file. If it contains spaces they will be stripped.
 * @param {Array} data The data in which to create the file of. Required to be a list of lists.
 */
const GenerateCSV = ({ filename, data }) => {
  const [uri, setUri] = useState();
  useEffect(() => {
    const csvContent = new CSV(data).encode();
    const csvDataBlob = new Blob([csvContent]);
    const csvDataUri = URL.createObjectURL(csvDataBlob);
    setUri(csvDataUri);
  }, [data]);

  return (
    <Button
      as="a"
      download={filename.replace(/\s+/g, '')}
      target="_blank"
      href={uri}
      data-testid="csv-button"
    >
      Export Report
    </Button>
  );
};

GenerateCSV.propTypes = {
  filename: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
};

export default GenerateCSV;
