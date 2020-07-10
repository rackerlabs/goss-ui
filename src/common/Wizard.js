import PropTypes from 'prop-types';
import React from 'react';

export const Wizard = ({ initialStep = 0, onClose, children }) => {
  const [currentStep, setCurrentStep] = React.useState(initialStep);
  const wizard = {
    current: () => currentStep,
    total: () => children.length,
    next: () => setCurrentStep(Math.min(currentStep + 1, children.length - 1)),
    previous: () => setCurrentStep(Math.max(currentStep - 1, 0)),
    onClose,
  };

  return React.cloneElement(children[currentStep], { wizard });
};

Wizard.propTypes = {
  initialStep: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};
