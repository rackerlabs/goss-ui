import React from 'react';
import { render } from '@testing-library/react';
import { usePoller } from './poller';

jest.useFakeTimers();

const SampleComponent = ({ callback, interval }) => {
  usePoller(callback, interval);
  return <div></div>;
};

describe('usePoller', () => {
  it('executes callback immediately', () => {
    const callback = jest.fn();

    render(<SampleComponent callback={callback} interval={20} />);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('executes callback after one interval', () => {
    const callback = jest.fn();

    render(<SampleComponent callback={callback} interval={20} />);
    jest.advanceTimersByTime(20);

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('executes callback after two intervals', () => {
    const callback = jest.fn();

    render(<SampleComponent callback={callback} interval={20} />);
    jest.advanceTimersByTime(20);
    jest.advanceTimersByTime(20);

    expect(callback).toHaveBeenCalledTimes(3);
  });
});
