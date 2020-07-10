import React from 'react';
import { render, getNodeText } from '@testing-library/react';
import { CustomerOnly } from './CustomerOnly';

describe('CustomerOnly', () => {
  it('renders nothing if user has Racker role', () => {
    const sessionContext = React.createContext({
      session: {
        user: {
          roles: [{ name: 'Racker' }],
        },
      },
    });
    const panel = render(<CustomerOnly sessionContext={sessionContext}>Hi</CustomerOnly>);
    expect(getNodeText(panel.container)).toEqual('');
  });

  it('renders children if user does not have Racker role', () => {
    const sessionContext = React.createContext({
      session: {
        user: {
          roles: [],
        },
      },
    });
    const panel = render(<CustomerOnly sessionContext={sessionContext}>Hi</CustomerOnly>);
    expect(getNodeText(panel.container)).toBe('Hi');
  });
});
