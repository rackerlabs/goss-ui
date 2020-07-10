import React from 'react';
import { render, getNodeText } from '@testing-library/react';
import { RequestStatusPanel } from './RequestStatusPanel';

describe('RequestStatusPanel', () => {
  it('renders children if data is cached', () => {
    const panel = render(<RequestStatusPanel cached={true}>Hi</RequestStatusPanel>);
    expect(getNodeText(panel.container)).toBe('Hi');
  });

  it('renders error if data is not cached and error is set', () => {
    const panel = render(
      <RequestStatusPanel cached={false} error={'Failed to fetch data'}>
        Hi
      </RequestStatusPanel>,
    );
    const error = panel.container.querySelector('.goss-request-status-panel__error');
    expect(getNodeText(error)).toContain('Failed to fetch data');
  });

  it('renders loading if data is not cached and loading is set', () => {
    const panel = render(
      <RequestStatusPanel cached={false} loading={true}>
        Hi
      </RequestStatusPanel>,
    );
    const spinner = panel.container.querySelector('.fa-spinner');
    expect(spinner).not.toBeNull();
  });

  it('renders children if no loading, no error, and no cached data', () => {
    const panel = render(<RequestStatusPanel>Hi</RequestStatusPanel>);
    expect(getNodeText(panel.container)).toBe('Hi');
  });
});
