import _ from 'lodash';
import React from 'react';
import { render } from '@testing-library/react';
import { Wizard } from './Wizard';

const renderWizard = ({ onClose = _.noop } = {}) => {
  let capturedProps = { wizard: null };

  const CaptureProps = ({ wizard, children, ...props }) => {
    capturedProps.wizard = wizard;
    return <div {...props}>{children}</div>;
  };

  const wizard = render(
    <Wizard onClose={onClose}>
      <CaptureProps data-testid="one">One</CaptureProps>
      <CaptureProps data-testid="two">Two</CaptureProps>
      <CaptureProps data-testid="three">Three</CaptureProps>
    </Wizard>,
  );

  return [wizard, capturedProps];
};

describe('Wizard', () => {
  it('renders first child initially', () => {
    const [wizard, props] = renderWizard();

    expect(wizard.queryAllByTestId('one')).toHaveLength(1);
    expect(wizard.queryAllByTestId('two')).toHaveLength(0);
    expect(wizard.queryAllByTestId('three')).toHaveLength(0);
    expect(props.wizard.current()).toBe(0);
    expect(props.wizard.total()).toBe(3);
  });

  it('renders next child when previous is called', () => {
    const [wizard, props] = renderWizard();

    props.wizard.next();

    expect(wizard.queryAllByTestId('one')).toHaveLength(0);
    expect(wizard.queryAllByTestId('two')).toHaveLength(1);
    expect(wizard.queryAllByTestId('three')).toHaveLength(0);
    expect(props.wizard.current()).toBe(1);
    expect(props.wizard.total()).toBe(3);
  });

  it('renders previous child when previous is called', () => {
    const [wizard, props] = renderWizard();

    props.wizard.next();
    props.wizard.previous();

    expect(wizard.queryAllByTestId('one')).toHaveLength(1);
    expect(wizard.queryAllByTestId('two')).toHaveLength(0);
    expect(wizard.queryAllByTestId('three')).toHaveLength(0);
    expect(props.wizard.current()).toBe(0);
    expect(props.wizard.total()).toBe(3);
  });

  it('stops going forwards when no more children exist', () => {
    const [wizard, props] = renderWizard();

    props.wizard.next();
    props.wizard.next();
    props.wizard.next();
    props.wizard.next();
    props.wizard.next();

    expect(wizard.queryAllByTestId('one')).toHaveLength(0);
    expect(wizard.queryAllByTestId('two')).toHaveLength(0);
    expect(wizard.queryAllByTestId('three')).toHaveLength(1);
    expect(props.wizard.current()).toBe(2);
    expect(props.wizard.total()).toBe(3);
  });

  it('stops going backwards when no more children exist', () => {
    const [wizard, props] = renderWizard();

    props.wizard.previous();
    props.wizard.previous();
    props.wizard.previous();
    props.wizard.previous();
    props.wizard.previous();

    expect(wizard.queryAllByTestId('one')).toHaveLength(1);
    expect(wizard.queryAllByTestId('two')).toHaveLength(0);
    expect(wizard.queryAllByTestId('three')).toHaveLength(0);
    expect(props.wizard.current()).toBe(0);
    expect(props.wizard.total()).toBe(3);
  });

  it('executes callback on exit', () => {
    const onClose = jest.fn();
    const [wizard, props] = renderWizard({ onClose }); // eslint-disable-line no-unused-vars

    props.wizard.onClose();

    expect(onClose).toHaveBeenCalled();
  });
});
