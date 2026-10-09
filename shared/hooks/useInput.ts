import { useContext } from 'react';
import { InputContext, type InputContextValue } from '../input/InputContext';

/** The input system (dispatcher and platform adapter), from the nearest `InputProvider`. */
export function useInput(): InputContextValue {
  const input = useContext(InputContext);
  if (!input) throw new Error('useInput must be used inside an InputProvider');
  return input;
}
