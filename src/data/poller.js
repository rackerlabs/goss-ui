import React from 'react';

export const usePoller = (callback, interval) => {
  const callbackRef = React.useRef();

  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  React.useEffect(() => {
    callbackRef.current();

    const id = setInterval(() => {
      callbackRef.current();
    }, interval);

    return () => clearTimeout(id);
  }, [interval]);
};
