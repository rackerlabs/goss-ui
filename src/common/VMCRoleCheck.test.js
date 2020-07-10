import React from 'react';
import { render, getNodeText } from '@testing-library/react';
import { VMCRoleCheck } from './VMCRoleCheck';

describe('VMCRoleCheck', () => {
  it('renders children if user has role', () => {
    const sessionContext = React.createContext({
      session: {
        user: {
          roles: [{ name: 'vmc' }],
        },
      },
    });
    const panel = render(<VMCRoleCheck sessionContext={sessionContext}>Hi</VMCRoleCheck>);
    expect(getNodeText(panel.container)).toBe('Hi');
  });

  it('renders beta banner if user does not have role', () => {
    const sessionContext = React.createContext({
      session: {
        user: {
          roles: [],
        },
      },
    });
    const panel = render(<VMCRoleCheck sessionContext={sessionContext}>Hi</VMCRoleCheck>);
    expect(panel.getByTestId('role-modal')).toBeTruthy();
  });
});
